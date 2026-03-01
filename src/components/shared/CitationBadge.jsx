export default function CitationBadge({ number, onClick }) {
    return (
        <button
            onClick={onClick}
            aria-label={`View citation ${number}`}
            className="inline-flex items-center justify-center min-w-[28px] min-h-[28px] w-7 h-7 rounded bg-[#0066C0]/10 text-[#0066C0] text-[10px] font-bold cursor-pointer relative -top-0.5 ml-0.5 hover:bg-[#0066C0]/20 transition-colors"
        >
            {number}
        </button>
    )
}
