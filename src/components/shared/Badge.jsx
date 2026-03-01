export default function Badge({ label, variant = 'green', icon }) {
    const variants = {
        green: 'bg-[#067D62]/10 text-[#067D62] border border-[#067D62]/20',
        amber: 'bg-[#B7791F]/10 text-[#B7791F] border border-[#B7791F]/20',
        red: 'bg-[#C0392B]/10 text-[#C0392B] border border-[#C0392B]/20',
        orange: 'bg-[#FFF8EE] text-[#B7791F] border border-[#FF9900]/30',
        blue: 'bg-[#0066C0]/10 text-[#0066C0] border border-[#0066C0]/20',
        purple: 'bg-[#6B46C1]/10 text-[#6B46C1] border border-[#6B46C1]/20',
    }

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${variants[variant] || variants.green}`}>
            {icon}
            {label}
        </span>
    )
}
