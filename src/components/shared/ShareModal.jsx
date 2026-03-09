import { useState, useRef, useEffect } from 'react'
import { X, Send, Copy, Check } from 'lucide-react'
import { useDurableAction } from '../../context/AppContext'

export default function ShareModal({ isOpen, onClose, notePadItems = [], citationLibrary = [], rangeLabel = '', addToast }) {
    const [copied, setCopied] = useState(false)
    const shareAction = useDurableAction('share-brief')
    const sending = shareAction.status === 'running'
    const [recipients, setRecipients] = useState('')
    const [note, setNote] = useState('')
    const modalRef = useRef(null)

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(e) {
            if (modalRef.current && !modalRef.current.contains(e.target)) onClose()
        }
        if (isOpen) document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen, onClose])

    if (!isOpen) return null

    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

    const briefText = `SIGNAL — RETURNS PROBLEM BRIEF
Generated: ${today}
Period: ${rangeLabel}

${notePadItems.map(item => `PROBLEM ${item.rank}: ${item.title}
Confidence: ${item.confidence}% | Groundedness: ${item.groundedness || 'N/A'}% | Estimated Impact: ${item.estimatedImpact}

Return reason codes: ${item.reasonCodes.join(', ')}

PM Reasoning: ${item.pmReasoning || '[No reasoning added yet]'}

Supporting Evidence: Citations ${item.citationIds.join(', ')}

─────────────────────────────────`).join('\n\n')}`

    const handleCopy = () => {
        navigator.clipboard.writeText(briefText)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleSend = async () => {
        try {
            await shareAction.runAction(async () => {
                await new Promise(r => setTimeout(r, 900))
            })
            onClose()
            if (addToast) {
                addToast({ id: Date.now(), type: 'success', message: 'Brief sent to stakeholders!' })
            }
            setTimeout(() => shareAction.resetAction(), 500)
        } catch (e) { }
    }

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Share problem statements">
            <div ref={modalRef} className="bg-white rounded-2xl shadow-2xl w-full max-w-[560px] max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center px-4 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-[#E8EAED]">
                    <div className="flex items-center gap-2">
                        <Send size={18} className="text-[#FF9900]" />
                        <h2 className="text-[15px] sm:text-[16px] font-semibold text-[#0F1111]">Share Problem Statements</h2>
                    </div>
                    <button
                        aria-label="Close share dialog"
                        className="p-2 text-[#9CA3A3] cursor-pointer hover:text-[#0F1111] rounded min-w-[36px] min-h-[36px] flex items-center justify-center"
                        onClick={onClose}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-4 sm:px-6 py-5 flex flex-col gap-5">
                    {/* Brief preview */}
                    <div>
                        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3A3] mb-2">Formatted brief preview</h3>
                        <div className="bg-[#F7F8FA] border border-[#E8EAED] rounded-xl p-3 sm:p-4 text-[11px] sm:text-[12px] text-[#565959] leading-relaxed max-h-[200px] overflow-y-auto whitespace-pre-wrap font-mono">
                            {briefText}
                        </div>
                    </div>

                    {/* Recipients */}
                    <div>
                        <label htmlFor="share-recipients" className="text-[13px] font-medium text-[#0F1111] mb-1.5 block">Send to</label>
                        <input
                            id="share-recipients"
                            type="email"
                            value={recipients}
                            onChange={(e) => setRecipients(e.target.value)}
                            className="w-full border border-[#C7CACA] rounded-lg px-3 sm:px-4 py-2.5 text-[13px] focus:border-[#FF9900] focus:outline-none min-h-[44px]"
                            placeholder="Enter email addresses, separated by commas..."
                        />
                    </div>

                    {/* Add note */}
                    <div>
                        <label htmlFor="share-note" className="text-[13px] font-medium text-[#0F1111] mb-1.5 block">Add a note</label>
                        <textarea
                            id="share-note"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full border border-[#C7CACA] rounded-lg px-3 sm:px-4 py-2.5 text-[13px] resize-none h-20 focus:border-[#FF9900] focus:outline-none"
                            placeholder="Optional context for your stakeholders..."
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-4 sm:px-6 pb-5 sm:pb-6 flex flex-col sm:flex-row gap-3">
                    <button onClick={handleCopy} className="flex-1 bg-white border border-[#E8EAED] rounded-lg py-2.5 text-[13px] font-medium text-[#565959] hover:border-[#FF9900] flex items-center justify-center gap-2 transition-colors min-h-[44px]">
                        {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy as Markdown</>}
                    </button>
                    <button onClick={handleSend} disabled={sending} className="flex-1 bg-[#FF9900] text-white rounded-lg py-2.5 text-[13px] font-semibold hover:bg-[#E68A00] flex items-center justify-center gap-2 transition-colors disabled:opacity-60 min-h-[44px]">
                        {sending ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <><Send size={14} /> Send Brief</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
