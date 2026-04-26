# **SIGNAL — Returns Discovery Tool**

**Amazon Internal AI Product | Product Requirements Document**

## ---

**1\. Problem**

Amazon Returns PMs spend 7–8 hours a week manually skimming and analyzing data across multiple sources — Data Warehouse, BI Tools, CRM, VoC, Fraud & Abuse engines, and more — to find relevant and impactful problems to anchor their Press Release. This leads to prioritization based on product intuition, insufficient data, or whichever problem has been voiced the loudest.

## ---

**2\. Users**

**Primary User:** Amazon Returns PMs with 3–5 years of experience who manage return/refund flows, friction points, and fraudulent activities. When preparing their next PR/FAQ document, they want to spend less time on data extraction while covering the most impactful problems surfaced from customer-centric, quantitative data sources — so they can build a stronger, more credible Press Release.

**Pain Points:**

* Manual data extraction across disconnected tools.  
* Manual effort required to find correlations between multiple data sources.  
* Prioritization decisions are heavily influenced by insufficient data, product intuition, or the loudest problem.

## ---

**3\. User Flow**

Hypothesis based on secondary research — to be validated with user interviews.

**Current Flow (Without Signal)**

i. Opens Amazon BI Tools (QuickSight/Redshift) to monitor high-level KPIs — return rates, refund volumes, and total concession amounts — to identify specific problem categories.

  	ii. Executes complex SQL queries to pull raw data from independent tables.

iii. Pulls data into Excel, manually sorts by Return Reason Codes, and skims through 80–100 subjective reasons to understand the why.

iv. Opens CRM/Customer Service Platform to manually skim raw chat transcripts and call logs for insights or failure patterns.

   	v. Opens VoC/Review Analytics Engine to review feedback from sellers and customers.

   	vi. Opens Fraud & Abuse Risk Engine to identify additional issues.

  	vii. Analyzes post-return NPS and surveys to extract subjective insights.

viii. Compiles, collates, and synthesizes all gathered data. Applies product thinking and instinct to draft one or multiple Press Releases.

ix. Takes these Press Releases to team and stakeholder meetings to gather additional insights and feedback.

x. Synthesizes new inputs and aligns them with the Press Release.

xi. Through multiple iterations, finalizes the Press Release section of the PR/FAQ document.

**New Flow (With Signal)**

i. Opens Signal's dashboard, where data from multiple sources containing subjective feedback and quantitative patterns has been automatically pulled, processed, and synthesized overnight.

ii. Reviews the AI Insights section, which surfaces the top 5 problems ranked by frequency, confidence score, and corroborating data sources — each with citations for easy verification.

iii. Uses the chat interface to ask targeted follow-up questions and applies manual filters to sort data by time range (e.g., past week).

iv. Spends time aligning personal product sense and thinking with the AI recommendations, using them as a validated, data-backed foundation for drafting the Press Release.

v. Takes the Press Release to team and stakeholder meetings to gather additional insights and feedback.

    	vi. Synthesizes new inputs and aligns them with the Press Release.

vii. Through multiple iterations, defines the final problem statement in the Press Release — confident instinct backed by highly relevant, corroborated data.

## ---

**4\. Business Case**

**Time Spent by PMs**

A Returns PM spends 7–8 hours/week on quantitative discovery (metrics tracking, manual analysis, and data extraction).

Assuming 500 Returns PMs at Amazon: 500 × 8 hrs × $70/hr × 52 weeks \= **$14.56M annually**

**Returns Impact**

As of 2024, the return rate is 5–15% on annual sales of $638 billion.

Total return value: **$31.9B – $95.7B**

Amazon loses \~30% per returned item \= **$9.57B – $28.71B** in annual losses.

A 0.5% improvement in return rate \= **$47.85M – $143.55M** recovered annually.

**Total Business Case:** **$62.41M – $158.11M annually**

## ---

**5\. Metrics**

**North Star Metric**

**Metric:** % of quarterly PR/FAQ problems defined using tool-generated suggestions

**Baseline:** 0% | **Target:** 60%

**Measured by:** PMs manually tag problems as "product-intuition" or "tool-instinct", or the tool automatically tags problems it generated that are now being actively solved.

**KPI 1 — Adoption Rate**

**Baseline:** 0% | **Target:** 60%

**Measured by:** Number of unique logins; total new PMs onboarded

**KPI 2 — Discovery Time Saved**

**Baseline:** 7–8 hrs/week | **Target:** 2 hrs/week (assumption — to be validated)

**Measured by:** Hours logged on the tool; PM timesheet analysis

**Note:** This tool addresses quantitative discovery only. The 7–8 hour baseline reflects time on data extraction, correlation, and analysis — excluding user interviews and qualitative research.

## ---

**6\. Competitor Research**

**Productboard (Spark AI)**

**What it does:** Launched "Productboard Spark" in January 2026, an AI-first agentic experience optimized for PRD generation, feedback synthesis, and cross-project context.

**Why it falls short:** Data Security & Scale. A third-party SaaS platform cannot be legally authorized to ingest the 2.1 million rows of highly confidential Amazon Data Warehouse metrics processed nightly by Signal (as shown in the Data Status prototype). It also lacks native artifact export capabilities to Amazon's internal Quip and SIM ticketing environments.

**Dovetail (AI Agents & Dashboards)**

**What it does:** Launched autonomous AI Agents (e.g., "The Synthesizer") and trace-backed AI Dashboards in January 2026 that monitor feedback and trigger real work without coding.

**Why it falls short:** Qualitative Bias. Dovetail excels at analyzing user interviews but cannot ingest or securely query massive quantitative back-end logistics data (e.g., the $3.2M refund amounts and 8.4% return rates shown in Signal's Metrics tab).

**Amplitude (Agentic AI Analytics)**

**What it does:** Introduced autonomous AI agents in February 2026 (Global Agent, Session Replay Agent) for behavioral product discovery and continuous monitoring.

**Why it falls short:** Digital vs. Physical Disconnect. Amplitude is built for front-end digital behavior (clicks, funnels). It cannot map physical supply chain anomalies and specific Amazon Return Reason Codes (e.g., "Defective", "Wrong Item") to qualitative Zendesk customer service chats.

**Amazon Q Business**

**What it does:** AWS's internal generative AI assistant, which added support for structured "generative AI-based artifacts" (documents, code snippets) in February 2026\.

**Why it falls short:** General-Purpose limits. While highly secure, Q lacks the specialized, return-specific orchestration pipelines (14 dedicated RAGs explicitly segregating Zendesk from ADW) necessary to automatically rank problems by financial impact ($2.4M) without heavy manual prompting.

**Mixpanel**

**What it does:** Tracks user behavior and conversion funnels.

**Why it falls short:** Answers "what happened" — cannot answer "which problem should I solve next quarter."

## ---

**7\. Feasibility**

**Infrastructure**

Connects to Amazon's internal data infrastructure — Amazon Data Warehouse, BI Tools, CRM, VoC engines, Fraud & Abuse systems, Feature Boards, and Support Ticket Board.

**Embedded Architecture**

Built as an embedded system within the Amazon ecosystem. It minimizes cognitive load on PMs (no new tool to learn), keeps proprietary data secure within Amazon's infrastructure, and reuses existing data access permissions to reduce build cost.

**Data Pipeline — Two-Phase Processing**

Phase 1 — Rule-Based Logic: A nightly scheduled trigger pulls data from all sources and structures it by pre-defined Return Reason Codes, support ticket categories, review types, and feature board requests.

Phase 2 — LLM-Based Logic: Structured data is passed through the AI layer to extract high-quality, ranked insights.

**Dependency Risk**

The data pipeline is managed by the Data Engineering team. This creates a cross-team dependency — delays or changes in data infrastructure are outside the product team's control.

**AI Risk**

LLMs are probabilistic in nature and can hallucinate, leading to incorrect recommendations and prioritization of the wrong problems.

Mitigations: Multiple LLM judge nodes validate output against high-level metrics and ground truth benchmarks. Additionally, a human-in-the-loop process ensures PMs verify all tool suggestions, especially during the initial rollout phase.

## ---

**8\. Model Intelligence**

**How Data Flows**

i. Upon successful overnight processing, the tool loads multiple RAG systems — one per data source. This includes one RAG per Return Reason Code (e.g., 10 return reason codes \= 10 RAGs, each containing subjective feedback for that code), and separate RAGs for Support Tickets, Reviews, and Feature Board Requests.

ii. In addition to RAG data, the tool receives high-level structured metrics from the Data Warehouse and BI Tools.

iii. Multiple workflows run simultaneously — one per RAG — powered by the orchestrator.

iv. Each RAG node retrieves the top N most relevant data chunks sized to fit the model's context window. Example: If 500,000 items were returned under "Wrong Item" last week but the model supports only 200,000 chunks, the retrieval prompt fetches the most signal-rich 200,000 chunks. This process is separate for each node, as each retrieval prompt is designed to be highly targeted to its data source.

v. Retrieved chunks are passed as input variables into a dedicated LLM node with a source-specific system prompt. Each node generates structured output relevant to its data source. The system prompt for each node differs depending on the type of data being queried and analyzed.

vi. All first-layer outputs are merged and passed to a Master LLM Node with a higher context window. Its system prompt instructs it to act as a senior Returns PM and synthesize patterns across all data sources.

vii. Concurrently, LLM Judge Nodes validate first-layer outputs against high-level quantitative data. At this stage, the judge also cross-references the static, rule-based data from the Data Warehouse and BI Tools — representing high-level metrics, refund volume, and Return Reason Code frequency. Example: If the output recommends prioritizing "Wrong Item," the judge checks whether this aligns with the frequency and refund volume of "Wrong Item" in the structured data.

viii. Validated output is sent to the frontend dashboard via webhook — containing ranked problems, supporting metrics, and citations.

ix. The dashboard displays quantitative data alongside AI-generated insights. All recommendations include citations so PMs can verify evidence directly. The dashboard is designed to feel intuitive, similar to a BI tool.

**Why RAG (Not Fine-Tuning or Direct Prompting)**

    	i. The LLM has no knowledge of Amazon's internal data.

    	ii. Feeding full data volume directly causes hallucinations and exceeds context limits.

   	iii. RAG retrieves only the most relevant chunks per query — keeping input focused and within context window constraints.

    	iv. Separate RAGs per data source prevent signal contamination across data types.

    	v. Top-N chunk retrieval ensures the LLM receives high-signal input, not noise.

**Model Selected: DeepSeek R1**

i. Chosen for strong reasoning capability at low cost per token — well-suited for the synthesis and judgment tasks required across all three model tiers.

ii. Minimum requirement — three model tiers: Tier 1 consists of first-layer RAG query nodes. Tier 2 is the Master LLM Node (higher context window). Tier 3 is the LLM Judge Node.

iii. Selection criteria: Context window capacity relative to top-N chunk volume per data source, cost per token and per workflow trigger, and reasoning capability for synthesis and judgment tasks.

## ---

**9\. User Experience**

The Signal interface is a functional prototype built using n8n and Google Antigravity, utilizing visual elements inspired by Amazon's Design Theme. The UX is divided into three core tabs that map directly to the PM discovery workflow:

**Data Status (Feasibility & Trust):** This tab visualizes the status of data. By explicitly displaying the data sources, their numbers, the amounts of records processed, and the amount of data synthesized overnight, it serves as a trust factor for the user using the tool.

**Metrics (Quantitative Baseline):** A high-level operational dashboard displaying core Amazon KPIs like Return Rate, Refund Amount, and Fraud Flag Rate alongside standard Return Reason Code breakdowns (e.g., "Defective", "Wrong Item"). It features a contextual chat bar at the bottom, allowing PMs to interrogate metric spikes naturally without writing SQL. This section serves a replacement of the existing BI tool dashboard, so the PM does not need to visit another tool to see the same metrics. Moreover, the Chat Interface powered by RAG provides the option to analyze and query data with natural language.

**AI Insights (Split-Pane Synthesis):** The core discovery engine designed to combat AI hallucination. It uses a strict split-pane architecture. The left pane ranks the top synthesized problems (e.g., "App Crashes on Checkout" with a $2.4M estimated impact). The right pane strictly displays the raw source evidence—linking directly to actual Zendesk tickets, App Store reviews, etc.

**Artifact Export:** Insights are curated in a "Problem Notepad," allowing the PM to apply their own product intuition before exporting the data-backed narrative directly into a Quip PRFAQ draft or cutting an internal SIM ticket.

## ---

**10\. AI Evaluations**

Since this is an AI-native prototype, ensuring data accuracy is critical. Signal utilizes a practical, two-pronged evaluation framework tailored for our pilot phase:

**Offline Evals (Pre-Launch):** Before deployment, the Master LLM node's synthesis capability is tested against a "Golden Dataset" of historically successful, manually authored Amazon PRFAQs. Because AI can sometimes miss human nuance, we also incorporate a human-in-the-loop approach where Subject Matter Experts (SMEs) manually review a sample of the AI's outputs alongside this golden dataset. This ensures the discovered problems are not just mathematically accurate, but strategically relevant.

**Online Evals (Production):** In the live dashboard, a secondary LLM Judge Node calculates the "Grounded %" (Faithfulness Score) visible on the AI Insights panel, verifying that every claim is supported by the retrieved chunks. To capture on-the-go user sentiment, we've added a simple thumbs-up/thumbs-down feedback mechanism directly into the AI chat and insights interface. For the first two quarters of the pilot, we will actively track responses that trigger user feedback and analyze them against our golden dataset to continuously refine the n8n system prompts and improve overall accuracy.

## ---

**11\. Growth**

**Pilot Phase**

Signal launches with controlled access to a defined set of Returns PMs. Success is measured on two dimensions: time logged on the tool during quantitative discovery (tracked against the 7–8 hour baseline), and qualitative improvement in the insights PMs bring to stakeholder and team meetings.

During the pilot, users are kept actively in the loop — regular manual feedback sessions drive targeted improvements: tweaking system prompts, testing alternative models for higher context capacity, and refining output ranking logic. An in-tool feedback button allows PMs to flag issues in the moment.

The pilot tracks three health indicators:

* Trust: Is time logged on the tool stable or growing — or are PMs abandoning it after first use?  
* Usability: Can a non-technical PM navigate the tool without friction or training?  
* Self-communicating value: Does the tool make its own impact obvious without explanation?

**PLG Engine**

In the next quarterly planning cycle, pilot PMs walk into leadership reviews with data-backed problem statements — corroborated across return reason codes, support tickets, and reviews — instead of product-intuition assertions. The quality of the Press Release is visibly stronger, and leadership approves faster.

Post-meeting, other PMs in the room notice. They ask how the pilot PM synthesized the data so quickly. The pilot PM mentions Signal. Those PMs request access from management. No mandate required. No internal campaign. The tool grows because it makes PMs more credible in the highest-stakes moment of their quarter. As usage scales, Signal expands beyond Returns PMs into adjacent domains — Payments, Logistics, Fulfillment — each requiring only new RAGs pointed at new data sources.