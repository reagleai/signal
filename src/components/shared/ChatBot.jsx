import { useState, useRef, useEffect } from 'react'
import { Sparkles, ArrowRight, AlertCircle } from 'lucide-react'
import Spinner from './Spinner'
import CitationBadge from './CitationBadge'
import { sendChatMessage } from '../../api/aiInsightsAdapter'

const mockResponses = {
    metrics: {
        text: "Based on this week's data, the return rate increased to 8.4% [1], up from 7.1% last week. The spike was most pronounced on Wednesday and Thursday [2], correlating with the iOS app update rolled out Tuesday evening.",
        citations: [1, 2]
    },
    insights: {
        text: "Problem #1 is ranked highest because it has the strongest cross-source signal — appearing in Zendesk tickets [1], App Store reviews [3], and Data Warehouse crash data [2]. Its groundedness score of 94% means the LLM Judge validated the recommendation against quantitative frequency data.",
        citations: [1, 2, 3]
    }
}

function renderMessageWithCitations(text) {
    const parts = text.split(/(\[\d+\])/)
    return parts.map((part, i) => {
        const match = part.match(/^\[(\d+)\]$/)
        if (match) {
            return null // Hidden for V1: <CitationBadge key={i} number={parseInt(match[1])} />
        }
        return <span key={i}>{part}</span>
    })
}

export default function ChatBot({ scope = 'metrics', placeholder, suggestedQueries = [], title, subtitle }) {
    const [input, setInput] = useState('')
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(false)
    const [expanded, setExpanded] = useState(false)

    // Stable session ID for this conversation thread
    const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)

    // Auto-scroll to bottom of chat
    const scrollContainerRef = useRef(null)
    const scrollToBottom = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
        }
    }
    useEffect(() => {
        scrollToBottom()
    }, [messages, loading])

    const handleSubmit = async (queryOverride) => {
        const query = queryOverride || input
        if (!query.trim() || loading) return

        const userMsg = { role: 'user', text: query, time: new Date() }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setLoading(true)
        setExpanded(true)

        try {
            const data = await sendChatMessage({
                payload: {
                    session_id: sessionId,
                    message: query,
                    top_k: 8
                }
            })

            const aiMsg = {
                role: 'ai',
                text: data.reply || "I couldn't generate a response based on the current context.",
                time: new Date()
            }
            setMessages(prev => [...prev, aiMsg])
        } catch (err) {
            const errorMsg = {
                role: 'error',
                text: "Failed to connect to the Master PM Node. Please try again later.",
                time: new Date()
            }
            setMessages(prev => [...prev, errorMsg])
        } finally {
            setLoading(false)
        }
    }

    const formatTime = (d) => {
        return new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    }

    return (
        <div className="bg-white border border-[#E8EAED] rounded-xl p-4 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
                <Sparkles size={18} className="text-[#FF9900] mt-0.5 flex-shrink-0" />
                <div>
                    <h3 className="text-[14px] font-semibold text-[#0F1111]">{title}</h3>
                    <p className="text-[12px] text-[#9CA3A3]">{subtitle}</p>
                </div>
            </div>

            {/* Suggested queries (only when collapsed) */}
            {!expanded && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {suggestedQueries.slice(0, 4).map((q, i) => (
                        <button
                            key={i}
                            onClick={() => { setInput(q); handleSubmit(q) }}
                            className="bg-[#F7F8FA] border border-[#E8EAED] rounded-full px-3 py-1.5 text-[11px] sm:text-[12px] text-[#565959] cursor-pointer hover:border-[#FF9900] hover:text-[#0F1111] hover:bg-[#FFF8EE] transition-all text-left"
                        >
                            {q}
                        </button>
                    ))}
                </div>
            )}

            {/* Messages thread */}
            {expanded && (
                <div 
                    ref={scrollContainerRef} 
                    className={`flex-1 overflow-y-auto flex flex-col gap-4 mb-4 pr-2 ${
                        scope === 'insights' 
                            ? 'min-h-[350px] max-h-[550px] sm:min-h-[400px] sm:max-h-[600px]' 
                            : 'h-[250px] sm:h-[300px]'
                    }`}
                    role="log" aria-label="Chat messages" aria-live="polite"
                >
                    {messages.map((msg, i) => {
                        if (msg.role === 'user') {
                            return (
                                <div key={i} className="flex justify-end">
                                    <div className="bg-[#232F3E] text-white rounded-xl rounded-tr-sm px-4 py-2.5 text-[13px] max-w-[90%] sm:max-w-[80%]">
                                        {msg.text}
                                    </div>
                                </div>
                            );
                        } else if (msg.role === 'ai') {
                            return (
                                <div key={i} className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <Sparkles size={13} className="text-[#FF9900]" />
                                        <span className="text-[11px] font-semibold text-[#FF9900]">Signal AI</span>
                                        <span className="text-[10px] text-[#9CA3A3]">{formatTime(msg.time)}</span>
                                    </div>
                                    <div className="bg-[#F7F8FA] border border-[#E8EAED] rounded-xl rounded-tl-sm px-4 py-3 text-[13px] text-[#0F1111] leading-relaxed max-w-[95%] sm:max-w-[90%]">
                                        {renderMessageWithCitations(msg.text)}
                                    </div>
                                    {/* Citations hidden for V1 
                                    {msg.citations && (
                                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                                            <span className="text-[11px] text-[#9CA3A3] mr-2">Sources:</span>
                                            {msg.citations.map(c => (
                                                <CitationBadge key={c} number={c} />
                                            ))}
                                        </div>
                                    )}
                                    */}
                                </div>
                            );
                        } else if (msg.role === 'error') {
                            return (
                                <div key={i} className="flex justify-start">
                                    <div className="bg-[#FFF4F4] border border-[#F8CCCC] text-[#C0392B] rounded-xl rounded-tl-sm px-4 py-3 text-[13px] flex items-center gap-2 max-w-[95%] sm:max-w-[90%]">
                                        <AlertCircle size={14} className="flex-shrink-0" />
                                        <span>{msg.text}</span>
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    })}
                    {loading && (
                        <div className="flex items-center gap-2">
                            <Sparkles size={13} className="text-[#FF9900]" />
                            <Spinner size={14} className="text-[#FF9900]" />
                            <span className="text-[12px] text-[#9CA3A3]">Thinking…</span>
                        </div>
                    )}
                </div>
            )}

            {/* Input row */}
            <div className="flex items-center gap-2">
                <label htmlFor={`chatbot-input-${scope}`} className="sr-only">Ask a question</label>
                <input
                    id={`chatbot-input-${scope}`}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    placeholder={placeholder}
                    className="flex-1 border border-[#C7CACA] rounded-lg px-3 sm:px-4 py-2.5 text-[13px] sm:text-[14px] text-[#0F1111] focus:border-[#FF9900] focus:outline-none min-h-[44px]"
                />
                <button
                    onClick={() => handleSubmit()}
                    disabled={loading || !input.trim()}
                    aria-label="Send message"
                    className="bg-[#FF9900] text-white rounded-lg px-3 sm:px-4 py-2.5 text-[13px] font-semibold hover:bg-[#E68A00] flex items-center gap-1.5 disabled:opacity-50 transition-colors min-h-[44px] min-w-[44px] justify-center"
                >
                    {loading ? <Spinner size={14} className="text-white" /> : (
                        <>
                            <span className="hidden sm:inline">Ask</span>
                            <ArrowRight size={14} />
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
