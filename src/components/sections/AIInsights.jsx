import { useState, useEffect } from 'react'
import { Calendar, ChevronDown, PenLine, ExternalLink, BookOpen, FileText, Clock, Send, X, AlertCircle, RefreshCw, CheckCircle, XCircle, Brain, Target, ShieldAlert, Sparkles } from 'lucide-react'
import { useApp, useDurableAction } from '../../context/AppContext'
import { fetchAIInsights } from '../../api/aiInsightsAdapter'
import Badge from '../shared/Badge'
import CitationBadge from '../shared/CitationBadge'
import ChatBot from '../shared/ChatBot'
import ShareModal from '../shared/ShareModal'
import Spinner from '../shared/Spinner'

// Source dot colors
const sourceColors = {
    "Zendesk": "#03363D",
    "App Store Reviews": "#0D96F6",
    "DW": "#FF9900",
    "Productboard": "#8B5CF6"
}

export default function AIInsights() {
    const {
        state,
        setActiveSection,
        setSelectedProblemId,
        setActiveCitations,
        addToNotepad,
        updateNotepadItem,
        removeFromNotepad,
        addToast,
    } = useApp()

    const aiAction = useDurableAction('ai-insights')
    const [expandedId, setExpandedId] = useState(null)
    const [shareOpen, setShareOpen] = useState(false)

    const isLoading = aiAction.status === 'running';
    const isRecovering = aiAction.status === 'recovering';
    const error = aiAction.error;
    const status = aiAction.status;
    const lastKnownData = aiAction.data;
    const hasData = !!lastKnownData;

    const handleAnalyze = async () => {
        const jobId = `job-${Date.now()}`;
        await aiAction.runAction(async () => {
            return await fetchAIInsights({
                webhookUrl: '/api/ai-insights',
                payload: { time_window: state.dateRange.preset, request_id: jobId }
            });
        });
    }

    const masterProblems = lastKnownData?.masterProblems || []
    const citationLibrary = lastKnownData?.citationLibrary || []

    const rangeLabel =
        state.dateRange.preset === '7d' ? 'Past 7 Days' :
            state.dateRange.preset === '30d' ? 'Past 30 Days' :
                state.dateRange.preset === '90d' ? 'Past 90 Days' :
                    `${state.dateRange.startDate?.toLocaleDateString()} – ${state.dateRange.endDate?.toLocaleDateString()}`

    const selected = masterProblems.find(p => p.id === state.selectedProblemId)
    const visibleCitations = state.activeCitations
        .map(id => citationLibrary.find(c => c.id === id))
        .filter(Boolean)

    const isInNotepad = (problemId) => state.notePadItems.some(i => i.problemId === problemId)

    const handleCardClick = (problem) => {
        if (expandedId === problem.id) {
            setExpandedId(null)
        } else {
            setExpandedId(problem.id)
            setSelectedProblemId(problem.id)
            setActiveCitations(problem.citationIds)
        }
    }

    const handleAddToNotepad = (problem) => {
        addToNotepad({
            problemId: problem.id,
            rank: problem.rank,
            title: problem.title,
            confidence: problem.confidence,
            groundedness: problem.groundedness,
            estimatedImpact: problem.estimatedImpact,
            reasonCodes: problem.reasonCodes,
            citationIds: problem.citationIds,
            pmReasoning: "",
            addedAt: new Date().toISOString()
        })
    }



    const summary = lastKnownData?.summary || state.lastSyncInfo || {
        activeSources: 5,
        ragIndexed: 14,
        recordsProcessed: '47,832'
    }

    const confColor = (v) => v >= 85 ? '#067D62' : v >= 70 ? '#B7791F' : '#C0392B'

    return (
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8 pb-24 sm:pb-8" id="section-ai-insights" role="tabpanel" aria-label="AI Insights">
            <div className="flex flex-col xl:flex-row gap-6 items-start">
                {/* ═══ LEFT COLUMN ═══ */}
                <div className="flex-[3] min-w-0 w-full xl:w-auto">
                    {/* PAGE HEADER */}
                    <div className="mb-6">
                        <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-[#FF9900] mb-2">SIGNAL — SECTION 3</div>
                        <h1 className="text-[22px] sm:text-[28px] font-bold text-[#0F1111]">AI Insights</h1>
                        <p className="text-[13px] sm:text-[14px] text-[#565959] mt-2 leading-relaxed max-w-[560px]">
                            5 problems synthesized by Signal's Master PM Node from {summary.recordsProcessed} return events and {summary.ragIndexed} knowledge bases. Confidence scores and groundedness validated by LLM Judge nodes.
                        </p>
                    </div>

                    {/* DATE RANGE INDICATOR & TRIGGER */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3 mb-6">
                        <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-[#FF9900]" />
                            <span className="text-[12px] sm:text-[13px] text-[#565959]">Insights generated from: {rangeLabel} data · {summary.recordsProcessed} events</span>
                        </div>
                        <button
                            onClick={handleAnalyze}
                            disabled={isLoading}
                            className={`bg-[#232F3E] text-white px-4 py-2 rounded-lg text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#374151]'}`}
                        >
                            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                            {isLoading ? 'Analyzing...' : isRecovering ? 'Restart Analysis' : 'Analyze Signals'}
                        </button>
                    </div>

                    {/* ERROR BANNER */}
                    {(error && status === 'failed') && (
                        <div className="mb-6 bg-[#FFF4F4] border border-[#F8CCCC] rounded-xl p-4 flex items-start gap-3">
                            <AlertCircle size={18} className="text-[#C0392B] flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <h4 className="text-[13px] font-bold text-[#C0392B] mb-1">Analysis Failed</h4>
                                <p className="text-[12px] text-[#C0392B]/80">{error}</p>
                            </div>
                            <button onClick={handleAnalyze} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#F8CCCC] rounded-lg text-[12px] font-semibold text-[#C0392B] hover:bg-[#FDF0F0] transition-colors">
                                <RefreshCw size={12} /> Retry
                            </button>
                        </div>
                    )}

                    {/* ═══ MASTER PROBLEMS LIST ═══ */}
                    {isLoading && !hasData ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white border border-[#E8EAED] rounded-xl shadow-sm">
                            <div className="w-10 h-10 border-4 border-[#FF9900]/20 border-t-[#FF9900] rounded-full animate-spin mb-4" />
                            <h3 className="text-[15px] font-semibold text-[#0F1111] mb-2">Analyzing Signals...</h3>
                            <p className="text-[13px] text-[#565959]">Master PM Node is running {state.dateRange.preset} data through LLM models.</p>
                        </div>
                    ) : isRecovering ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-[#FFF8EE] border border-[#FF9900]/20 rounded-xl shadow-sm text-center px-4">
                            <div className="bg-[#FF9900]/10 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                                <AlertCircle size={24} className="text-[#B7791F]" />
                            </div>
                            <h3 className="text-[15px] font-semibold text-[#0F1111] mb-2">Analysis Interrupted</h3>
                            <p className="text-[13px] text-[#565959] max-w-[360px] mb-4">The previous analysis was interrupted by a page reload. We cannot confirm if it completed successfully.</p>
                            <button
                                onClick={handleAnalyze}
                                className="bg-[#FF9900] text-white px-6 py-2.5 rounded-lg text-[14px] font-semibold hover:bg-[#E68A00] transition-colors"
                            >
                                Restart Analysis
                            </button>
                            {hasData && (
                                <button className="mt-4 text-[#565959] text-[12px] underline" onClick={() => aiAction.setStatus('completed')}>
                                    Dismiss and view last successful results
                                </button>
                            )}
                        </div>
                    ) : !hasData ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white border border-[#E8EAED] rounded-xl shadow-sm text-center px-4">
                            <div className="bg-[#F7F8FA] w-14 h-14 rounded-full flex items-center justify-center mb-4">
                                <BookOpen size={24} className="text-[#9CA3A3]" />
                            </div>
                            <h3 className="text-[15px] font-semibold text-[#0F1111] mb-2">Ready to Analyze</h3>
                            <p className="text-[13px] text-[#565959] max-w-[300px] mb-4">Click "Analyze Signals" to process data through the Master PM Node.</p>
                            <button
                                onClick={handleAnalyze}
                                className="bg-[#FF9900] text-white px-6 py-2.5 rounded-lg text-[14px] font-semibold hover:bg-[#E68A00] transition-colors"
                            >
                                Analyze Signals
                            </button>
                        </div>
                    ) : masterProblems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white border border-[#E8EAED] rounded-xl shadow-sm text-center px-4">
                            <div className="bg-[#F7F8FA] w-14 h-14 rounded-full flex items-center justify-center mb-4">
                                <BookOpen size={24} className="text-[#9CA3A3]" />
                            </div>
                            <h3 className="text-[15px] font-semibold text-[#0F1111] mb-2">No problems detected</h3>
                            <p className="text-[13px] text-[#565959] max-w-[300px]">The AI analysis for the selected time window yielded no major friction points.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 mb-8">
                            {masterProblems.map(problem => {
                                const isExpanded = expandedId === problem.id
                                return (
                                    <div
                                        key={problem.id}
                                        className="bg-white border rounded-xl shadow-sm cursor-pointer transition-all duration-150"
                                        style={{
                                            borderColor: isExpanded ? '#FF9900' : '#E8EAED',
                                            boxShadow: isExpanded
                                                ? '0 0 0 2px rgba(255,153,0,0.2), 0 4px 16px rgba(0,0,0,0.08)'
                                                : '0 1px 4px rgba(0,0,0,0.08)'
                                        }}
                                        onMouseEnter={(e) => { if (!isExpanded) { e.currentTarget.style.borderColor = 'rgba(255,153,0,0.4)' } }}
                                        onMouseLeave={(e) => { if (!isExpanded) { e.currentTarget.style.borderColor = '#E8EAED' } }}
                                    >
                                        {/* ── HEADER ── */}
                                        <div className="p-4 sm:p-5" onClick={() => handleCardClick(problem)}>
                                            <div className="flex items-start gap-3 sm:gap-4">
                                                {/* Rank badge */}
                                                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#FF9900] flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <span className="text-[14px] sm:text-[16px] font-bold text-white">{problem.rank}</span>
                                                </div>

                                                {/* Main content */}
                                                <div className="flex-1 min-w-0">
                                                    {/* ROW 1 — Title only */}
                                                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-2">
                                                        <span className="text-[14px] sm:text-[15px] font-semibold text-[#0F1111]">{problem.title}</span>
                                                    </div>

                                                    {/* ROW 2 — Signal metrics */}
                                                    <div className="flex items-center gap-3 sm:gap-5 flex-wrap mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide text-[#9CA3A3]">Confidence</span>
                                                            <div className="w-16 sm:w-20 h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
                                                                <div className="h-full rounded-full" style={{ width: `${problem.confidence}%`, background: confColor(problem.confidence) }} />
                                                            </div>
                                                            <span className="text-[12px] font-semibold text-[#0F1111]">{problem.confidence}%</span>
                                                        </div>
                                                        <div className="w-px h-4 bg-[#E8EAED] hidden sm:block" />
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide text-[#9CA3A3]">Sources</span>
                                                            <div className="flex gap-0.5">
                                                                {[0, 1, 2].map(i => (
                                                                    <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: i < problem.sources.length ? '#FF9900' : '#E8EAED' }} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="w-px h-4 bg-[#E8EAED] hidden sm:block" />
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide text-[#9CA3A3]">Grounded</span>
                                                            <span className="text-[12px] font-semibold" style={{ color: confColor(problem.groundedness) }}>{problem.groundedness}%</span>
                                                        </div>
                                                        <div className="w-px h-4 bg-[#E8EAED] hidden sm:block" />
                                                        <div className="flex items-center">
                                                            <span className="text-[11px] sm:text-[12px] font-medium text-[#565959]">{problem.frequency} events</span>
                                                        </div>
                                                    </div>

                                                    {/* ROW 3 — Source chips + citations */}
                                                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-2">
                                                        {problem.sources.map(s => (
                                                            <span key={s} className="bg-[#F7F8FA] border border-[#E8EAED] rounded-full px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] text-[#565959] font-medium">{s}</span>
                                                        ))}
                                                        <div className="flex gap-0.5 sm:ml-auto">
                                                            {problem.citationIds.map(id => (
                                                                <CitationBadge key={id} number={id} onClick={(e) => { e.stopPropagation(); setActiveCitations([id]); setSelectedProblemId(problem.id) }} />
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* ROW 4 — Reason code tags */}
                                                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mt-1">
                                                        <span className="text-[10px] sm:text-[11px] text-[#9CA3A3] mr-1">Driving return codes:</span>
                                                        {problem.reasonCodes.map(code => (
                                                            <span key={code} className="flex items-center gap-1 sm:gap-1.5 bg-[#F7F8FA] border border-[#E8EAED] rounded-full px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] text-[#565959] font-medium">
                                                                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: reasonCodeColors[code] || '#9CA3A3' }} />
                                                                {code}
                                                            </span>
                                                        ))}

                                                    </div>
                                                </div>

                                                {/* Chevron */}
                                                <ChevronDown size={16} className="text-[#9CA3A3] flex-shrink-0 mt-1 transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                                            </div>
                                        </div>

                                        {/* ── EXPANDED SECTION ── */}
                                        <div style={{ maxHeight: isExpanded ? '1200px' : '0px', opacity: isExpanded ? 1 : 0, overflow: 'hidden', transition: 'max-height 300ms ease, opacity 200ms ease' }}>
                                            <div className="border-t border-[#F0F0F0] pt-4 sm:pt-5 pb-4 sm:pb-5 px-4 sm:px-5">
                                                {/* What each source found */}
                                                <h3 className="text-[12px] font-semibold uppercase tracking-wide text-[#9CA3A3] mb-4">What each source found</h3>
                                                {Object.entries(problem.nodeProblems).map(([source, items]) => (
                                                    <div key={source} className="mb-4 last:mb-0">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: sourceColors[source] || '#9CA3A3' }} />
                                                            <span className="text-[12px] font-semibold text-[#0F1111]">{source}</span>
                                                        </div>
                                                        {items.map((item, idx) => (
                                                            <div key={idx} className="bg-[#F7F8FA] rounded-lg px-3 sm:px-4 py-3 mb-1.5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 hover:bg-[#FFF8EE] transition-colors">
                                                                <span className="text-[12px] sm:text-[13px] text-[#0F1111] flex-1">{item.title}</span>
                                                                <div className="flex items-center gap-2">
                                                                    {item.count !== null && (
                                                                        <span className="bg-[#FF9900]/10 text-[#B7791F] rounded-full px-2 py-0.5 text-[11px] font-semibold">{item.count} events</span>
                                                                    )}
                                                                    {item.citationIds.map(id => (
                                                                        <CitationBadge key={id} number={id} onClick={(e) => { e.stopPropagation(); setActiveCitations([id]) }} />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))}

                                                {/* Sub-reason drivers */}
                                                {problem.subReasonDrivers.length > 0 && (
                                                    <div className="mt-4 pt-4 border-t border-[#F0F0F0]">
                                                        <h3 className="text-[12px] font-semibold uppercase tracking-wide text-[#9CA3A3] mb-3">Sub-reason impact</h3>
                                                        {problem.subReasonDrivers.map((driver, idx) => (
                                                            <div key={idx} className="bg-[#FFF8EE] border border-[#FF9900]/20 rounded-lg px-3 sm:px-4 py-3 mb-2">
                                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                                    <span className="w-2 h-2 rounded-full" style={{ background: reasonCodeColors[driver.code] || '#9CA3A3' }} />
                                                                    <span className="text-[11px] font-medium text-[#B7791F]">{driver.code}</span>
                                                                    <span className="text-[#9CA3A3]">→</span>
                                                                    <span className="text-[12px] font-semibold text-[#0F1111]">{driver.subReason}</span>
                                                                    <span className="sm:ml-auto bg-white border border-[#E8EAED] rounded-full px-2 py-0.5 text-[11px] text-[#565959]">{driver.contributionPct}% contribution</span>
                                                                </div>
                                                                <div className="text-[11px] text-[#565959] italic">{driver.note}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Actions row */}
                                                <div className="mt-5 pt-4 border-t border-[#F0F0F0] flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                                    {isInNotepad(problem.id) ? (
                                                        <span className="bg-[#067D62]/10 text-[#067D62] border border-[#067D62]/20 rounded-lg px-4 py-2 text-[13px] font-semibold flex items-center justify-center gap-2 min-h-[44px]">
                                                            ✓ In Notepad
                                                        </span>
                                                    ) : (
                                                        <button onClick={(e) => { e.stopPropagation(); handleAddToNotepad(problem) }} className="bg-[#FF9900] text-white rounded-lg px-4 py-2 text-[13px] font-semibold flex items-center justify-center gap-2 hover:bg-[#E68A00] transition-colors min-h-[44px]">
                                                            <PenLine size={14} /> Add to Notepad
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* ═══ CHATBOT ═══ */}
                    <div className="mb-8">
                        <ChatBot
                            scope="insights"
                            title="Ask the Master PM Node"
                            subtitle="Scoped to the 5 problems above. All answers include citations and reason code context."
                            placeholder='e.g. "Why is the checkout crash ranked #1?" or "Which return code is Problem 2 driving?"'
                            suggestedQueries={[
                                "Why is the checkout crash ranked #1?",
                                "Which return reason code is Problem 2 driving?",
                                "Has the 'Defective' sub-reason spike been explained?",
                                "Which problem has the most user impact?"
                            ]}
                        />
                    </div>
                </div>

                {/* ═══ RIGHT COLUMN (sticky) — stacks below on mobile ═══ */}
                <div className="flex-[2] min-w-0 w-full xl:w-auto xl:sticky xl:top-4">


                    {/* ── CARD 2: INTELLIGENT NOTEPAD ── */}
                    <div className="bg-white border border-[#E8EAED] rounded-xl shadow-sm flex flex-col">
                        <div className="p-3 sm:p-4 border-b border-[#F0F0F0] flex-shrink-0 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <PenLine size={16} className="text-[#FF9900]" />
                                <h2 className="text-[13px] sm:text-[14px] font-semibold text-[#0F1111]">Problem Notepad</h2>
                            </div>
                            <span className="text-[11px] sm:text-[12px] text-[#9CA3A3]">{state.notePadItems.length} saved</span>
                        </div>
                        <div className="flex-1 xl:overflow-y-auto xl:max-h-[36vh] p-3 sm:p-4">
                            {state.notePadItems.length === 0 ? (
                                <div className="py-6 sm:py-8 text-center">
                                    <FileText size={30} className="text-[#E8EAED] mx-auto mb-3" />
                                    <p className="text-[12px] sm:text-[13px] text-[#9CA3A3] leading-relaxed max-w-[200px] mx-auto">Click 'Add to Notepad' on any problem to start building your problem statement.</p>
                                </div>
                            ) : (
                                state.notePadItems.map(item => (
                                    <div key={item.problemId} className="bg-[#F7F8FA] border border-[#E8EAED] rounded-xl p-3 sm:p-4 mb-3 last:mb-0">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-start gap-2">
                                                <div className="w-7 h-7 rounded-lg bg-[#FF9900] flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0">#{item.rank}</div>
                                                <span className="text-[12px] sm:text-[13px] font-semibold text-[#0F1111] leading-snug flex-1">{item.title}</span>
                                            </div>
                                            <button
                                                aria-label={`Remove ${item.title} from notepad`}
                                                className="p-1.5 text-[#9CA3A3] cursor-pointer hover:text-red-500 transition-colors mt-0.5 ml-2 flex-shrink-0 rounded min-w-[28px] min-h-[28px] flex items-center justify-center"
                                                onClick={() => removeFromNotepad(item.problemId)}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2 sm:gap-4 mb-3">
                                            <span className="text-[11px] sm:text-[12px] font-medium text-[#565959]">Confidence: {item.confidence}%</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {item.reasonCodes.map(code => (
                                                <span key={code} className="flex items-center gap-1 text-[10px] text-[#9CA3A3]">
                                                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: reasonCodeColors[code] || '#9CA3A3' }} />
                                                    {code}
                                                </span>
                                            ))}
                                        </div>
                                        <div>
                                            <label htmlFor={`reasoning-${item.problemId}`} className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3A3] mb-1 block">Your reasoning:</label>
                                            <textarea
                                                id={`reasoning-${item.problemId}`}
                                                className="w-full bg-white border border-[#C7CACA] rounded-lg p-2.5 text-[11px] sm:text-[12px] text-[#0F1111] resize-none h-[60px] focus:border-[#FF9900] focus:outline-none transition-colors"
                                                placeholder="Why this problem? Add your gut instinct and stakeholder context..."
                                                value={item.pmReasoning}
                                                onChange={(e) => updateNotepadItem(item.problemId, { pmReasoning: e.target.value })}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                        <div className="mt-2 flex items-center gap-1 flex-wrap">
                                            <span className="text-[10px] text-[#9CA3A3] mr-1">Evidence:</span>
                                            {item.citationIds.map(id => (
                                                <CitationBadge key={id} number={id} onClick={(e) => { e.stopPropagation(); setActiveCitations([id]) }} />
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        {state.notePadItems.length > 0 && (
                            <div className="p-3 sm:p-4 border-t border-[#F0F0F0] flex-shrink-0">
                                <div className="bg-[#FFF8EE] rounded-lg p-3 flex items-start gap-2 mb-3">
                                    <Clock size={14} className="text-[#FF9900] flex-shrink-0 mt-0.5" />
                                    <div>
                                        <div className="text-[11px] sm:text-[12px] font-semibold text-[#B7791F]">
                                            Signal helped define {state.notePadItems.length} problem statement{state.notePadItems.length > 1 ? 's' : ''} this session.
                                        </div>
                                        <div className="text-[10px] sm:text-[11px] text-[#9CA3A3] mt-0.5">Typical manual process: 6–8 hours.</div>
                                    </div>
                                </div>
                                <button onClick={() => setShareOpen(true)} className="w-full bg-[#232F3E] text-white rounded-lg py-2.5 text-[13px] font-semibold flex items-center justify-center gap-2 hover:bg-[#374151] transition-colors min-h-[44px]">
                                    <Send size={14} /> Share with Stakeholders
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Share Modal */}
            <ShareModal
                isOpen={shareOpen}
                onClose={() => setShareOpen(false)}
                notePadItems={state.notePadItems}
                citationLibrary={citationLibrary}
                rangeLabel={rangeLabel}
                addToast={addToast}
            />
        </div>
    )
}
