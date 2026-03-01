export default function Chip({ label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`px-3 py-1.5 rounded-full text-[12px] font-medium cursor-pointer transition-all border
        ${active
                    ? 'bg-[#FFF8EE] border-[#FF9900]/30 text-[#0F1111]'
                    : 'bg-[#F7F8FA] border-[#E8EAED] text-[#565959] hover:border-[#FF9900] hover:text-[#0F1111] hover:bg-[#FFF8EE]'
                }`}
        >
            {label}
        </button>
    )
}
