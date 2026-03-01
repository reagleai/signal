import { TrendingUp, TrendingDown } from 'lucide-react'

export default function MetricCard({ label, value, unit, delta, deltaLabel, direction, source, icon }) {
    const getDeltaStyle = () => {
        if (!direction) return {}
        const isGood = direction === 'up-good' || direction === 'down-good'
        return {
            bg: isGood ? 'bg-green-50' : 'bg-red-50',
            text: isGood ? 'text-green-700' : 'text-red-600',
            icon: direction.startsWith('up')
                ? <TrendingUp size={11} />
                : <TrendingDown size={11} />,
            prefix: direction.startsWith('up') ? '+' : '',
        }
    }

    const deltaStyle = getDeltaStyle()

    return (
        <div className="bg-white border border-[#E8EAED] rounded-xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
            {/* Top row */}
            <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3A3]">
                    {label}
                </span>
                {icon && <span className="text-[#9CA3A3]">{icon}</span>}
            </div>

            {/* Value */}
            <div className="flex items-baseline">
                <span className="text-[32px] font-bold text-[#0F1111] leading-none">{value}</span>
                {unit && (
                    <span className="text-[16px] font-bold text-[#9CA3A3] ml-1 self-end mb-1">{unit}</span>
                )}
            </div>

            {/* Delta */}
            {delta !== null && delta !== undefined && (
                <div className="flex items-center gap-2 mt-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-medium flex items-center gap-1 ${deltaStyle.bg} ${deltaStyle.text}`}>
                        {deltaStyle.icon}
                        {deltaStyle.prefix}{Math.abs(delta)}%
                    </span>
                    {deltaLabel && (
                        <span className="text-[11px] text-[#9CA3A3]">{deltaLabel}</span>
                    )}
                </div>
            )}

            {/* Source */}
            {source && (
                <div className="mt-3 pt-3 border-t border-[#F0F0F0]">
                    <span className="text-[10px] text-[#9CA3A3]">Source: {source}</span>
                </div>
            )}
        </div>
    )
}
