import { useState } from 'react'

export default function Tooltip({ children, content }) {
    const [visible, setVisible] = useState(false)

    return (
        <span
            className="relative inline-flex"
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
            onFocus={() => setVisible(true)}
            onBlur={() => setVisible(false)}
        >
            {children}
            {visible && (
                <span
                    role="tooltip"
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#232F3E] text-white text-[11px] rounded-lg whitespace-nowrap z-50 shadow-lg pointer-events-none"
                >
                    {content}
                    <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#232F3E]" />
                </span>
            )}
        </span>
    )
}
