import { Database, BarChart2, Sparkles, Calendar, Download } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import DateRangePicker from '../shared/DateRangePicker'

const tabs = [
    { key: 'data-status', label: 'Data Status', icon: Database },
    { key: 'metrics', label: 'Metrics', icon: BarChart2 },
    { key: 'ai-insights', label: 'AI Insights', icon: Sparkles },
]

export default function SectionNav() {
    const { state, setActiveSection, setDateRange } = useApp()

    return (
        <div className="sticky top-0 z-40 bg-white border-b border-[#E8EAED] shadow-[0_1px_3px_rgba(0,0,0,0.06)] px-4 sm:px-8 flex-shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between min-h-[48px] sm:min-h-[52px]">
                {/* Left: Tabs */}
                <nav className="flex items-center h-[48px] sm:h-[52px] gap-0.5 sm:gap-1 overflow-x-auto" role="tablist" aria-label="Dashboard sections">
                    {tabs.map(tab => {
                        const Icon = tab.icon
                        const isActive = state.activeSection === tab.key
                        return (
                            <button
                                key={tab.key}
                                role="tab"
                                aria-selected={isActive}
                                aria-controls={`section-${tab.key}`}
                                onClick={() => setActiveSection(tab.key)}
                                className={`h-full px-3 sm:px-5 flex items-center gap-1.5 sm:gap-2 text-[13px] sm:text-[14px] cursor-pointer transition-all duration-150 relative border-b-[3px] pt-[3px] whitespace-nowrap ${isActive
                                    ? 'text-[#0F1111] font-semibold border-b-[#FF9900]'
                                    : 'text-[#565959] font-medium border-b-transparent hover:text-[#0F1111] hover:bg-[#F7F8FA]'
                                    }`}
                            >
                                <Icon size={15} />
                                <span className="hidden xs:inline sm:inline">{tab.label}</span>
                                <span className="xs:hidden sm:hidden">{tab.label.split(' ')[0]}</span>
                                {tab.key === 'ai-insights' && (
                                    <span className="bg-[#FF9900] text-white rounded-full px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold ml-1">
                                        5
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </nav>

                {/* Right — wraps to second row on narrow screens */}
                <div className="flex items-center gap-2 sm:gap-4 pb-2 sm:pb-0">
                    {state.activeSection === 'data-status' ? (
                        <div className="flex items-center text-[11px] sm:text-[12px] text-[#9CA3A3]">
                            <Calendar size={13} className="mr-1" />
                            <span className="hidden sm:inline">Last sync: </span>{state.lastSyncInfo?.lastGlobalSyncTime || 'Loading…'}
                        </div>
                    ) : (
                        <DateRangePicker
                            value={state.dateRange}
                            onChange={setDateRange}
                        />
                    )}

                    {/* Separator */}
                    <div className="w-px h-4 bg-[#E8EAED] hidden sm:block" />

                    {/* Export button */}
                    <button
                        className="flex items-center gap-1.5 border border-[#E8EAED] rounded-lg px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-[12px] text-[#565959] bg-white hover:border-[#FF9900] hover:text-[#0F1111] transition-colors min-h-[36px] min-w-[36px] justify-center"
                        aria-label="Export data"
                    >
                        <Download size={13} />
                        <span className="hidden sm:inline">Export</span>
                    </button>

                    {/* Last generated — hidden on mobile */}
                    <span className="text-[11px] sm:text-[12px] text-[#9CA3A3] hidden lg:inline">
                        Last generated:
                        <span className="text-[#565959] font-medium ml-1">{state.lastSyncInfo?.lastGlobalSyncTime || 'N/A'}</span>
                    </span>
                </div>
            </div>
        </div>
    )
}
