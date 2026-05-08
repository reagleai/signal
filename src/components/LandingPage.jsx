import { useEffect, useRef } from 'react'
import { Database, Sparkles, MessageSquare, PenLine, Send, CheckCircle, Clock, ArrowRight, Layers, Brain, AlertTriangle, TrendingUp, ChevronRight, Zap, BarChart2, FileText, Search, ListChecks, Info } from 'lucide-react'

/* ─── Scroll-reveal hook ────────────────────────────────── */
function useScrollReveal() {
    const ref = useRef(null)
    useEffect(() => {
        const root = ref.current
        if (!root) return
        const els = root.querySelectorAll('.lp-reveal')
        const io = new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('lp-visible'); io.unobserve(e.target) } })
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
        els.forEach(el => io.observe(el))
        return () => io.disconnect()
    }, [])
    return ref
}

/* ─── Static data ───────────────────────────────────────── */
const SOURCES = [
    { label: 'Returns Data', color: '#FF9900', icon: 'DW' },
    { label: 'CRM Transcripts', color: '#03363D', icon: 'CRM' },
    { label: 'Customer Reviews', color: '#0D96F6', icon: 'VoC' },
    { label: 'Fraud Signals', color: '#C0392B', icon: 'FR' },
    { label: 'NPS Surveys', color: '#8B5CF6', icon: 'NPS' },
]
const CAPS = [
    { t: 'Data Status', d: 'See which sources are connected, how many records were processed, and whether RAGs are indexed.', s: 'live', I: Database },
    { t: 'AI Insights', d: 'Run the full pipeline. Get 5 ranked problems with confidence scores and supporting reason codes.', s: 'live', I: Sparkles },
    { t: 'Problem Notepad', d: 'Save problems, add your own reasoning, and build a data-backed problem statement.', s: 'live', I: PenLine },
    { t: 'Follow-up Chat', d: 'Ask the Master PM Node targeted questions. Answers are scoped to the analyzed data.', s: 'live', I: MessageSquare },
    { t: 'Feedback Loop', d: 'Submit feedback from inside the tool. Routed directly to the product tracking pipeline.', s: 'live', I: Send },
    { t: 'KPI Dashboard', d: 'High-level metrics - return rate, refund volume, fraud flags - with interactive chart breakdowns.', s: 'phase2', I: BarChart2 },
    { t: 'Evidence Citations', d: 'Every AI recommendation links to specific raw source records for verification.', s: 'phase2', I: FileText },
]
const TRADES = [
    { t: 'Separate RAG per source', d: 'Higher infra cost, but prevents signal contamination across data types.' },
    { t: 'LLM synthesis over rule-based ranking', d: "Probabilistic, but rules can't synthesize subjective feedback across 5 source types. Judge nodes mitigate hallucination." },
    { t: 'Human-in-the-loop by design', d: "Slower than full automation, but the PM's product judgment is the final filter." },
    { t: 'Prototype on n8n', d: 'Not production-scale, but validates pipeline logic and UX before infrastructure investment.' },
]
const STEPS = [
    { n: '01', t: 'Connect your data sources', b: 'Signal pulls from 5 data types: SQL return records, CRM transcripts, customer reviews, fraud/abuse flags, and NPS survey responses. Each source is indexed into its own knowledge base so signals stay clean.', I: Database },
    { n: '02', t: 'Run the analysis', b: 'One click triggers a multi-stage AI pipeline. Each data source is analyzed by a specialized layer. Then a master synthesis ranks the results across all sources - in real time.', I: Search },
    { n: '03', t: 'Get ranked problem signals', b: 'You receive the top 5 problems - ranked by impact and frequency, with confidence scores, supporting evidence, and cross-source patterns. Ask follow-up questions in the built-in chat.', I: ListChecks },
]
const METRICS = [
    { l: 'Discovery Time', b: '7–8 hrs/week', g: '~2 hrs/week', m: 'Time logged on tool vs. manual extraction baseline' },
    { l: 'Signal Adoption', b: '0%', g: '60%', m: 'PM tagging source of problem definition' },
    { l: 'Trust & Retention', b: '-', g: 'Stable weekly usage', m: 'Unique weekly logins, session depth, return rate' },
]
const P2 = ['Nightly scheduled pipeline - remove manual trigger', 'Live KPI dashboard replacing mock data', 'Citation split-pane linking claims to raw evidence', 'LLM Judge Nodes validating groundedness', 'Per-category RAG namespaces (10+ vs. current 5)']
const P3 = ['Embed into existing PM toolchain - zero context-switching', 'Offline evals against historical problem definitions', 'Expand to adjacent domains: payments, logistics, fulfillment', 'Product-led growth through PM credibility in leadership reviews']
const GAP_CARDS = [
    { t: 'Qualitative-First Tools', b: "Platforms like Dovetail and Productboard excel at synthesizing user interviews - but can't ingest or query large-scale quantitative backend data like return rates, refund volumes, or fraud patterns.", I: MessageSquare },
    { t: 'Behavioral Analytics', b: "Tools like Amplitude and Mixpanel track digital behavior - clicks, funnels, sessions - but can't map physical supply chain events or subjective customer feedback to operational outcomes.", I: TrendingUp },
    { t: 'General AI Assistants', b: 'Broad AI tools can answer questions, but lack the specialized retrieval pipelines needed to rank problems across multiple data types without heavy manual prompt engineering.', I: Brain },
]

/* ─── Sub-components ────────────────────────────────────── */
const SL = ({ children }) => <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-[#FF9900] mb-3">{children}</div>
const SH = ({ children }) => <h2 className="text-[22px] sm:text-[28px] font-bold text-[#0F1111] leading-[1.18]">{children}</h2>
const Badge = ({ s }) => s === 'live'
    ? <span className="inline-flex items-center gap-1 bg-[#067D62]/10 text-[#067D62] border border-[#067D62]/20 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"><CheckCircle size={10} /> Live</span>
    : <span className="inline-flex items-center gap-1 bg-[#FFF8EE] text-[#B7791F] border border-[#FF9900]/20 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"><Clock size={10} /> Phase 2</span>

const Logo = ({ size = 26 }) => <svg width={size} height={size} viewBox="0 0 26 26" fill="none"><path d="M13 1L24.1244 7V19L13 25L1.87564 19V7L13 1Z" stroke="#FF9900" strokeWidth="2" fill="none" /></svg>

const Btn = ({ onClick, children, cls = '' }) => (
    <button onClick={onClick} className={`inline-flex items-center gap-2 bg-[#FF9900] text-white rounded-lg font-semibold hover:bg-[#E68A00] active:scale-[0.97] transition-all ${cls}`}>
        {children}
    </button>
)

/* ─── Main ──────────────────────────────────────────────── */
export default function LandingPage({ onEnterDashboard }) {
    const rootRef = useScrollReveal()

    return (
        <div ref={rootRef} className="min-h-screen w-screen overflow-x-hidden bg-[#F7F8FA] font-['Inter']">

            {/* ══ NAVBAR ══ */}
            <header className="sticky top-0 z-50 h-14 sm:h-16 bg-[#232F3E] px-4 sm:px-8 flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
                <div className="flex items-center gap-2 sm:gap-3">
                    <Logo />
                    <span className="text-[20px] sm:text-[22px] font-bold text-white" style={{ letterSpacing: '-0.03em' }}>Signal</span>
                    <div className="hidden md:flex flex-col justify-center ml-1 border-l border-white/20 pl-3">
                        <span className="text-[11px] text-white/60">Returns Discovery</span>
                    </div>
                </div>
                <Btn onClick={onEnterDashboard} cls="px-4 py-2 text-[13px]">Open Live Prototype <ArrowRight size={14} /></Btn>
            </header>

            {/* ══ HERO ══ */}
            <section className="relative overflow-hidden">
                {/* Subtle gradient bg */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#F7F8FA] via-[#FFF8EE]/30 to-[#F7F8FA] pointer-events-none" />
                <div className="relative max-w-[1000px] mx-auto px-4 sm:px-8 pt-16 sm:pt-24 pb-14 sm:pb-20">
                    <div className="lp-hero-entry"><SL>RETURNS DISCOVERY TOOL</SL></div>
                    <h1 className="lp-hero-entry lp-hero-entry-d1 text-[28px] sm:text-[42px] font-bold text-[#0F1111] leading-[1.12] max-w-[720px]">
                        Turn 5 fragmented data sources into <span className="hero-accent-word">ranked problem signals</span> - in minutes, not hours.
                    </h1>
                    <p className="lp-hero-entry lp-hero-entry-d2 text-[15px] sm:text-[17px] text-[#565959] mt-5 max-w-[640px] leading-relaxed">
                        Signal ingests returns data, CRM transcripts, reviews, fraud signals, and NPS surveys, then surfaces the top 5 problems worth solving next - with evidence and confidence scores. Not raw insight dumps - <span className="font-semibold text-[#0F1111]">a ranked starting point for user research and roadmap prioritization.</span>
                    </p>
                    <div className="lp-hero-entry lp-hero-entry-d3 flex items-center gap-2 mt-6 text-[12px] text-[#9CA3A3]">
                        <span className="w-2 h-2 rounded-full bg-[#067D62] pulse-dot" />
                        Currently processing 5,700+ records across 5 sources · Live prototype with real data
                    </div>
                    <div className="lp-hero-entry lp-hero-entry-d4 mt-8">
                        <Btn onClick={onEnterDashboard} cls="px-6 py-3 text-[14px] shadow-[0_4px_14px_rgba(255,153,0,0.35)]">Explore the Prototype <ArrowRight size={15} /></Btn>
                    </div>
                </div>
            </section>

            {/* ══ WHY NOW ══ */}
            <section className="bg-white border-t border-b border-[#E8EAED]">
                <div className="max-w-[1000px] mx-auto px-4 sm:px-8 py-14 sm:py-20">
                    <div className="lp-reveal"><SL>WHY EXISTING TOOLS FALL SHORT</SL></div>
                    <div className="lp-reveal"><SH>Every current solution solves half the problem.</SH></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-8 lp-stagger">
                        {GAP_CARDS.map(c => {
                            const Icon = c.I
                            return (
                                <div key={c.t} className="lp-reveal lp-card-hover bg-[#F7F8FA] border border-[#E8EAED] rounded-xl p-5 sm:p-6">
                                    <div className="w-9 h-9 rounded-lg bg-[#FF9900]/10 flex items-center justify-center mb-4"><Icon size={18} className="text-[#FF9900]" /></div>
                                    <h3 className="text-[14px] sm:text-[15px] font-semibold text-[#0F1111] mb-2">{c.t}</h3>
                                    <p className="text-[13px] text-[#565959] leading-relaxed">{c.b}</p>
                                </div>
                            )
                        })}
                    </div>
                    <p className="lp-reveal text-[13px] sm:text-[14px] text-[#565959] mt-8 max-w-[640px] leading-relaxed">
                        Signal is designed for the gap: <span className="font-semibold text-[#0F1111]">cross-source synthesis for operational PMs</span> who need ranked, evidence-backed problem signals - not another dashboard.
                    </p>
                </div>
            </section>

            {/* ══ HOW IT WORKS ══ */}
            <section className="max-w-[1000px] mx-auto px-4 sm:px-8 py-14 sm:py-20">
                <div className="lp-reveal"><SL>HOW IT WORKS</SL></div>
                <div className="lp-reveal"><SH>From your data to prioritized signals - three steps.</SH></div>

                {/* Source badges */}
                <div className="flex flex-wrap gap-2 mt-8 mb-10 lp-stagger">
                    {SOURCES.map(n => (
                        <div key={n.label} className="lp-reveal lp-card-hover flex items-center gap-2 bg-white border border-[#E8EAED] rounded-lg px-3 py-2 cursor-default">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[9px] font-bold" style={{ background: n.color }}>{n.icon}</div>
                            <span className="text-[12px] text-[#565959] font-medium">{n.label}</span>
                        </div>
                    ))}
                </div>

                {/* User-first steps with connecting line */}
                <div className="relative flex flex-col gap-4">
                    {/* Vertical connector */}
                    <div className="hidden sm:block absolute left-[19px] top-[48px] bottom-[48px] w-[2px] phase-timeline-line rounded-full flow-connector" />
                    {STEPS.map(l => {
                        const Icon = l.I
                        return (
                            <div key={l.n} className="lp-reveal lp-card-hover relative bg-white border border-[#E8EAED] rounded-xl p-5 sm:p-6 flex items-start gap-4 sm:gap-5">
                                <div className="w-10 h-10 rounded-xl bg-[#FF9900] flex items-center justify-center flex-shrink-0 relative z-10">
                                    <span className="text-[14px] font-bold text-white">{l.n}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <h3 className="text-[15px] font-semibold text-[#0F1111]">{l.t}</h3>
                                        <Icon size={15} className="text-[#9CA3A3]" />
                                    </div>
                                    <p className="text-[13px] text-[#565959] leading-relaxed">{l.b}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Subtle implementation note */}
                <div className="lp-reveal flex items-start gap-2.5 mt-6 text-[12px] text-[#9CA3A3]">
                    <Info size={14} className="text-[#9CA3A3] flex-shrink-0 mt-0.5" />
                    <span><span className="font-medium text-[#565959]">In this prototype:</span> Data sources connect via Google Sheets. Direct database integrations and scheduled runs are planned for the next phase.</span>
                </div>
            </section>

            {/* ══ WHAT WORKS TODAY ══ */}
            <section className="bg-white border-t border-b border-[#E8EAED]">
                <div className="max-w-[1000px] mx-auto px-4 sm:px-8 py-14 sm:py-20">
                    <div className="lp-reveal"><SL>CURRENT PROTOTYPE · PHASE 1</SL></div>
                    <div className="lp-reveal"><SH>What you can use right now.</SH></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 lp-stagger">
                        {CAPS.map(c => {
                            const Icon = c.I
                            return (
                                <div key={c.t} className="lp-reveal lp-card-hover bg-[#F7F8FA] border border-[#E8EAED] rounded-xl p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-9 h-9 rounded-lg bg-[#FF9900]/10 flex items-center justify-center"><Icon size={18} className="text-[#FF9900]" /></div>
                                        <Badge s={c.s} />
                                    </div>
                                    <h3 className="text-[14px] font-semibold text-[#0F1111] mb-1.5">{c.t}</h3>
                                    <p className="text-[12px] sm:text-[13px] text-[#565959] leading-relaxed">{c.d}</p>
                                </div>
                            )
                        })}
                    </div>
                    <div className="lp-reveal bg-[#FFF8EE] border border-[#FF9900]/20 rounded-xl p-4 sm:p-5 mt-8 flex items-start gap-3">
                        <Zap size={18} className="text-[#FF9900] flex-shrink-0 mt-0.5" />
                        <p className="text-[12px] sm:text-[13px] text-[#565959] leading-relaxed">
                            The prototype runs on a live n8n pipeline connected to real data. <span className="font-semibold text-[#B7791F]">"Live" means the backend processes your request through the full RAG → LLM → synthesis flow in real time.</span>
                        </p>
                    </div>
                </div>
            </section>

            {/* ══ IMPACT & TRADEOFFS ══ */}
            <section className="max-w-[1000px] mx-auto px-4 sm:px-8 py-14 sm:py-20">
                <div className="lp-reveal"><SL>MEASURING SUCCESS</SL></div>
                <div className="lp-reveal"><SH>What success looks like - and what was deliberately traded off.</SH></div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                    {/* Metrics */}
                    <div>
                        <h3 className="lp-reveal text-[13px] font-semibold uppercase tracking-wide text-[#9CA3A3] mb-4">Success Metrics</h3>
                        <div className="flex flex-col gap-3 lp-stagger">
                            {METRICS.map(m => (
                                <div key={m.l} className="lp-reveal lp-card-hover bg-white border border-[#E8EAED] rounded-xl p-4 sm:p-5">
                                    <div className="text-[14px] font-semibold text-[#0F1111] mb-2">{m.l}</div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-[12px] text-[#9CA3A3]">Baseline: <span className="text-[#565959] font-medium">{m.b}</span></span>
                                        <ArrowRight size={12} className="text-[#E8EAED]" />
                                        <span className="text-[12px] text-[#FF9900] font-semibold">Target: {m.g}</span>
                                    </div>
                                    <div className="text-[11px] text-[#9CA3A3]">Measured by: {m.m}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Tradeoffs */}
                    <div>
                        <h3 className="lp-reveal text-[13px] font-semibold uppercase tracking-wide text-[#9CA3A3] mb-4">Key Tradeoffs</h3>
                        <div className="flex flex-col gap-3 lp-stagger">
                            {TRADES.map(tr => (
                                <div key={tr.t} className="lp-reveal lp-card-hover bg-white border border-[#E8EAED] rounded-xl p-4 sm:p-5">
                                    <div className="flex items-start gap-2.5">
                                        <AlertTriangle size={14} className="text-[#B7791F] flex-shrink-0 mt-0.5" />
                                        <div>
                                            <div className="text-[13px] font-semibold text-[#0F1111] mb-1">{tr.t}</div>
                                            <p className="text-[12px] text-[#565959] leading-relaxed">{tr.d}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══ ROADMAP ══ */}
            <section className="bg-white border-t border-b border-[#E8EAED]">
                <div className="max-w-[1000px] mx-auto px-4 sm:px-8 py-14 sm:py-20">
                    <div className="lp-reveal"><SL>WHAT COMES NEXT</SL></div>
                    <div className="lp-reveal"><SH>From prototype to production - in two phases.</SH></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                        <div className="lp-reveal lp-card-hover border border-[#E8EAED] rounded-xl p-5 sm:p-6 bg-[#F7F8FA]">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="bg-[#FFF8EE] text-[#B7791F] border border-[#FF9900]/20 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">Phase 2</span>
                                <span className="text-[13px] font-semibold text-[#0F1111]">Production MVP</span>
                            </div>
                            <ul className="flex flex-col gap-2.5">
                                {P2.map(i => <li key={i} className="flex items-start gap-2 text-[12px] sm:text-[13px] text-[#565959]"><ChevronRight size={13} className="text-[#FF9900] flex-shrink-0 mt-0.5" />{i}</li>)}
                            </ul>
                        </div>
                        <div className="lp-reveal lp-card-hover border border-[#E8EAED] rounded-xl p-5 sm:p-6 bg-[#F7F8FA]">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="bg-[#232F3E]/10 text-[#232F3E] border border-[#232F3E]/20 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">Phase 3</span>
                                <span className="text-[13px] font-semibold text-[#0F1111]">Scale & Embed</span>
                            </div>
                            <ul className="flex flex-col gap-2.5">
                                {P3.map(i => <li key={i} className="flex items-start gap-2 text-[12px] sm:text-[13px] text-[#565959]"><ChevronRight size={13} className="text-[#9CA3A3] flex-shrink-0 mt-0.5" />{i}</li>)}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══ BOTTOM CTA ══ */}
            <section className="bg-[#232F3E] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#232F3E] via-[#2a3a4e] to-[#232F3E] pointer-events-none" />
                <div className="relative max-w-[1000px] mx-auto px-4 sm:px-8 py-14 sm:py-20 text-center lp-reveal">
                    <h2 className="text-[22px] sm:text-[28px] font-bold text-white mb-4">Not summarization - prioritization for decision-making.</h2>
                    <p className="text-[13px] sm:text-[14px] text-white/70 mb-2 max-w-[560px] mx-auto leading-relaxed">
                        Signal reduces PM synthesis time from hours to minutes by pulling fragmented return signals across sources, structuring them, and ranking the top problem signals for further validation.
                    </p>
                    <p className="text-[13px] sm:text-[14px] text-white/50 mb-8 max-w-[560px] mx-auto leading-relaxed">
                        The output is not raw insight dumps - it is <span className="text-white/90 font-semibold">a ranked starting point for user research and roadmap prioritization.</span>
                    </p>
                    <Btn onClick={onEnterDashboard} cls="px-8 py-3.5 text-[15px] shadow-[0_4px_20px_rgba(255,153,0,0.4)]">Open Live Prototype <ArrowRight size={16} /></Btn>
                    <div className="mt-6 text-[11px] text-white/30">
                        Built with n8n · Pinecone · DeepSeek · React · Live prototype processing 5,700+ records
                    </div>
                </div>
            </section>

            {/* ══ FOOTER ══ */}
            <footer className="bg-[#F7F8FA] border-t border-[#E8EAED] py-6 sm:py-8">
                <div className="max-w-[1000px] mx-auto px-4 sm:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-2"><Logo size={18} /><span className="text-[13px] font-semibold text-[#0F1111]">Signal</span></div>
                    <span className="text-[12px] text-[#9CA3A3]">Built by Ajay Sharma · <a href="https://www.linkedin.com/in/workwithajay/" target="_blank" rel="noopener noreferrer" className="hover:text-[#565959] underline transition-colors">LinkedIn</a></span>
                </div>
            </footer>
        </div>
    )
}
