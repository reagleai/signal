import { useState, useRef, useEffect } from 'react'
import { Calendar } from 'lucide-react'

export default function DateRangePicker({ value, onChange }) {
    const [showCustom, setShowCustom] = useState(false)
    const [startInput, setStartInput] = useState('')
    const [endInput, setEndInput] = useState('')
    const panelRef = useRef(null)

    useEffect(() => {
        if (!showCustom) return
        function handleClickOutside(e) {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setShowCustom(false)
            }
        }
        function handleKeyDown(e) {
            if (e.key === 'Escape') setShowCustom(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [showCustom])

    const presets = [
        { key: '7d', label: '7D' },
        { key: '30d', label: '30D' },
        { key: '90d', label: '90D' },
    ]

    const formatDate = (date) => {
        if (!date) return ''
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    const handleApply = () => {
        if (startInput && endInput) {
            onChange({
                preset: 'custom',
                startDate: new Date(startInput),
                endDate: new Date(endInput)
            })
            setShowCustom(false)
        }
    }

    return (
        <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Preset buttons */}
            <div className="bg-[#F7F8FA] border border-[#E8EAED] rounded-lg p-0.5 flex" role="group" aria-label="Date range presets">
                {presets.map(p => (
                    <button
                        key={p.key}
                        onClick={() => onChange({ preset: p.key, startDate: null, endDate: null })}
                        aria-pressed={value.preset === p.key}
                        className={`px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-[12px] font-medium rounded-md cursor-pointer transition-all min-h-[32px] ${value.preset === p.key
                            ? 'bg-[#FF9900] text-white font-semibold shadow-sm'
                            : 'text-[#565959] hover:text-[#0F1111]'
                            }`}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            {/* Custom date button */}
            <div className="relative" ref={panelRef}>
                <button
                    type="button"
                    aria-disabled="true"
                    title="Custom range disabled"
                    onClick={(e) => e.preventDefault()}
                    className="group flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 border rounded-lg bg-[#F7F8FA] text-[11px] sm:text-[12px] border-[#E8EAED] text-[#9CA3A3] cursor-not-allowed transition-colors min-h-[32px]"
                >
                    <span className="hidden group-hover:flex items-center justify-center w-[13px] h-[13px] text-[10px]">🚫</span>
                    <Calendar size={13} className="group-hover:hidden" />
                    <span className="hidden sm:inline">Custom range</span>
                    <span className="sm:hidden">Custom</span>
                </button>

                {showCustom && (
                    <div
                        className="fixed sm:absolute inset-x-4 sm:inset-x-auto top-auto sm:top-full bottom-4 sm:bottom-auto sm:mt-2 sm:right-0 bg-white border border-[#E8EAED] rounded-xl shadow-lg p-4 z-50 sm:w-[280px]"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Select custom date range"
                    >
                        <div className="flex flex-col gap-3">
                            <div>
                                <label htmlFor="date-start" className="text-[11px] font-medium text-[#9CA3A3] uppercase tracking-wide mb-1 block">Start</label>
                                <input
                                    id="date-start"
                                    type="date"
                                    value={startInput}
                                    onChange={e => setStartInput(e.target.value)}
                                    className="w-full border border-[#C7CACA] rounded-lg px-3 py-2 text-[13px] text-[#0F1111] focus:border-[#FF9900] focus:outline-none min-h-[44px]"
                                />
                            </div>
                            <div>
                                <label htmlFor="date-end" className="text-[11px] font-medium text-[#9CA3A3] uppercase tracking-wide mb-1 block">End</label>
                                <input
                                    id="date-end"
                                    type="date"
                                    value={endInput}
                                    onChange={e => setEndInput(e.target.value)}
                                    className="w-full border border-[#C7CACA] rounded-lg px-3 py-2 text-[13px] text-[#0F1111] focus:border-[#FF9900] focus:outline-none min-h-[44px]"
                                />
                            </div>
                            <button
                                onClick={handleApply}
                                className="bg-[#FF9900] text-white rounded-lg px-4 py-2 text-[13px] font-semibold hover:bg-[#E68A00] transition-colors min-h-[44px]"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
