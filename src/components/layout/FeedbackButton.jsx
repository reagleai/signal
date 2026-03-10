import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, AlertCircle } from 'lucide-react'

const categories = [
    'Feedback', 'Bug report', 'Critique', 'Suggestion',
    'UX issue', 'Feature request', 'Incorrect insight',
    'Performance issue', 'Confusing output', 'Rant'
]

export default function FeedbackButton() {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')
    const [description, setDescription] = useState('')

    const [status, setStatus] = useState('idle') // 'idle' | 'submitting' | 'success' | 'error'
    const [errorMsg, setErrorMsg] = useState('')

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

    const handleSubmit = async () => {
        if (status === 'submitting') return
        setErrorMsg('')

        // Validation
        if (!name.trim() || name.trim().length < 2) {
            setErrorMsg('Please enter a valid name.')
            return
        }
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setErrorMsg('Please enter a valid email address.')
            return
        }
        if (!selectedCategory) {
            setErrorMsg('Please select a category.')
            return
        }

        // Description is explicitly optional in V1

        setStatus('submitting')

        try {
            // Optional: send the current page path to help contextualize the feedback
            const page = window.location.pathname;

            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-internal-api-key': import.meta.env.VITE_INTERNAL_API_KEY
                },
                body: JSON.stringify({ name, email, category: selectedCategory, description, page })
            })

            if (!res.ok) {
                throw new Error('Server returned an error')
            }

            setStatus('success')
            setTimeout(() => {
                setOpen(false)
                setStatus('idle')
                setName('')
                setEmail('')
                setSelectedCategory('')
                setDescription('')
            }, 2500)
        } catch (err) {
            setStatus('error')
            setErrorMsg('Failed to send feedback. Please try again.')
        }
    }

    return (
        <div className="fixed bottom-12 right-4 sm:bottom-14 sm:right-6 z-50" ref={panelRef}>
            {/* Expanded panel */}
            {open && (
                <div
                    className="feedback-panel-enter absolute bottom-[52px] right-0 bg-white border border-[#E8EAED] rounded-xl shadow-xl p-5 w-[calc(100vw-32px)] sm:w-[320px] max-w-[320px]"
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
                    <div className="text-[12px] text-[#9CA3A3] mb-4">Help us improve the AI analytics experience</div>

                    {status === 'success' ? (
                        <div className="flex flex-col items-center justify-center py-8">
                            <div className="w-12 h-12 bg-[#067D62]/10 text-[#067D62] rounded-full flex items-center justify-center mb-3">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                            <h4 className="text-[14px] font-bold text-[#0F1111] mb-1">Feedback Sent!</h4>
                            <p className="text-[12px] text-[#565959] text-center">Thanks for sharing your thoughts with us.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {errorMsg && (
                                <div className="bg-[#FFF4F4] text-[#C0392B] text-[12px] p-2.5 rounded-lg border border-[#F8CCCC] flex items-start gap-2">
                                    <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                                    <span>{errorMsg}</span>
                                </div>
                            )}

                            <div>
                                <label className="block text-[12px] font-medium text-[#0F1111] mb-1">Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Jane Doe"
                                    className="w-full border border-[#C7CACA] rounded-lg px-3 py-2 text-[13px] text-[#0F1111] focus:border-[#FF9900] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-[12px] font-medium text-[#0F1111] mb-1">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="jane@example.com"
                                    className="w-full border border-[#C7CACA] rounded-lg px-3 py-2 text-[13px] text-[#0F1111] focus:border-[#FF9900] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-[12px] font-medium text-[#0F1111] mb-1">Category</label>
                                <select
                                    value={selectedCategory}
                                    onChange={e => setSelectedCategory(e.target.value)}
                                    className="w-full border border-[#C7CACA] rounded-lg px-3 py-2 text-[13px] text-[#0F1111] focus:border-[#FF9900] focus:outline-none bg-white appearance-none cursor-pointer"
                                >
                                    <option value="" disabled>Select a topic...</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Textarea */}
                            <div>
                                <label htmlFor="feedback-text" className="block text-[12px] font-medium text-[#0F1111] mb-1">Description</label>
                                <textarea
                                    id="feedback-text"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Tell us what's working or what needs improvement..."
                                    className="w-full border border-[#C7CACA] rounded-lg p-3 text-[13px] text-[#0F1111] resize-none h-24 focus:border-[#FF9900] focus:outline-none"
                                />
                            </div>

                            {/* Submit */}
                            <button
                                onClick={handleSubmit}
                                disabled={status === 'submitting'}
                                className={`w-full text-white rounded-lg py-2.5 text-[13px] font-semibold transition-colors min-h-[44px] flex items-center justify-center gap-2 ${status === 'submitting' ? 'bg-[#FF9900]/70 cursor-not-allowed' : 'bg-[#FF9900] hover:bg-[#E68A00]'}`}
                            >
                                {status === 'submitting' && <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
                                {status === 'submitting' ? 'Sending...' : 'Send Feedback'}
                            </button>
                        </div>
                    )}
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
