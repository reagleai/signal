export default function StatusBar() {
    return (
        <footer className="h-8 sm:h-9 bg-[#232F3E] px-4 sm:px-8 flex items-center justify-between border-t border-white/[0.08] flex-shrink-0">
            {/* Left */}
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#067D62] pulse-dot" />
                <span className="text-[11px] sm:text-[12px] text-white/70">All systems operational</span>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3 sm:gap-4">
                <span className="text-[11px] sm:text-[12px] text-white/50">Signal v1.0 · Pilot</span>
            </div>
        </footer>
    )
}
