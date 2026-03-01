import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X } from 'lucide-react'

const emojis = ['😍', '😊', '😐', '😕', '😤']

export default function FeedbackButton() {
    const [open, setOpen] = useState(false)
    const [selectedEmoji, setSelectedEmoji] = useState(null)
    const [feedback, setFeedback] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const panelRef = useRef(null)

    // Close on Escape key
    useEffect(() => {
        if (!open) return
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setOpen(false)
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [open])

    // Close on click outside
    useEffect(() => {
        if (!open) return
        const handleClickOutside = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [open])

    const handleSubmit = () => {
        if (submitted) return
        setSubmitted(true)
        setTimeout(() => {
            setOpen(false)
            setSubmitted(false)
            setSelectedEmoji(null)
            setFeedback('')
        }, 1500)
    }

    return (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50" ref={panelRef}>
            {/* Expanded panel */}
            {open && (
                <div
                    className="feedback-panel-enter absolute bottom-[52px] right-0 bg-white border border-[#E8EAED] rounded-xl shadow-xl p-5 w-[calc(100vw-32px)] sm:w-[280px] max-w-[280px]"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Share feedback"
                >
                    {/* Close */}
                    <button
                        aria-label="Close feedback panel"
                        className="absolute top-3 right-3 p-1 text-[#9CA3A3] cursor-pointer hover:text-[#0F1111] transition-colors rounded"
                        onClick={() => setOpen(false)}
                    >
                        <X size={14} />
                    </button>

                    {/* Header */}
                    <div className="text-[14px] font-semibold text-[#0F1111] mb-1">Share Feedback</div>
                    <div className="text-[12px] text-[#9CA3A3] mb-4">Help us improve Signal</div>

                    {/* Emoji reactions */}
                    <div className="flex gap-2 sm:gap-3 mb-4" role="radiogroup" aria-label="How do you feel about Signal?">
                        {emojis.map((emoji, i) => (
                            <button
                                key={i}
                                role="radio"
                                aria-checked={selectedEmoji === i}
                                aria-label={['Love it', 'Like it', 'Neutral', 'Needs work', 'Frustrated'][i]}
                                onClick={() => setSelectedEmoji(i)}
                                className={`w-10 h-10 rounded-lg bg-[#F7F8FA] border flex items-center justify-center text-[20px] cursor-pointer transition-all ${selectedEmoji === i
                                    ? 'border-[#FF9900] ring-2 ring-[#FF9900] bg-[#FFF8EE]'
                                    : 'border-[#E8EAED] hover:border-[#FF9900] hover:bg-[#FFF8EE]'
                                    }`}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>

                    {/* Textarea */}
                    <label htmlFor="feedback-text" className="sr-only">Your feedback</label>
                    <textarea
                        id="feedback-text"
                        value={feedback}
                        onChange={e => setFeedback(e.target.value)}
                        placeholder="Tell us what's working or what needs improvement..."
                        className="w-full border border-[#C7CACA] rounded-lg p-3 text-[13px] text-[#0F1111] resize-none h-20 focus:border-[#FF9900] focus:outline-none mb-3"
                    />

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        className="w-full bg-[#FF9900] text-white rounded-lg py-2.5 text-[13px] font-semibold hover:bg-[#E68A00] transition-colors min-h-[44px]"
                    >
                        {submitted ? '✓ Thanks!' : 'Send Feedback'}
                    </button>
                </div>
            )}

            {/* Collapsed pill */}
            <button
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                aria-haspopup="dialog"
                className="flex items-center gap-2 bg-[#232F3E] text-white rounded-full px-4 py-2.5 shadow-lg cursor-pointer text-[12px] font-medium hover:bg-[#37475A] transition-all duration-200 min-h-[44px]"
            >
                <MessageSquare size={14} className="text-[#FF9900]" />
                Feedback
            </button>
        </div>
    )
}
