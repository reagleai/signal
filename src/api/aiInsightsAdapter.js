/**
 * API Adapter for Signal AI Insights
 * Normalizes the n8n webhook response into the exact shape expected by the frontend components.
 */

// 1. Fallback / Mock Response based on the exact n8n webhook contract provided
export const SAMPLE_WEBHOOK_RESPONSE = {
    "job_id": "signal-1773088276749",
    "status": "completed",
    "generated_at": "2026-03-09T20:31:16.749Z",
    "time_range": "7d",
    "total_events_analyzed": 8,
    "signals_used": [
        "returns",
        "reviews",
        "fraud",
        "nps"
    ],
    "insights": [
        {
            "rank": 1,
            "title": "Inconsistent refund processing and status communication",
            "confidence": 0.81,
            "grounded_score": 0.78,
            "events": 5,
            "sources": [
                "fraud",
                "nps"
            ],
            "drivers": [
                "Refund manipulation history",
                "Refund processing speed",
                "Status update clarity"
            ],
            "evidence_sample": [
                {
                    "lane": "fraud",
                    "namespace": "RAG4",
                    "snippet": "Evidence shows device fingerprint overlaps with previously suspended fraudulent accounts and suspicious immediate return"
                },
                {
                    "lane": "nps",
                    "namespace": "RAG5",
                    "snippet": "Mixed feedback with one negative response highlighting issues with refund timelines and tracking clarity, while two posi"
                }
            ],
            "summary": "Inconsistent refund processing and status communication appearing across 2 source(s); drivers: Refund manipulation history, Refund processing speed."
        },
        {
            "rank": 2,
            "title": "Product quality does not match description",
            "confidence": 0.81,
            "grounded_score": 0.53,
            "events": 3,
            "sources": [
                "returns",
                "reviews"
            ],
            "drivers": [
                "Product quality defects",
                "Product does not match description",
                "Lower than expected quality"
            ],
            "evidence_sample": [
                {
                    "lane": "returns",
                    "namespace": "RAG1",
                    "snippet": "Single return case shows multiple quality issues with foundation product including odor, texture separation, and materia"
                },
                {
                    "lane": "reviews",
                    "namespace": "RAG3",
                    "snippet": "Customers report the product underdelivers on advertised features and quality expectations, though one acknowledges basi"
                }
            ],
            "summary": "Product quality does not match description appearing across 2 source(s); drivers: Product quality defects, Product does not match description."
        },
        {
            "rank": 3,
            "title": "Poor product build quality and material inconsistencies",
            "confidence": 0.81,
            "grounded_score": 0.53,
            "events": 3,
            "sources": [
                "returns",
                "reviews"
            ],
            "drivers": [
                "Product quality defects",
                "Product does not match description",
                "Lower than expected quality"
            ],
            "evidence_sample": [
                {
                    "lane": "returns",
                    "namespace": "RAG1",
                    "snippet": "Single return case shows multiple quality issues with foundation product including odor, texture separation, and materia"
                },
                {
                    "lane": "reviews",
                    "namespace": "RAG3",
                    "snippet": "Customers report the product underdelivers on advertised features and quality expectations, though one acknowledges basi"
                }
            ],
            "summary": "Poor product build quality and material inconsistencies appearing across 2 source(s); drivers: Product quality defects, Product does not match description."
        },
        {
            "rank": 4,
            "title": "Potential fraudulent activity from linked accounts",
            "confidence": 0.68,
            "grounded_score": 0.4,
            "events": 2,
            "sources": [
                "fraud"
            ],
            "drivers": [
                "Account linking"
            ],
            "evidence_sample": [
                {
                    "lane": "fraud",
                    "namespace": "RAG4",
                    "snippet": "Evidence shows device fingerprint overlaps with previously suspended fraudulent accounts and suspicious immediate return"
                }
            ],
            "summary": "Potential fraudulent activity from linked accounts appearing across 1 source(s); drivers: Account linking."
        },
        {
            "rank": 5,
            "title": "Limited feature set versus advertised capabilities",
            "confidence": 0.68,
            "grounded_score": 0.4,
            "events": 2,
            "sources": [
                "reviews"
            ],
            "drivers": [
                "Limited feature set"
            ],
            "evidence_sample": [
                {
                    "lane": "reviews",
                    "namespace": "RAG3",
                    "snippet": "Customers report the product underdelivers on advertised features and quality expectations, though one acknowledges basi"
                }
            ],
            "summary": "Limited feature set versus advertised capabilities appearing across 1 source(s); drivers: Limited feature set."
        }
    ],
    "lane_summaries": [
        {
            "lane": "returns",
            "namespace": "RAG1",
            "evidence_count": 1,
            "top_themes": [
                "Product quality defects",
                "Product does not match description",
                "Texture separation issues"
            ],
            "notes": "Single return case shows multiple quality issues with foundation product including odor, texture separation, and material inconsistencies that don't match product description.",
            "evidence_examples": []
        },
        {
            "lane": "reviews",
            "namespace": "RAG3",
            "evidence_count": 2,
            "top_themes": [
                "Product does not match description",
                "Lower than expected quality",
                "Limited feature set"
            ],
            "notes": "Customers report the product underdelivers on advertised features and quality expectations, though one acknowledges basic functionality.",
            "evidence_examples": []
        },
        {
            "lane": "fraud",
            "namespace": "RAG4",
            "evidence_count": 2,
            "top_themes": [
                "Device fingerprint overlap",
                "Account linking",
                "Refund manipulation history"
            ],
            "notes": "Evidence shows device fingerprint overlaps with previously suspended fraudulent accounts and suspicious immediate returns with inconsistent explanations.",
            "evidence_examples": []
        },
        {
            "lane": "nps",
            "namespace": "RAG5",
            "evidence_count": 3,
            "top_themes": [
                "Refund processing speed",
                "Status update clarity",
                "Delivery speed"
            ],
            "notes": "Mixed feedback with one negative response highlighting issues with refund timelines and tracking clarity, while two positive responses praised delivery speed and tracking updates.",
            "evidence_examples": []
        }
    ]
};

const LISP_TO_SOURCE_MAP = {
    'returns': 'DW',
    'reviews': 'App Store Reviews',
    'fraud': 'Fraud System',
    'nps': 'Zendesk'
};

const SOURCE_COLORS = {
    "Zendesk": "#03363D",
    "App Store Reviews": "#0D96F6",
    "DW": "#FF9900",
    "Productboard": "#8B5CF6",
    "Fraud System": "#C0392B"
};

/**
 * Adapts the raw backend contract into the exact schema expected by AIInsights.jsx.
 */
export function mapSignalAiInsightsResponse(backendData) {
    if (!backendData || !backendData.insights) {
        // Provide a safe fallback if the payload is malformed
        console.warn("AI Insights Adapter: Missing or malformed 'insights' array in payload.", backendData);
        return { masterProblems: [], citationLibrary: [], chatQuestions: null, summary: { recordsProcessed: 0, ragIndexed: 0 } };
    }

    const citationLibrary = [];
    let citationIdCounter = 1;

    const masterProblems = backendData.insights.map((insight, index) => {
        const citationIds = [];
        const nodeProblems = {};
        const sourcesSet = new Set();

        // Capture sources if explicitly given
        if (Array.isArray(insight.sources)) {
            insight.sources.forEach(s => sourcesSet.add(s));
        }

        // Process evidence_sample into the flat citation library and grouped nodeProblems
        if (Array.isArray(insight.evidence_sample)) {
            insight.evidence_sample.forEach(evidence => {
                const lane = evidence.lane || 'unknown';
                sourcesSet.add(lane);

                const citationId = citationIdCounter++;
                citationIds.push(citationId);

                const sourceName = LISP_TO_SOURCE_MAP[lane.toLowerCase()] || (lane.charAt(0).toUpperCase() + lane.slice(1));

                // Add to global citations list
                citationLibrary.push({
                    id: citationId,
                    source: sourceName,
                    sourceColor: SOURCE_COLORS[sourceName] || "#9CA3A3",
                    type: "ticket",
                    ref: evidence.namespace || `Ref-${citationId}`,
                    preview: evidence.snippet || "No snippet provided"
                });

                // Group by source for the UI split-pane
                if (!nodeProblems[sourceName]) {
                    nodeProblems[sourceName] = [];
                }

                nodeProblems[sourceName].push({
                    title: evidence.snippet ? (evidence.snippet.substring(0, 60) + '...') : 'Evidence reference',
                    count: null,
                    citationIds: [citationId]
                });
            });
        }

        const rank = insight.rank || (index + 1);
        const urgency = rank === 1 ? 'critical' : (rank <= 3 ? 'high' : 'medium');
        const mappedSources = Array.from(sourcesSet).map(s => LISP_TO_SOURCE_MAP[s.toLowerCase()] || (s.charAt(0).toUpperCase() + s.slice(1)));

        return {
            id: `insight-${rank}-${Date.now()}`,
            rank: rank,
            title: insight.title || "Untitled Insight",
            summary: insight.summary || "",

            // Backend sends float (0-1), frontend expects integer (0-100)
            confidence: Math.round((insight.confidence || 0) * 100),
            groundedness: Math.round((insight.grounded_score || 0) * 100),

            urgency,
            isNew: false, // fallback
            isRecurring: false, // fallback
            sources: mappedSources.length > 0 ? mappedSources : ['Unknown'],
            frequency: insight.events || 0,
            frequencyDelta: 0, // Not provided by backend
            estimatedImpact: "N/A", // Not provided by backend

            citationIds,
            // Map drivers -> reasonCodes
            reasonCodes: Array.isArray(insight.drivers) ? insight.drivers : [],
            subReasonDrivers: [], // Safely empty, not supported yet by backend
            nodeProblems
        };
    });

    let chatQuestions = null;

    if (backendData.static_questions &&
        (backendData.static_questions.question_1 || backendData.static_questions.question_2 || backendData.static_questions.question_3 || backendData.static_questions.question_4)) {
        chatQuestions = [
            backendData.static_questions.question_1,
            backendData.static_questions.question_2,
            backendData.static_questions.question_3,
            backendData.static_questions.question_4
        ].filter(Boolean);
    } else if (Array.isArray(backendData.follow_up_questions) && backendData.follow_up_questions.length > 0) {
        chatQuestions = backendData.follow_up_questions.slice(0, 4).filter(Boolean);
    }

    return {
        masterProblems,
        citationLibrary,
        chatQuestions,
        summary: {
            recordsProcessed: backendData.total_events_analyzed || 0,
            ragIndexed: Array.isArray(backendData.signals_used) ? backendData.signals_used.length : 0,
            timeRange: backendData.time_range || '7d'
        }
    };
}

/**
 * Main fetcher used by the UI
 */
export async function fetchAIInsights(options = {}) {
    try {
        const {
            webhookUrl = '/api/ai-insights',
            method = 'POST',
            headers = { 'Content-Type': 'application/json' },
            payload = {}
        } = options;

        // Use sample if explicitly requested or testing locally without standard setup
        if (options.useMock) {
            console.log("AI Insights Adapter: Using mock data");
            return new Promise(resolve => {
                setTimeout(() => resolve(mapSignalAiInsightsResponse(SAMPLE_WEBHOOK_RESPONSE)), 800);
            });
        }

        const requestBody = {
            ingest: payload.ingest ?? false,
            time_window: payload.time_window ?? "7d",
            max_insights: payload.max_insights ?? 5,
            min_confidence: payload.min_confidence ?? 0.6,
            request_id: payload.request_id ?? `signal-${Date.now()}`
        };

        console.log("AI Insights Adapter: Dispatching Request", requestBody);

        const response = await fetch(webhookUrl, {
            method,
            headers,
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Webhook responded with status ${response.status}`);
        }

        const data = await response.json();

        // Removed `console.log` of raw backend payload to avoid leaking internal structures to client terminal
        return mapSignalAiInsightsResponse(data);

    } catch (error) {
        console.error("AI Insights Adapter: Fetch Failed", error);
        throw error;
    }
}

/**
 * Sends a chat message to the n8n Master PM Node workflow
 */
export async function sendChatMessage(options = {}) {
    try {
        const {
            webhookUrl = 'https://n8n-fastest.protonaiagents.com/webhook/signal/chat',
            method = 'POST',
            headers = { 'Content-Type': 'application/json' },
            payload = {}
        } = options;

        const requestBody = {
            session_id: payload.session_id,
            message: payload.message,
            top_k: payload.top_k ?? 8
        };

        console.log("Chat API Adapter: Sending Message", { session_id: requestBody.session_id, top_k: requestBody.top_k, message: requestBody.message.substring(0, 50) + '...' });

        const response = await fetch(webhookUrl, {
            method,
            headers,
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Chat Webhook responded with status ${response.status}`);
        }

        const data = await response.json();
        return data; // { session_id, query, reply, issues_found, lanes_used, history, meta }

    } catch (error) {
        console.error("Chat API Adapter: Send Failed", error);
        throw error;
    }
}
