#!/usr/bin/env node
/**
 * generate-n8n-workflow.js
 * 
 * Generates the complete SIGNAL n8n workflow JSON with:
 *   - Phase 1: DataSources webhook, SyncTrigger webhook, metadata writing
 *   - Phase 2: Un-disabled KPI sub-flow with rewritten Simplify KPI Data
 *   - Phase 3: Rewritten LLM prompts, Insights webhook
 *   - Env variable references replacing hardcoded config
 *   - CORS headers on all webhook responses
 *
 * Usage: node generate-n8n-workflow.js > n8n-signal-workflow.json
 */

// ── Shared Credentials (IDs from existing workflow) ──
const GOOGLE_SHEETS_CRED = { googleSheetsOAuth2Api: { id: "Wzla15JVISoyJgdu", name: "Google Sheets account" } };
const PINECONE_CRED = { pineconeApi: { id: "cgLcpihxz5xVUy6n", name: "PineconeApi account" } };
const OPENAI_CRED = { openAiApi: { id: "e4gkhQrNWMI5phYH", name: "OpenAi account" } };
const OPENROUTER_CRED = { openRouterApi: { id: "b5R2CZo1ex5fWzCy", name: "OpenRouter account" } };

// ── Respond node CORS options ──
const CORS_OPTIONS = {
    responseHeaders: {
        entries: [
            { name: "Access-Control-Allow-Origin", value: "*" },
            { name: "Access-Control-Allow-Methods", value: "GET,POST,OPTIONS" },
            { name: "Access-Control-Allow-Headers", value: "Content-Type,X-Signal-Key" }
        ]
    }
};

// ── Per-lane LLM system prompt (Phase 3 rewrite) ──
const LANE_LLM_SYSTEM_PROMPT = `You are a grounded analyst.

Use ONLY the retrieved RAG chunks provided as input.
Do not invent facts outside the retrieved context.

Return ONLY valid JSON. No markdown. No code fences. No text before or after.

Required output schema:
{
  "lane": "<lane value>",
  "namespace": "<namespace value>",
  "evidence_count": <number>,
  "problems": [
    {
      "title": "<short problem title, max 12 words>",
      "summary": "<2-3 sentence description grounded in evidence>",
      "confidence": <0-100>,
      "frequency": <estimated event count>,
      "urgency": "critical" | "high" | "medium" | "low",
      "evidence_quotes": ["<exact quote or paraphrase from chunk>"],
      "reason_codes": ["<return reason code if identifiable>"],
      "chunk_ids": [<chunk numbers>]
    }
  ],
  "notes": "<overall lane observation>"
}

Rules:
- problems: array of 1-5 objects, ranked by confidence descending.
- confidence: 0-100 based on evidence strength.
- evidence_quotes: must reference actual text from chunks.
- If no evidence, return problems as [] with notes explaining why.`;

// ── Master LLM system prompt (Phase 3 rewrite) ──
const MASTER_LLM_SYSTEM_PROMPT = `You are a grounded master analyst synthesizing findings across all data lanes.

Use ONLY the lane-level problem outputs provided.
Do not invent facts outside the provided context.

Return ONLY valid JSON. No markdown. No code fences. No text before or after.

Required output schema:
{
  "report_title": "<descriptive title>",
  "overall_summary": "<2-4 sentence executive summary>",
  "masterProblems": [
    {
      "id": <sequential from 1>,
      "rank": <priority rank>,
      "title": "<short problem title>",
      "summary": "<3-5 sentence grounded description>",
      "confidence": <0-100>,
      "groundedness": <0-100>,
      "urgency": "critical" | "high" | "medium" | "low",
      "isNew": true,
      "isRecurring": false,
      "sources": ["<lane display names>"],
      "frequency": <total event count>,
      "frequencyDelta": 0,
      "estimatedImpact": "<$ estimate or Unknown>",
      "reasonCodes": ["<return reason codes>"],
      "subReasonDrivers": [],
      "citations": [
        { "id": <int>, "source": "<display name>", "sourceColor": "<hex>", "type": "evidence", "ref": "<label>", "preview": "<quote>" }
      ],
      "nodeProblems": {
        "<Source Name>": [
          { "title": "<finding>", "count": null, "citationIds": [<int>] }
        ]
      }
    }
  ],
  "priority_issues": ["<short strings>"],
  "cross_lane_patterns": ["<short strings>"],
  "recommended_actions": ["<short strings>"]
}

Rules:
- masterProblems: 3-7 objects ranked by confidence + frequency + urgency.
- Merge similar problems across lanes.
- citations: reference actual evidence from lane outputs.
- Use these display names/colors:
  returns = "Data Warehouse" (#FF9900)
  crm = "Zendesk Support" (#03363D)
  reviews = "App Store Reviews" (#0D96F6)
  fraud = "Fraud & Abuse" (#C0392B)
  nps = "Productboard" (#8B5CF6)
- nodeProblems must group findings by source display name.
- isRecurring: true if multiple lanes report same issue.`;

// ── Build nodes array ──
const nodes = [];
let nodeId = 0;
const uid = () => `gen-${(++nodeId).toString(36).padStart(4, '0')}`;

// ═══════════════════════════════════════════
// SECTION A: TRIGGERS
// ═══════════════════════════════════════════

nodes.push({
    parameters: { rule: { interval: [{ field: "cronExpression", expression: "0 2 * * *" }] } },
    id: uid(), name: "Schedule Trigger",
    type: "n8n-nodes-base.scheduleTrigger", typeVersion: 1.2,
    position: [0, 672]
});

nodes.push({
    parameters: {},
    id: uid(), name: "Manual Trigger",
    type: "n8n-nodes-base.manualTrigger", typeVersion: 1,
    position: [0, 864]
});

// ═══════════════════════════════════════════
// SECTION B: CONFIG INGEST (env vars)
// ═══════════════════════════════════════════

nodes.push({
    parameters: {
        keepOnlySet: true,
        values: {
            string: [
                { name: "spreadsheet_id", value: "={{$env.SIGNAL_SPREADSHEET_ID || '1ZsBNvm8Ir7_vvz7z5vqENW20lANbgSASGepTtVXhu8Y'}}" },
                { name: "pinecone_index", value: "={{$env.PINECONE_INDEX || 'signal-returns-db'}}" },
                { name: "pinecone_query_url", value: "={{$env.PINECONE_QUERY_URL || 'https://signal-returns-db-fmlwamj.svc.aped-4627-b74a.pinecone.io/query'}}" },
                { name: "simple_query_text", value: "customer issue" },
                { name: "llm_system_prompt", value: LANE_LLM_SYSTEM_PROMPT },
                { name: "returns_query", value: "customer return complaint refund defect wrong item" },
                { name: "crm_query", value: "customer support complaint escalation service issue" },
                { name: "reviews_query", value: "negative review quality complaint product issue" },
                { name: "fraud_query", value: "fraud abuse counterfeit suspicious account activity" },
                { name: "nps_query", value: "feature request dissatisfaction customer feedback" },
                { name: "master_llm_system_prompt", value: MASTER_LLM_SYSTEM_PROMPT }
            ]
        },
        options: {}
    },
    id: uid(), name: "Config Ingest",
    type: "n8n-nodes-base.set", typeVersion: 2,
    position: [224, 816]
});

// ═══════════════════════════════════════════
// SECTION C: PHASE 1 — WEBHOOK SUB-FLOWS
// ═══════════════════════════════════════════

// C1: DataSources Webhook
nodes.push({
    parameters: { path: "signal-data-sources", responseMode: "responseNode", options: {} },
    id: uid(), name: "Webhook DataSources",
    type: "n8n-nodes-base.webhook", typeVersion: 2,
    position: [-400, -400], webhookId: "ds-" + uid()
});

nodes.push({
    parameters: {
        documentId: { __rl: true, value: "={{$env.SIGNAL_SPREADSHEET_ID || '1ZsBNvm8Ir7_vvz7z5vqENW20lANbgSASGepTtVXhu8Y'}}", mode: "id" },
        sheetName: { __rl: true, value: "SIGNAL_Metadata", mode: "name" },
        options: {}
    },
    id: uid(), name: "Read Metadata Sheet",
    type: "n8n-nodes-base.googleSheets", typeVersion: 4.5,
    position: [-176, -400], alwaysOutputData: true,
    credentials: GOOGLE_SHEETS_CRED, onError: "continueRegularOutput"
});

nodes.push({
    parameters: {
        jsCode: `const rows = items.map(i => i.json).filter(r => r && r.Source_Name);
const integrations = rows.map((r, idx) => ({
  id: idx + 1,
  name: r.Display_Name || r.Source_Name,
  shortName: r.Short_Name || r.Source_Name.substring(0, 2).toUpperCase(),
  iconBg: r.Icon_Bg || '#FF9900',
  iconInitial: r.Icon_Initial || r.Source_Name[0],
  status: r.Last_Sync_Status || 'synced',
  lastSyncTime: r.Last_Sync_Time ? new Date(r.Last_Sync_Time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'N/A',
  lastSyncDate: r.Last_Sync_Time ? (() => { const d = new Date(r.Last_Sync_Time); const today = new Date(); return d.toDateString() === today.toDateString() ? 'Today' : d.toLocaleDateString(); })() : 'N/A',
  coveragePeriod: (r.Coverage_Start && r.Coverage_End) ? r.Coverage_Start + ' – ' + r.Coverage_End : 'N/A',
  recordsPulled: r.Records_Pulled ? Number(r.Records_Pulled).toLocaleString() : '0',
  recordsUnit: r.Records_Unit || 'records',
  ragStatus: r.RAG_Status || 'pending',
  ragCount: Number(r.RAG_Count || 1),
  category: r.Category || 'Data'
}));
const totalRecords = rows.reduce((s, r) => s + Number(r.Records_Pulled || 0), 0);
const ragsIndexed = rows.reduce((s, r) => s + Number(r.RAG_Count || 0), 0);
return [{ json: {
  summary: {
    activeSources: integrations.filter(i => i.status === 'synced').length,
    ragsIndexed,
    totalRecords: totalRecords >= 1e6 ? (totalRecords / 1e6).toFixed(1) + 'M' : totalRecords.toLocaleString(),
    batchDuration: 'N/A',
    lastBatchTime: rows[0]?.Last_Sync_Time ? new Date(rows[0].Last_Sync_Time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A'
  },
  integrations
}}];`
    },
    id: uid(), name: "Build DataSources Response",
    type: "n8n-nodes-base.code", typeVersion: 2,
    position: [48, -400], alwaysOutputData: true, onError: "continueRegularOutput"
});

nodes.push({
    parameters: { respondWith: "json", responseBody: "={{ $json }}", options: CORS_OPTIONS },
    id: uid(), name: "Respond DataSources Webhook",
    type: "n8n-nodes-base.respondToWebhook", typeVersion: 1.1,
    position: [272, -400], alwaysOutputData: true, onError: "continueRegularOutput"
});

// C2: Sync Trigger Webhook
nodes.push({
    parameters: { path: "signal-sync-trigger", httpMethod: "POST", responseMode: "responseNode", options: {} },
    id: uid(), name: "Webhook SyncTrigger",
    type: "n8n-nodes-base.webhook", typeVersion: 2,
    position: [-400, -200], webhookId: "st-" + uid()
});

nodes.push({
    parameters: { respondWith: "json", responseBody: '={{ JSON.stringify({ status: "started", timestamp: new Date().toISOString() }) }}', options: CORS_OPTIONS },
    id: uid(), name: "Respond SyncTrigger",
    type: "n8n-nodes-base.respondToWebhook", typeVersion: 1.1,
    position: [-176, -200], alwaysOutputData: true, onError: "continueRegularOutput"
});

// ═══════════════════════════════════════════
// SECTION D: PHASE 2 — KPI + CHARTS WEBHOOKS
// ═══════════════════════════════════════════

// D1: KPI Webhook (un-disabled)
nodes.push({
    parameters: { path: "signal-kpi-simple", responseMode: "responseNode", options: {} },
    id: uid(), name: "Webhook KPI",
    type: "n8n-nodes-base.webhook", typeVersion: 2,
    position: [-400, 0], webhookId: "kpi-" + uid()
});

nodes.push({
    parameters: {
        keepOnlySet: true,
        values: { string: [{ name: "spreadsheet_id", value: "={{$env.SIGNAL_SPREADSHEET_ID || '1ZsBNvm8Ir7_vvz7z5vqENW20lANbgSASGepTtVXhu8Y'}}" }] },
        options: {}
    },
    id: uid(), name: "Config KPI",
    type: "n8n-nodes-base.set", typeVersion: 2,
    position: [-176, 0]
});

nodes.push({
    parameters: {
        documentId: { __rl: true, value: '={{$item(0).$node["Config KPI"].json["spreadsheet_id"]}}', mode: "id" },
        sheetName: { __rl: true, value: "gid=0", mode: "list", cachedResultName: "BI_HighLevel_KPIs" },
        options: {}
    },
    id: uid(), name: "Read KPI Sheet",
    type: "n8n-nodes-base.googleSheets", typeVersion: 4.5,
    position: [48, 0], alwaysOutputData: true,
    credentials: GOOGLE_SHEETS_CRED, onError: "continueRegularOutput"
});

nodes.push({
    parameters: {
        jsCode: `const range = $input.first()?.json?.query?.range || '7d';
const rows = items.map(i => i.json).filter(r => r && r.Metric_Key);
const periodRows = rows.filter(r => (r.Period || '7d') === range);
const fallbackRows = periodRows.length ? periodRows : rows;
const metrics = {};
for (const row of fallbackRows) {
  const key = row.Metric_Key;
  if (!key) continue;
  const current = Number(row.Current_Value ?? 0);
  const previous = Number(row.Previous_Value ?? current);
  const delta = previous !== 0 ? Math.round(((current - previous) / Math.abs(previous)) * 1000) / 10 : 0;
  metrics[key] = {
    value: current,
    delta,
    unit: row.Unit || '',
    direction: row.Direction_Logic || 'up-bad'
  };
}
return [{ json: metrics }];`
    },
    id: uid(), name: "Simplify KPI Data",
    type: "n8n-nodes-base.code", typeVersion: 2,
    position: [272, 0], alwaysOutputData: true, onError: "continueRegularOutput"
});

nodes.push({
    parameters: { respondWith: "json", responseBody: "={{ $json }}", options: CORS_OPTIONS },
    id: uid(), name: "Respond KPI Webhook",
    type: "n8n-nodes-base.respondToWebhook", typeVersion: 1.1,
    position: [496, 0], alwaysOutputData: true, onError: "continueRegularOutput"
});

// D2: Metrics Charts Webhook
nodes.push({
    parameters: { path: "signal-metrics-charts", responseMode: "responseNode", options: {} },
    id: uid(), name: "Webhook MetricsCharts",
    type: "n8n-nodes-base.webhook", typeVersion: 2,
    position: [-400, 200], webhookId: "mc-" + uid()
});

nodes.push({
    parameters: {
        documentId: { __rl: true, value: "={{$env.SIGNAL_SPREADSHEET_ID || '1ZsBNvm8Ir7_vvz7z5vqENW20lANbgSASGepTtVXhu8Y'}}", mode: "id" },
        sheetName: { __rl: true, value: 1807706849, mode: "list", cachedResultName: "Raw_SQL_Returns" },
        options: {}
    },
    id: uid(), name: "Read Returns For Charts",
    type: "n8n-nodes-base.googleSheets", typeVersion: 4.5,
    position: [-176, 200], alwaysOutputData: true,
    credentials: GOOGLE_SHEETS_CRED, onError: "continueRegularOutput"
});

nodes.push({
    parameters: {
        jsCode: `const rows = items.map(i => i.json).filter(r => r && Object.keys(r).length);
// Return Reason Codes
const codeCounts = {};
for (const r of rows) {
  const code = r.Return_Reason_Code || 'Unknown';
  if (!codeCounts[code]) codeCounts[code] = { count: 0, subReasons: {} };
  codeCounts[code].count++;
  const sub = r.Customer_Subjective_Reason || 'Other';
  codeCounts[code].subReasons[sub] = (codeCounts[code].subReasons[sub] || 0) + 1;
}
const total = rows.length || 1;
const codeColors = { "Defective / Quality": "#C0392B", "Wrong Item Sent": "#FF9900", "Size or Fit Issue": "#6B46C1", "Damaged / Used Product": "#B7791F", "Item No Longer Needed": "#0066C0", "Missing Parts / Accessories": "#067D62" };
const returnReasonCodes = Object.entries(codeCounts)
  .sort((a, b) => b[1].count - a[1].count)
  .map(([code, data]) => {
    const pct = Math.round((data.count / total) * 1000) / 10;
    const shortCode = code.length > 16 ? code.split(/[\\/\\s]+/).slice(0, 2).join(' ') : code;
    const subTotal = data.count || 1;
    const subReasons = Object.entries(data.subReasons)
      .sort((a, b) => b[1] - a[1]).slice(0, 4)
      .map(([label, cnt]) => ({ label, pct: Math.round((cnt / subTotal) * 100), count: cnt }));
    return { code, shortCode, pct, count: data.count, color: codeColors[code] || '#9CA3A3', subReasons };
  });
// Refund categories
const refundCounts = {};
for (const r of rows) {
  const t = r.Refund_Type || 'Full Refund';
  refundCounts[t] = (refundCounts[t] || 0) + 1;
}
const refundColors = { "Full Refund": "#FF9900", "Partial Refund": "#232F3E", "Store Credit": "#6B46C1", "Disputed": "#C0392B" };
const refundCategories = Object.entries(refundCounts)
  .sort((a, b) => b[1] - a[1])
  .map(([name, count]) => ({ name, pct: Math.round((count / total) * 100), count, color: refundColors[name] || '#9CA3A3' }));
return [{ json: { returnReasonCodes, refundCategories, weeklyTrend: [], returnRateTrend: [], growingSubReasons: [] } }];`
    },
    id: uid(), name: "Compute Chart Payloads",
    type: "n8n-nodes-base.code", typeVersion: 2,
    position: [48, 200], alwaysOutputData: true, onError: "continueRegularOutput"
});

nodes.push({
    parameters: { respondWith: "json", responseBody: "={{ $json }}", options: CORS_OPTIONS },
    id: uid(), name: "Respond MetricsCharts Webhook",
    type: "n8n-nodes-base.respondToWebhook", typeVersion: 1.1,
    position: [272, 200], alwaysOutputData: true, onError: "continueRegularOutput"
});

// ═══════════════════════════════════════════
// SECTION E: PHASE 3 — INSIGHTS WEBHOOK
// ═══════════════════════════════════════════

nodes.push({
    parameters: { path: "signal-insights", responseMode: "responseNode", options: {} },
    id: uid(), name: "Webhook Insights",
    type: "n8n-nodes-base.webhook", typeVersion: 2,
    position: [-400, -600], webhookId: "ins-" + uid()
});

nodes.push({
    parameters: {
        documentId: { __rl: true, value: "={{$env.SIGNAL_SPREADSHEET_ID || '1ZsBNvm8Ir7_vvz7z5vqENW20lANbgSASGepTtVXhu8Y'}}", mode: "id" },
        sheetName: { __rl: true, value: "SIGNAL_Insights_Output", mode: "name" },
        options: {}
    },
    id: uid(), name: "Read Insights Output",
    type: "n8n-nodes-base.googleSheets", typeVersion: 4.5,
    position: [-176, -600], alwaysOutputData: true,
    credentials: GOOGLE_SHEETS_CRED, onError: "continueRegularOutput"
});

nodes.push({
    parameters: {
        jsCode: `const rows = items.map(i => i.json).filter(r => r && r.Raw_Master_JSON);
if (!rows.length) return [{ json: { error: true, message: "No insights data found", code: "NO_DATA" } }];
const last = rows[rows.length - 1];
let parsed = {};
try { parsed = JSON.parse(last.Raw_Master_JSON); } catch(e) { return [{ json: { error: true, message: "Failed to parse insights", code: "PARSE_ERROR" } }]; }
// Build citationLibrary from masterProblems citations
const allCitations = [];
const problems = Array.isArray(parsed.masterProblems) ? parsed.masterProblems : [];
for (const p of problems) {
  if (Array.isArray(p.citations)) {
    for (const c of p.citations) { if (!allCitations.find(x => x.id === c.id)) allCitations.push(c); }
  }
  // Map citationIds from inline citations
  if (!p.citationIds && Array.isArray(p.citations)) {
    p.citationIds = p.citations.map(c => c.id);
  }
}
return [{ json: {
  masterProblems: problems,
  citationLibrary: allCitations,
  report_title: parsed.report_title || 'SIGNAL Insights',
  overall_summary: parsed.overall_summary || '',
  priority_issues: parsed.priority_issues || [],
  cross_lane_patterns: parsed.cross_lane_patterns || [],
  recommended_actions: parsed.recommended_actions || [],
  run_timestamp: last.Run_Timestamp || new Date().toISOString()
}}];`
    },
    id: uid(), name: "Format Insights Response",
    type: "n8n-nodes-base.code", typeVersion: 2,
    position: [48, -600], alwaysOutputData: true, onError: "continueRegularOutput"
});

nodes.push({
    parameters: { respondWith: "json", responseBody: "={{ $json }}", options: CORS_OPTIONS },
    id: uid(), name: "Respond Insights Webhook",
    type: "n8n-nodes-base.respondToWebhook", typeVersion: 1.1,
    position: [272, -600], alwaysOutputData: true, onError: "continueRegularOutput"
});

// ═══════════════════════════════════════════
// SECTION F: INGEST PIPELINE (5 lanes)
// ═══════════════════════════════════════════

const lanes = [
    { lane: 'returns', ns: 'RAG1', sheet: 'Raw_SQL_Returns', gid: 1807706849, keyField: 'Customer_Subjective_Reason', pos: [448, 384] },
    { lane: 'crm', ns: 'RAG2', sheet: 'CRM_Transcripts', gid: 267245602, keyField: 'Transcript_Summary', pos: [448, 576] },
    { lane: 'reviews', ns: 'RAG3', sheet: 'VoC_Reviews', gid: 145959029, keyField: 'Customer_Feedback', pos: [672, 768] },
    { lane: 'fraud', ns: 'RAG4', sheet: 'Fraud_Abuse', gid: 304167556, keyField: 'Investigator_Notes', pos: [960, 960] },
    { lane: 'nps', ns: 'RAG5', sheet: 'NPS_FeatureBoards', gid: 1372932066, keyField: 'Survey_Comment', pos: [1312, 1152] }
];

// Read sheet nodes
for (const l of lanes) {
    nodes.push({
        parameters: {
            documentId: { __rl: true, value: '={{$item(0).$node["Config Ingest"].json["spreadsheet_id"]}}', mode: "id" },
            sheetName: { __rl: true, value: l.gid, mode: "list", cachedResultName: l.sheet },
            options: {}
        },
        id: uid(), name: `Read ${l.sheet.replace(/_/g, ' ')}`,
        type: "n8n-nodes-base.googleSheets", typeVersion: 4.5,
        position: l.pos, alwaysOutputData: true,
        credentials: GOOGLE_SHEETS_CRED, onError: "continueRegularOutput"
    });
}

// Prepare docs code nodes (simplified — uses generic approach)
for (const l of lanes) {
    nodes.push({
        parameters: {
            jsCode: `const lane = '${l.lane}';
const ns = '${l.ns}';
const sheet = '${l.sheet}';
const keyField = '${l.keyField}';
return items.map((item, idx) => {
  const row = item.json || {};
  const text = String(row[keyField] ?? '').trim();
  if (!text) return null;
  return { json: { lane, namespace: ns, source_sheet: sheet, source_column: keyField, row_number: idx + 1, text_content: text, ...row } };
}).filter(Boolean);`
        },
        id: uid(), name: `Prepare ${l.lane} Docs`,
        type: "n8n-nodes-base.code", typeVersion: 2,
        position: [l.pos[0] + 224, l.pos[1]], alwaysOutputData: true, onError: "continueRegularOutput"
    });
}

// Embeddings node
nodes.push({
    parameters: { options: {} },
    id: uid(), name: "Embeddings OpenAI",
    type: "@n8n/n8n-nodes-langchain.embeddingsOpenAi", typeVersion: 1.2,
    position: [2144, 192], credentials: OPENAI_CRED
});

// Pinecone insert nodes
for (const l of lanes) {
    nodes.push({
        parameters: {
            mode: "insert",
            pineconeIndex: { __rl: true, value: '={{$item(0).$node["Config Ingest"].json["pinecone_index"]}}', mode: "id" },
            options: { clearNamespace: true, pineconeNamespace: l.ns }
        },
        id: uid(), name: `Pinecone Insert ${l.lane}`,
        type: "@n8n/n8n-nodes-langchain.vectorStorePinecone", typeVersion: 1.3,
        position: [l.pos[0] + 448, l.pos[1]], alwaysOutputData: true,
        credentials: PINECONE_CRED, onError: "continueRegularOutput"
    });
}

// Document loaders for each lane
for (const l of lanes) {
    nodes.push({
        parameters: {
            jsonMode: "expressionData",
            jsonData: `={{$json.text_content || ''}}`,
            options: {
                metadata: {
                    metadataValues: [
                        { name: "lane", value: "={{$json.lane}}" },
                        { name: "namespace", value: "={{$json.namespace}}" },
                        { name: "source_sheet", value: "={{$json.source_sheet}}" },
                        { name: "row_number", value: "={{$json.row_number}}" }
                    ]
                }
            }
        },
        id: uid(), name: `${l.lane} Document Loader`,
        type: "@n8n/n8n-nodes-langchain.documentDefaultDataLoader", typeVersion: 1.1,
        position: [l.pos[0] + 224, l.pos[1] + 300]
    });
}

// Merge + Wait + Retrieval nodes (4 merge nodes for 5 lanes)
for (let i = 0; i < 4; i++) {
    nodes.push({
        parameters: {},
        id: uid(), name: `Sync Inserts ${String.fromCharCode(65 + i)}`,
        type: "n8n-nodes-base.merge", typeVersion: 3,
        position: [1312 + i * 352, 480 + i * 144], alwaysOutputData: true, onError: "continueRegularOutput"
    });
}

nodes.push({
    parameters: { amount: 60 },
    id: uid(), name: "Wait For Pinecone Indexing",
    type: "n8n-nodes-base.wait", typeVersion: 1.1,
    position: [2528, 816], alwaysOutputData: true, webhookId: "wait-" + uid(), onError: "continueRegularOutput"
});

nodes.push({
    parameters: {
        jsCode: `const cfg = $item(0).$node["Config Ingest"].json;
return [
  { json: { lane: 'returns', namespace: 'RAG1', natural_query: cfg.returns_query, top_k: 4 } },
  { json: { lane: 'crm', namespace: 'RAG2', natural_query: cfg.crm_query, top_k: 4 } },
  { json: { lane: 'reviews', namespace: 'RAG3', natural_query: cfg.reviews_query, top_k: 4 } },
  { json: { lane: 'fraud', namespace: 'RAG4', natural_query: cfg.fraud_query, top_k: 4 } },
  { json: { lane: 'nps', namespace: 'RAG5', natural_query: cfg.nps_query, top_k: 4 } },
];`
    },
    id: uid(), name: "Build Retrieval Requests",
    type: "n8n-nodes-base.code", typeVersion: 2,
    position: [2752, 816], alwaysOutputData: true, onError: "continueRegularOutput"
});

// Pinecone retrieve + format + LLM for each lane
const retrievePositions = [[2976, 224], [2976, 624], [3328, 816], [3680, 1008], [4032, 1200]];
for (let i = 0; i < lanes.length; i++) {
    const l = lanes[i];
    const rp = retrievePositions[i];

    nodes.push({
        parameters: {
            mode: "load",
            pineconeIndex: { __rl: true, value: '={{$item(0).$node["Config Ingest"].json["pinecone_index"]}}', mode: "id" },
            prompt: `={{$item(0).$node["Config Ingest"].json["${l.lane}_query"]}}`,
            options: { pineconeNamespace: l.ns }
        },
        id: uid(), name: `Pinecone Retrieve ${l.lane}`,
        type: "@n8n/n8n-nodes-langchain.vectorStorePinecone", typeVersion: 1.3,
        position: rp, credentials: PINECONE_CRED
    });

    nodes.push({
        parameters: {
            jsCode: `const chunks = items.map((item, idx) => {
  const doc = item.json.document || {};
  const text = doc.pageContent || item.json.pageContent || item.json.text || '';
  return text ? '[' + (idx + 1) + '] ' + text : '';
}).filter(Boolean);
return [{ json: { lane: '${l.lane}', namespace: '${l.ns}', natural_query: $item(0).$node["Config Ingest"].json["${l.lane}_query"], evidence_count: chunks.length, retrieved_context: chunks.join('\\n\\n') } }];`
        },
        id: uid(), name: `Format Context ${l.lane}`,
        type: "n8n-nodes-base.code", typeVersion: 2,
        position: [rp[0] + 416, rp[1]], alwaysOutputData: true, onError: "continueRegularOutput"
    });

    nodes.push({
        parameters: {
            promptType: "define",
            text: `=Actual lane value: {{$json.lane}}\nActual namespace value: {{$json.namespace}}\nActual evidence count: {{$json.evidence_count}}\n\nRetrieved chunks:\n{{$json.retrieved_context}}\n\nSet lane, namespace, and evidence_count in the JSON to the exact actual values above.\nIf the retrieved chunks are empty, return problems as [] and notes as "No evidence was found."`,
            messages: { messageValues: [{ message: '={{ $item(0).$node["Config Ingest"].json["llm_system_prompt"] }}' }] },
            batching: {}
        },
        id: uid(), name: `RAG LLM ${l.lane}`,
        type: "@n8n/n8n-nodes-langchain.chainLlm", typeVersion: 1.9,
        position: [rp[0] + 704, rp[1]], alwaysOutputData: true, onError: "continueRegularOutput"
    });
}

// Merge lane LLM outputs (4 merges for 5 lanes)
for (let i = 0; i < 4; i++) {
    nodes.push({
        parameters: {},
        id: uid(), name: `Merge Lane LLM ${i + 1}`,
        type: "n8n-nodes-base.merge", typeVersion: 3,
        position: [4096 + i * 352, 480 + i * 96], alwaysOutputData: true, onError: "continueRegularOutput"
    });
}

// OpenRouter Model
nodes.push({
    parameters: { model: "deepseek/deepseek-chat-v3.1", options: {} },
    id: uid(), name: "OpenRouter RAG Model",
    type: "@n8n/n8n-nodes-langchain.lmChatOpenRouter", typeVersion: 1,
    position: [4528, 160], credentials: OPENROUTER_CRED
});

// Build Master Context (Phase 3 rewrite)
nodes.push({
    parameters: {
        jsCode: `const normalized = items.map((item) => {
  const raw = item.json || {};
  let candidate = raw.text || raw.response || raw.output || raw.message || raw.content || '';
  if (typeof candidate !== 'string') candidate = JSON.stringify(candidate || {});
  let cleaned = candidate.trim();
  if (cleaned.startsWith('\`\`\`json')) cleaned = cleaned.replace(/^\`\`\`json\\s*/i, '').replace(/\\s*\`\`\`$/i, '').trim();
  else if (cleaned.startsWith('\`\`\`')) cleaned = cleaned.replace(/^\`\`\`\\s*/i, '').replace(/\\s*\`\`\`$/i, '').trim();
  let parsed = null;
  try { parsed = JSON.parse(cleaned); } catch(e) {}
  return parsed && typeof parsed === 'object' ? parsed : raw;
});
const masterContext = normalized.length
  ? JSON.stringify(normalized, null, 2)
  : 'No lane outputs found.';
return [{ json: { lane_output_count: normalized.length, master_context: masterContext, lane_outputs: normalized } }];`
    },
    id: uid(), name: "Build Master Context",
    type: "n8n-nodes-base.code", typeVersion: 2,
    position: [5296, 768], alwaysOutputData: true, onError: "continueRegularOutput"
});

// Master RAG LLM
nodes.push({
    parameters: {
        promptType: "define",
        text: `=Lane-level outputs:\n{{$json.master_context}}\n\nUse the lane-level outputs above to produce a single master synthesis.\nPreserve lane names exactly.\nDo not use outside knowledge.\nIf lane_output_count is 0, return minimal output with empty arrays.`,
        messages: { messageValues: [{ message: '={{ $item(0).$node["Config Ingest"].json["master_llm_system_prompt"] }}' }] },
        batching: {}
    },
    id: uid(), name: "Master RAG LLM",
    type: "@n8n/n8n-nodes-langchain.chainLlm", typeVersion: 1.9,
    position: [5520, 768], alwaysOutputData: true, onError: "continueRegularOutput"
});

// Final Master Output (Phase 3 — preserve structure, no flattening)
nodes.push({
    parameters: {
        jsCode: `const raw = items[0]?.json || {};
let candidate = raw.text || raw.response || raw.output || raw.message || raw.content || '';
if (typeof candidate !== 'string') candidate = JSON.stringify(candidate || {});
let cleaned = candidate.trim();
if (cleaned.startsWith('\`\`\`json')) cleaned = cleaned.replace(/^\`\`\`json\\s*/i, '').replace(/\\s*\`\`\`$/i, '').trim();
else if (cleaned.startsWith('\`\`\`')) cleaned = cleaned.replace(/^\`\`\`\\s*/i, '').replace(/\\s*\`\`\`$/i, '').trim();
let parsed = null;
try { parsed = JSON.parse(cleaned); } catch(e) {}
return [{ json: {
  Run_Timestamp: new Date().toISOString(),
  Raw_Master_JSON: parsed ? JSON.stringify(parsed) : cleaned,
  Raw_Lane_Outputs_JSON: '',
  Raw_Citations_JSON: ''
}}];`
    },
    id: uid(), name: "Final Master Output",
    type: "n8n-nodes-base.code", typeVersion: 2,
    position: [5872, 768], alwaysOutputData: true, onError: "continueRegularOutput"
});

// Write to SIGNAL_Insights_Output sheet
nodes.push({
    parameters: {
        operation: "append",
        documentId: { __rl: true, value: '={{$item(0).$node["Config Ingest"].json["spreadsheet_id"]}}', mode: "id" },
        sheetName: { __rl: true, value: "SIGNAL_Insights_Output", mode: "name" },
        columns: { mappingMode: "autoMapInputData", value: {}, matchingColumns: [], schema: [], attemptToConvertTypes: false, convertFieldsToString: false },
        options: {}
    },
    id: uid(), name: "Write Insights to Sheet",
    type: "n8n-nodes-base.googleSheets", typeVersion: 4.5,
    position: [6128, 768], alwaysOutputData: true,
    credentials: GOOGLE_SHEETS_CRED, onError: "continueRegularOutput"
});

// ═══════════════════════════════════════════
// BUILD CONNECTIONS
// ═══════════════════════════════════════════

const nameToNode = {};
for (const n of nodes) nameToNode[n.name] = n;

const conn = {};
function connect(from, to, fromType = "main", toType = "main", fromIdx = 0, toIdx = 0) {
    if (!conn[from]) conn[from] = {};
    if (!conn[from][fromType]) conn[from][fromType] = [[]];
    while (conn[from][fromType].length <= fromIdx) conn[from][fromType].push([]);
    conn[from][fromType][fromIdx].push({ node: to, type: toType, index: toIdx });
}

// Triggers → Config Ingest
connect("Schedule Trigger", "Config Ingest");
connect("Manual Trigger", "Config Ingest");

// DataSources webhook chain
connect("Webhook DataSources", "Read Metadata Sheet");
connect("Read Metadata Sheet", "Build DataSources Response");
connect("Build DataSources Response", "Respond DataSources Webhook");

// SyncTrigger webhook → respond + trigger ingest
connect("Webhook SyncTrigger", "Respond SyncTrigger");
connect("Webhook SyncTrigger", "Config Ingest", "main", "main", 0, 0);

// KPI webhook chain
connect("Webhook KPI", "Config KPI");
connect("Config KPI", "Read KPI Sheet");
connect("Read KPI Sheet", "Simplify KPI Data");
connect("Simplify KPI Data", "Respond KPI Webhook");

// Metrics Charts webhook chain
connect("Webhook MetricsCharts", "Read Returns For Charts");
connect("Read Returns For Charts", "Compute Chart Payloads");
connect("Compute Chart Payloads", "Respond MetricsCharts Webhook");

// Insights webhook chain
connect("Webhook Insights", "Read Insights Output");
connect("Read Insights Output", "Format Insights Response");
connect("Format Insights Response", "Respond Insights Webhook");

// Config Ingest → read all 5 sheets
for (const l of lanes) {
    connect("Config Ingest", `Read ${l.sheet.replace(/_/g, ' ')}`);
}

// Read → Prepare → Insert for each lane
for (const l of lanes) {
    connect(`Read ${l.sheet.replace(/_/g, ' ')}`, `Prepare ${l.lane} Docs`);
    connect(`Prepare ${l.lane} Docs`, `Pinecone Insert ${l.lane}`);
}

// Document loaders → Pinecone inserts (ai_document connections)
for (const l of lanes) {
    connect(`${l.lane} Document Loader`, `Pinecone Insert ${l.lane}`, "ai_document", "ai_document");
}

// Embeddings → all Pinecone nodes
for (const l of lanes) {
    connect("Embeddings OpenAI", `Pinecone Insert ${l.lane}`, "ai_embedding", "ai_embedding");
    connect("Embeddings OpenAI", `Pinecone Retrieve ${l.lane}`, "ai_embedding", "ai_embedding");
}

// Sync merges for inserts
connect("Pinecone Insert returns", "Sync Inserts A", "main", "main", 0, 0);
connect("Pinecone Insert crm", "Sync Inserts A", "main", "main", 0, 1);
connect("Sync Inserts A", "Sync Inserts B", "main", "main", 0, 0);
connect("Pinecone Insert reviews", "Sync Inserts B", "main", "main", 0, 1);
connect("Sync Inserts B", "Sync Inserts C", "main", "main", 0, 0);
connect("Pinecone Insert fraud", "Sync Inserts C", "main", "main", 0, 1);
connect("Sync Inserts C", "Sync Inserts D", "main", "main", 0, 0);
connect("Pinecone Insert nps", "Sync Inserts D", "main", "main", 0, 1);
connect("Sync Inserts D", "Wait For Pinecone Indexing");
connect("Wait For Pinecone Indexing", "Build Retrieval Requests");

// Build Retrieval → Pinecone Retrieve all lanes
for (const l of lanes) {
    connect("Build Retrieval Requests", `Pinecone Retrieve ${l.lane}`);
}

// Retrieve → Format → LLM per lane
for (const l of lanes) {
    connect(`Pinecone Retrieve ${l.lane}`, `Format Context ${l.lane}`);
    connect(`Format Context ${l.lane}`, `RAG LLM ${l.lane}`);
}

// LLM model → all RAG LLMs + Master
for (const l of lanes) {
    connect("OpenRouter RAG Model", `RAG LLM ${l.lane}`, "ai_languageModel", "ai_languageModel");
}
connect("OpenRouter RAG Model", "Master RAG LLM", "ai_languageModel", "ai_languageModel");

// Merge lane LLM outputs
connect("RAG LLM returns", "Merge Lane LLM 1", "main", "main", 0, 0);
connect("RAG LLM crm", "Merge Lane LLM 1", "main", "main", 0, 1);
connect("Merge Lane LLM 1", "Merge Lane LLM 2", "main", "main", 0, 0);
connect("RAG LLM reviews", "Merge Lane LLM 2", "main", "main", 0, 1);
connect("Merge Lane LLM 2", "Merge Lane LLM 3", "main", "main", 0, 0);
connect("RAG LLM fraud", "Merge Lane LLM 3", "main", "main", 0, 1);
connect("Merge Lane LLM 3", "Merge Lane LLM 4", "main", "main", 0, 0);
connect("RAG LLM nps", "Merge Lane LLM 4", "main", "main", 0, 1);

// Final chain
connect("Merge Lane LLM 4", "Build Master Context");
connect("Build Master Context", "Master RAG LLM");
connect("Master RAG LLM", "Final Master Output");
connect("Final Master Output", "Write Insights to Sheet");

// ═══════════════════════════════════════════
// OUTPUT
// ═══════════════════════════════════════════

const workflow = {
    name: "SIGNAL (Full Pipeline + Webhooks)",
    nodes,
    pinData: {},
    connections: conn,
    active: false,
    settings: { executionOrder: "v1", binaryMode: "separate", availableInMCP: false },
    meta: { instanceId: "ddf7122d233e93cd0f80ee59905968e32e1ebe3cf80573fd9724ab5fedc3985e" },
    tags: []
};

console.log(JSON.stringify(workflow, null, 2));
