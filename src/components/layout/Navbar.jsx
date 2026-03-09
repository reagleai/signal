import { useApp } from '../../context/AppContext'

export default function Navbar() {
    const { state } = useApp()
    const syncTime = state.lastSyncInfo?.lastGlobalSyncTime || 'Loading…'

    return (
        <header className="h-14 sm:h-16 bg-[#232F3E] px-4 sm:px-8 flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.25)] flex-shrink-0 z-50">
            {/* Left group */}
            <div className="flex items-center gap-2 sm:gap-3">
                {/* Hexagon logo */}
                <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Signal logo" role="img">
                    <path
                        d="M13 1L24.1244 7V19L13 25L1.87564 19V7L13 1Z"
                        stroke="#FF9900"
                        strokeWidth="2"
                        fill="none"
                    />
                </svg>

                {/* Logo text */}
                <span className="text-[20px] sm:text-[22px] font-bold text-white" style={{ letterSpacing: '-0.03em' }}>
                    Signal
                </span>

                {/* Sub-label */}
                <div className="hidden md:flex flex-col justify-center ml-1 border-l border-white/20 pl-3">
                    <span className="text-[11px] text-white/60">Returns Discovery</span>
                    <span className="text-[10px] text-white/50">Internal Tool</span>
                </div>
            </div>

            {/* Right group */}
            <div className="flex items-center gap-3 sm:gap-5">
                {/* Data freshness indicator — hidden on mobile */}
                <div className="hidden sm:flex items-center gap-2 bg-white/10 rounded-full px-3 py-2">
                    <span className="w-2 h-2 rounded-full bg-[#067D62] pulse-dot" />
                    <span className="text-[12px] text-white/80">
                        Data fresh · {syncTime}
                    </span>
                </div>

                {/* Mobile-only freshness dot */}
                <div className="sm:hidden flex items-center gap-1.5 bg-white/10 rounded-full px-2 py-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#067D62] pulse-dot" />
                    <span className="text-[11px] text-white/80">Fresh</span>
                </div>

                {/* Separator */}
                <div className="w-px h-5 bg-white/20 hidden sm:block" />

                {/* Welcome + Avatar */}
                <div className="flex items-center gap-2 sm:gap-3">
                    <span className="hidden md:inline text-[13px] text-white/70">Welcome, Sarah</span>
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#FF9900] border-2 border-[#FF9900]/50 flex items-center justify-center text-[13px] font-bold text-white">
                        S
                    </div>
                </div>
            </div>
        </header>
    )
}
