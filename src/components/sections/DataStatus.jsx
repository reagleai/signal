import { RefreshCw, CheckCircle, Brain, Zap } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { integrations } from '../../data/mockData'
import MetricCard from '../shared/MetricCard'
import Badge from '../shared/Badge'

export default function DataStatus() {
    const { setActiveSection, addToast } = useApp()

    const handleResync = () => {
        addToast({ id: Date.now(), type: 'info', message: 'Re-syncing all sources…' })
    }

    return (
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8" id="section-data-status" role="tabpanel" aria-label="Data Status">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8">
                <div>
                    <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-[#FF9900] mb-2">
                        SIGNAL — SECTION 1
                    </div>
                    <h1 className="text-[22px] sm:text-[28px] font-bold text-[#0F1111]">
                        Data Integration Status
                    </h1>
                    <p className="text-[13px] sm:text-[14px] text-[#565959] mt-2 max-w-[520px] leading-relaxed">
                        All data sources that feed Signal's overnight AI synthesis. The quality and
                        freshness of these sources directly determines the quality of AI insights.
                    </p>
                </div>
                <button
                    onClick={handleResync}
                    className="flex items-center gap-2 px-4 py-2.5 border border-[#E8EAED] rounded-lg bg-white text-[13px] text-[#565959] font-medium hover:border-[#FF9900] hover:text-[#0F1111] transition-colors self-start min-h-[44px]"
                >
                    <RefreshCw size={14} />
                    Re-sync all sources
                </button>
            </div>

            {/* Summary Cards — responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8">
                <MetricCard
                    label="Active Sources"
                    value="5"
                    source="All systems"
                    icon={<CheckCircle size={18} className="text-[#067D62]" />}
                />
                <MetricCard
                    label="RAGs Indexed"
                    value="14"
                    source="Knowledge bases"
                    icon={<Brain size={18} className="text-[#FF9900]" />}
                />
                <MetricCard
                    label="Records Processed"
                    value="2.1M"
                    delta={12.4}
                    deltaLabel="vs last week"
                    direction="up-good"
                    source="DW + Zendesk + Reviews"
                />
                <MetricCard
                    label="Batch Duration"
                    value="4m 12s"
                    source="Completed 06:33 AM"
                />
            </div>

            {/* Data Sources Table — scrollable on mobile */}
            <div className="bg-white rounded-xl border border-[#E8EAED] shadow-[0_1px_4px_rgba(0,0,0,0.08)] overflow-hidden mb-6 sm:mb-8">
                {/* Mobile: card layout */}
                <div className="block lg:hidden">
                    <div className="bg-[#F7F8FA] border-b border-[#E8EAED] px-4 py-3">
                        <h2 className="text-[12px] font-semibold uppercase tracking-wide text-[#9CA3A3]">Data Sources</h2>
                    </div>
                    {integrations.map((item, idx) => (
                        <div
                            key={item.id}
                            className={`px-4 py-4 ${idx < integrations.length - 1 ? 'border-b border-[#E8EAED]' : ''}`}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[13px] text-white flex-shrink-0"
                                    style={{ background: item.iconBg }}
                                >
                                    {item.iconInitial}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[14px] font-semibold text-[#0F1111]">{item.name}</div>
                                    <div className="text-[11px] text-[#9CA3A3]">{item.category}</div>
                                </div>
                                <Badge variant="green" icon={<CheckCircle size={11} />} label="Synced" />
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-[12px]">
                                <div>
                                    <span className="text-[#9CA3A3] block text-[10px] uppercase tracking-wide mb-0.5">Last Sync</span>
                                    <span className="text-[#0F1111] font-medium">{item.lastSyncTime}</span>
                                    <span className="text-[#9CA3A3] ml-1">{item.lastSyncDate}</span>
                                </div>
                                <div>
                                    <span className="text-[#9CA3A3] block text-[10px] uppercase tracking-wide mb-0.5">Records</span>
                                    <span className="text-[#FF9900] font-bold">{item.recordsPulled}</span>
                                    <span className="text-[#9CA3A3] ml-1">{item.recordsUnit}</span>
                                </div>
                                <div>
                                    <span className="text-[#9CA3A3] block text-[10px] uppercase tracking-wide mb-0.5">Coverage</span>
                                    <span className="text-[#565959]">{item.coveragePeriod}</span>
                                </div>
                                <div>
                                    <span className="text-[#9CA3A3] block text-[10px] uppercase tracking-wide mb-0.5">RAG Status</span>
                                    <span className="inline-flex items-center gap-1 text-[#B7791F] font-medium">
                                        <CheckCircle size={11} />
                                        {item.ragCount} RAG{item.ragCount > 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop: table layout */}
                <div className="hidden lg:block">
                    {/* Table Header */}
                    <div className="bg-[#F7F8FA] border-b border-[#E8EAED] px-6 py-3">
                        <div className="grid grid-cols-[2.5fr_1fr_1.2fr_1.5fr_1.5fr_1.2fr] gap-4 items-center">
                            {['SOURCE', 'STATUS', 'LAST SYNC', 'COVERAGE', 'RECORDS PULLED', 'RAG STATUS'].map(col => (
                                <span key={col} className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3A3]">{col}</span>
                            ))}
                        </div>
                    </div>

                    {/* Table Rows */}
                    {integrations.map((item, idx) => (
                        <div
                            key={item.id}
                            className={`grid grid-cols-[2.5fr_1fr_1.2fr_1.5fr_1.5fr_1.2fr] gap-4 items-center px-6 py-5 hover:bg-[#F7F8FA] transition-colors cursor-default ${idx < integrations.length - 1 ? 'border-b border-[#E8EAED]' : ''
                                }`}
                        >
                            {/* Source */}
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[13px] text-white flex-shrink-0"
                                    style={{ background: item.iconBg }}
                                >
                                    {item.iconInitial}
                                </div>
                                <div>
                                    <div className="text-[14px] font-semibold text-[#0F1111]">{item.name}</div>
                                    <div className="text-[11px] text-[#9CA3A3]">{item.category}</div>
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <Badge variant="green" icon={<CheckCircle size={11} />} label="Synced" />
                            </div>

                            {/* Last Sync */}
                            <div>
                                <div className="text-[14px] font-medium text-[#0F1111]">{item.lastSyncTime}</div>
                                <div className="text-[11px] text-[#9CA3A3]">{item.lastSyncDate}</div>
                            </div>

                            {/* Coverage */}
                            <div className="text-[13px] text-[#565959]">{item.coveragePeriod}</div>

                            {/* Records Pulled */}
                            <div>
                                <span className="text-[14px] font-bold text-[#FF9900]">{item.recordsPulled}</span>
                                <span className="text-[11px] text-[#9CA3A3] ml-1">{item.recordsUnit}</span>
                            </div>

                            {/* RAG Status */}
                            <div>
                                <span className="inline-flex items-center gap-1 bg-[#FFF8EE] border border-[#FF9900]/20 text-[#B7791F] text-[12px] font-medium rounded-full px-3 py-1">
                                    <CheckCircle size={11} />
                                    {item.ragCount} RAG{item.ragCount > 1 ? 's' : ''} indexed
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* PLG Insight Banner */}
            <div className="bg-[#FFF8EE] border border-[#FF9900]/20 rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                <Zap size={22} className="text-[#FF9900] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <div className="text-[14px] sm:text-[15px] font-semibold text-[#0F1111] mb-1">
                        Signal processed 2.1M return events overnight — so you don't have to.
                    </div>
                    <div className="text-[12px] sm:text-[13px] text-[#565959] leading-relaxed">
                        All 14 knowledge bases are indexed and ready. Your usual process — pulling from the
                        DW, cross-referencing Tableau, downloading tickets — is already done.
                    </div>
                    <div className="text-[11px] sm:text-[12px] font-semibold text-[#B7791F] mt-2">
                        This replaces approximately 2–3 hours of manual data extraction every week.
                    </div>
                </div>
                <button
                    onClick={() => setActiveSection('ai-insights')}
                    className="bg-[#FF9900] text-white rounded-lg px-5 py-2.5 text-[13px] font-semibold hover:bg-[#E68A00] flex-shrink-0 transition-colors min-h-[44px] w-full sm:w-auto text-center"
                >
                    → View AI Insights
                </button>
            </div>
        </div>
    )
}
