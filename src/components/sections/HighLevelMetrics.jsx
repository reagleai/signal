import { useState, useEffect } from 'react'
import { Calendar, TrendingUp, ChevronRight, AlertTriangle } from 'lucide-react'
import {
    ResponsiveContainer, ComposedChart, LineChart, BarChart, PieChart,
    Line, Area, Bar, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, LabelList
} from 'recharts'
import { useApp } from '../../context/AppContext'
import {
    metricsData as mockMetricsData, returnReasonCodes as mockReturnReasonCodes,
    weeklyTrend as mockWeeklyTrend, refundCategories as mockRefundCategories,
    returnRateTrend as mockReturnRateTrend, growingSubReasons as mockGrowingSubReasons
} from '../../data/mockData'
import { endpoints } from '../../config/endpoints'
import MetricCard from '../shared/MetricCard'
import ChatBot from '../shared/ChatBot'

// Helper: generate opacity tints from a base color
function hexToRgba(hex, opacity) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r},${g},${b},${opacity})`
}

// Custom label for sub-reason bar chart
function SubReasonLabel(props) {
    const { x, y, width, value, index, subReasons } = props
    return (
        <g>
            <text x={x + width + 8} y={y + 8} fontSize={11} fontWeight={700} fill="#0F1111">
                {value}%
            </text>
            <text x={x + width + 8} y={y + 20} fontSize={10} fill="#9CA3A3">
                {subReasons[index].count.toLocaleString()}
            </text>
        </g>
    )
}

// Custom chart tooltip style
const tooltipStyle = {
    background: '#fff',
    border: '1px solid #E8EAED',
    borderRadius: '10px',
    fontSize: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
}

export default function HighLevelMetrics() {
    const { state } = useApp()
    const [activeReasonCode, setActiveReasonCode] = useState(null)
    const [loading, setLoading] = useState(true)
    const [metrics, setMetrics] = useState(null)
    const [chartData, setChartData] = useState(null)

    const rangeKey = state.dateRange.preset === 'custom' ? '7d' : state.dateRange.preset

    // Fetch KPI metrics + chart data from n8n, fallback to mock
    useEffect(() => {
        let cancelled = false
        async function load() {
            setLoading(true)
            try {
                const headers = { 'x-internal-api-key': import.meta.env.VITE_INTERNAL_API_KEY };
                const [kpiRes, chartRes] = await Promise.all([
                    fetch(`${endpoints.metrics}?range=${rangeKey}`, { headers }),
                    fetch(`${endpoints.metricsCharts}?range=${rangeKey}`, { headers })
                ])
                const kpi = kpiRes.ok ? await kpiRes.json() : null
                const charts = chartRes.ok ? await chartRes.json() : null
                if (!cancelled) {
                    setMetrics(kpi && kpi.returnRate ? kpi : mockMetricsData[rangeKey])
                    setChartData(charts && charts.returnReasonCodes ? charts : null)
                }
            } catch {
                if (!cancelled) {
                    setMetrics(mockMetricsData[rangeKey])
                    setChartData(null)
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => { cancelled = true }
    }, [rangeKey])

    // Cross-section navigation: open drill-down from AI Insights
    useEffect(() => {
        const pendingCode = localStorage.getItem('signal_openReasonCode')
        if (pendingCode) {
            setActiveReasonCode(pendingCode)
            localStorage.removeItem('signal_openReasonCode')
            document.getElementById('reason-code-explorer')?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [])

    const metricsObj = metrics || mockMetricsData[rangeKey]
    const returnReasonCodes = chartData?.returnReasonCodes || mockReturnReasonCodes
    const weeklyTrend = chartData?.weeklyTrend?.length ? chartData.weeklyTrend : mockWeeklyTrend
    const refundCategories = chartData?.refundCategories?.length ? chartData.refundCategories : mockRefundCategories
    const returnRateTrend = chartData?.returnRateTrend?.length ? chartData.returnRateTrend : mockReturnRateTrend
    const growingSubReasons = chartData?.growingSubReasons?.length ? chartData.growingSubReasons : mockGrowingSubReasons

    const rangeLabel =
        state.dateRange.preset === '7d' ? 'Past 7 Days' :
            state.dateRange.preset === '30d' ? 'Past 30 Days' :
                state.dateRange.preset === '90d' ? 'Past 90 Days' :
                    `${state.dateRange.startDate?.toLocaleDateString()} – ${state.dateRange.endDate?.toLocaleDateString()}`

    const activeCode = returnReasonCodes.find(r => r.code === activeReasonCode)
    const opacities = [1.0, 0.75, 0.55, 0.35]

    // Skeleton placeholder
    const Skeleton = ({ className = '' }) => (
        <div className={`bg-[#E8EAED] rounded-lg animate-pulse ${className}`} />
    )

    if (loading) {
        return (
            <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
                {/* Header skeleton */}
                <div className="mb-8">
                    <Skeleton className="h-3 w-32 mb-3" />
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-4 w-full max-w-[380px]" />
                </div>
                {/* Metric cards skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="bg-white border border-[#E8EAED] rounded-xl p-5">
                            <Skeleton className="h-3 w-24 mb-4" />
                            <Skeleton className="h-8 w-20 mb-3" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                    ))}
                </div>
                {/* Chart skeletons */}
                <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 mb-6">
                    <div className="bg-white rounded-xl border border-[#E8EAED] p-6"><Skeleton className="h-[230px]" /></div>
                    <div className="bg-white rounded-xl border border-[#E8EAED] p-6"><Skeleton className="h-[230px]" /></div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8" id="section-metrics" role="tabpanel" aria-label="High-Level Metrics">
            {/* ── V2 FROSTED OVERLAY ── */}
            <div className="relative group">
                <div className="absolute inset-0 z-20 pointer-events-none">
                    <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] rounded-xl pointer-events-auto"></div>

                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex justify-center pt-24 sm:pt-40">
                        <div className="bg-white/95 backdrop-blur-md border border-[#E8EAED] shadow-[0_8px_30px_rgba(0,0,0,0.12)] rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center max-w-[420px] mx-4 pointer-events-auto h-fit">
                            <div className="flex items-center gap-2.5 mb-4">
                                <span className="bg-[#FFF8EE] text-[#B7791F] border border-[#FF9900]/20 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">
                                    Version 2
                                </span>
                                <span className="bg-[#F8F9FA] text-[#565959] border border-[#E8EAED] text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">
                                    Mock Data
                                </span>
                            </div>
                            <h3 className="text-[18px] sm:text-[20px] font-bold text-[#0F1111] mb-2.5">
                                KPI & Metrics
                            </h3>
                            <p className="text-[13px] sm:text-[14px] text-[#565959] leading-relaxed">
                                This section currently contains mock data and will be fully built in Version 2.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── CONTENT (Translucent & Unclickable) ── */}
                <div className="opacity-[0.65] pointer-events-none select-none relative z-10 transition-opacity duration-300">
                    {/* ── PAGE HEADER ── */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 sm:mb-8">
                        <div>
                            <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-[#FF9900] mb-2">
                                SIGNAL — SECTION 2
                            </div>
                            <h1 className="text-[22px] sm:text-[28px] font-bold text-[#0F1111]">High-Level Metrics</h1>
                            <p className="text-[13px] sm:text-[14px] text-[#565959] mt-2 leading-relaxed max-w-[540px]">
                                A consolidated view of your returns data across the primary Data Warehouse, Tableau,
                                and Zendesk. Identical to what you see manually — but already pulled and structured.
                            </p>
                        </div>
                        <div className="bg-[#FFF8EE] border border-[#FF9900]/30 rounded-full px-4 py-2 flex items-center gap-2 self-start">
                            <Calendar size={14} className="text-[#FF9900]" />
                            <span className="text-[12px] sm:text-[13px] font-semibold text-[#B7791F]">Showing: {rangeLabel}</span>
                        </div>
                    </div>

                    {/* ── ROW 1 — 8 METRIC CARDS ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <MetricCard label="Return Rate" value={`${metricsObj.returnRate.value}`} unit="%" delta={metricsObj.returnRate.delta} deltaLabel="vs prior period" direction={metricsObj.returnRate.direction} source="Data Warehouse" />
                        <MetricCard label="Return Volume" value={metricsObj.returnVolume.value.toLocaleString()} delta={metricsObj.returnVolume.delta} deltaLabel="vs prior period" direction={metricsObj.returnVolume.direction} source="Data Warehouse" />
                        <MetricCard label="Refund Amount" value={`$${metricsObj.refundAmount.value}`} unit="M" delta={metricsObj.refundAmount.delta} deltaLabel="vs prior period" direction={metricsObj.refundAmount.direction} source="Data Warehouse" />
                        <MetricCard label="Refund Approval Rate" value={`${metricsObj.refundApprovalRate.value}`} unit="%" delta={metricsObj.refundApprovalRate.delta} deltaLabel="vs prior period" direction={metricsObj.refundApprovalRate.direction} source="Tableau" />
                        <div>
                            <MetricCard label="Fraud Flag Rate" value={`${metricsObj.fraudFlagRate.value}`} unit="%" delta={metricsObj.fraudFlagRate.delta} deltaLabel="vs prior period" direction={metricsObj.fraudFlagRate.direction} source="Data Warehouse" />
                            {metricsObj.fraudFlagRate.value > 2.5 && (
                                <div className="text-[10px] text-[#B7791F] font-medium mt-1 ml-1 flex items-center gap-1">
                                    <AlertTriangle size={10} />
                                    Above 2.5% threshold
                                </div>
                            )}
                        </div>
                        <MetricCard label="Avg. Resolution" value={`${metricsObj.avgResolutionDays.value}`} unit="d" delta={metricsObj.avgResolutionDays.delta} deltaLabel="vs prior period" direction={metricsObj.avgResolutionDays.direction} source="Zendesk" />
                        <MetricCard label="Returnable Items" value={`${metricsObj.returnableRate.value}`} unit="%" delta={metricsObj.returnableRate.delta} deltaLabel="vs prior period" direction={metricsObj.returnableRate.direction} source="Data Warehouse" />
                        <MetricCard label="Non-Returnable Items" value={`${metricsObj.nonReturnableRate.value}`} unit="%" delta={metricsObj.nonReturnableRate.delta} deltaLabel="vs prior period" direction={metricsObj.nonReturnableRate.direction} source="Data Warehouse" />
                    </div>

                    {/* ── ROW 2 — TREND + SPARKLINE ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 mb-6">
                        {/* LEFT — Weekly Trend */}
                        <div className="bg-white rounded-xl border border-[#E8EAED] shadow-[0_1px_4px_rgba(0,0,0,0.08)] p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-5">
                                <div>
                                    <h2 className="text-[15px] sm:text-[16px] font-semibold text-[#0F1111]">Weekly Returns & Refunds Trend</h2>
                                    <div className="text-[12px] text-[#9CA3A3] mt-0.5">Daily breakdown · {rangeLabel}</div>
                                </div>
                                <div className="flex gap-3 sm:gap-4 flex-wrap">
                                    {[
                                        { label: 'Returns', color: '#FF9900', dash: false },
                                        { label: 'Refunds', color: '#232F3E', dash: true },
                                        { label: 'Fraud', color: '#C0392B', dash: true },
                                    ].map(l => (
                                        <div key={l.label} className="flex items-center gap-1.5">
                                            <div className="w-6 h-[2px] rounded" style={{
                                                background: l.color,
                                                ...(l.dash ? { background: `repeating-linear-gradient(90deg, ${l.color} 0 4px, transparent 4px 7px)` } : {})
                                            }} />
                                            <span className="text-[11px] text-[#565959]">{l.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <ResponsiveContainer width="100%" height={230}>
                                <ComposedChart data={weeklyTrend} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                                    <XAxis dataKey="day" tick={{ fill: '#9CA3A3', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis yAxisId="left" tick={{ fill: '#9CA3A3', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                                    <YAxis yAxisId="right" orientation="right" tick={{ fill: '#9CA3A3', fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => {
                                        if (name === 'returns') return [value.toLocaleString(), 'Returns']
                                        if (name === 'refunds') return [value.toLocaleString(), 'Refunds']
                                        if (name === 'fraudFlags') return [value, 'Fraud Flags']
                                        return [value, name]
                                    }} />
                                    <defs>
                                        <linearGradient id="retGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#FF9900" stopOpacity={0.12} />
                                            <stop offset="100%" stopColor="#FF9900" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Area yAxisId="left" type="monotone" dataKey="returns" fill="url(#retGrad)" stroke="none" isAnimationActive animationDuration={500} />
                                    <Line yAxisId="left" type="monotone" dataKey="returns" stroke="#FF9900" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#FF9900' }} name="returns" isAnimationActive animationDuration={500} />
                                    <Line yAxisId="left" type="monotone" dataKey="refunds" stroke="#232F3E" strokeWidth={2} dot={false} strokeDasharray="5 3" activeDot={{ r: 4 }} name="refunds" isAnimationActive animationDuration={500} />
                                    <Line yAxisId="right" type="monotone" dataKey="fraudFlags" stroke="#C0392B" strokeWidth={1.5} dot={false} strokeDasharray="2 3" name="fraudFlags" isAnimationActive animationDuration={500} />
                                </ComposedChart>
                            </ResponsiveContainer>
                            <div className="text-[10px] text-[#6B7280] mt-2">Source: Data Warehouse · Zendesk</div>
                        </div>

                        {/* RIGHT — Return Rate 8-Week */}
                        <div className="bg-white rounded-xl border border-[#E8EAED] shadow-[0_1px_4px_rgba(0,0,0,0.08)] p-4 sm:p-6">
                            <h2 className="text-[15px] sm:text-[16px] font-semibold text-[#0F1111]">Return Rate — 8 Week View</h2>
                            <div className="text-[12px] text-[#9CA3A3] mt-0.5 mb-2">Is the situation improving?</div>
                            <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-3 py-1.5 mb-4">
                                <TrendingUp size={13} className="text-red-600" />
                                <span className="text-[12px] font-semibold text-red-600">↑ +23.5% over 8 weeks</span>
                            </div>

                            <ResponsiveContainer width="100%" height={170}>
                                <LineChart data={returnRateTrend} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                                    <XAxis dataKey="week" tick={{ fill: '#9CA3A3', fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#9CA3A3', fontSize: 10 }} axisLine={false} tickLine={false} domain={[6, 9]} tickFormatter={(v) => `${v}%`} />
                                    <Tooltip contentStyle={{ ...tooltipStyle, fontSize: '12px' }} formatter={(v) => [`${v}%`, 'Return Rate']} />
                                    <defs>
                                        <linearGradient id="rateGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#C0392B" stopOpacity={0.15} />
                                            <stop offset="100%" stopColor="#C0392B" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Area type="monotone" dataKey="rate" stroke="none" fill="url(#rateGrad)" isAnimationActive animationDuration={500} />
                                    <Line type="monotone" dataKey="rate" stroke="#C0392B" strokeWidth={2.5} dot={{ r: 3, fill: '#C0392B', strokeWidth: 0 }} activeDot={{ r: 5 }} isAnimationActive animationDuration={500} />
                                    <ReferenceLine y={7.0} stroke="#9CA3A3" strokeDasharray="4 2" label={{ value: 'Prev avg 7.0%', position: 'right', style: { fontSize: 9, fill: '#9CA3A3' } }} />
                                </LineChart>
                            </ResponsiveContainer>
                            <div className="text-[10px] text-[#6B7280] mt-2">Source: Data Warehouse · Feb 22 past 8 wks</div>
                        </div>
                    </div>

                    {/* ── ROW 3 — RETURN REASON CODE EXPLORER ── */}
                    <div id="reason-code-explorer" className="bg-white rounded-xl border border-[#E8EAED] shadow-[0_1px_4px_rgba(0,0,0,0.08)] p-4 sm:p-6 mb-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-6">
                            <div>
                                <h2 className="text-[15px] sm:text-[16px] font-semibold text-[#0F1111]">Return Reason Code Breakdown</h2>
                                <div className="text-[12px] text-[#9CA3A3] mt-0.5">Click any reason to see sub-reasons</div>
                            </div>
                            {activeReasonCode && (
                                <div className="flex items-center gap-2 text-[13px]">
                                    <button className="text-[#0066C0] cursor-pointer hover:underline" onClick={() => setActiveReasonCode(null)}>All Reasons</button>
                                    <ChevronRight size={13} className="text-[#9CA3A3]" />
                                    <span className="text-[#0F1111] font-medium">{activeReasonCode}</span>
                                </div>
                            )}
                        </div>

                        <div key={activeReasonCode || 'overview'} className="transition-opacity duration-200">
                            {!activeReasonCode ? (
                                /* ── OVERVIEW ── */
                                <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 lg:gap-8 items-center">
                                    {/* LEFT: Bar chart */}
                                    <div>
                                        <ResponsiveContainer width="100%" height={260}>
                                            <BarChart data={returnReasonCodes} layout="vertical" margin={{ top: 0, right: 60, left: 10, bottom: 0 }} barSize={22}
                                                onClick={(data) => { if (data && data.activePayload) setActiveReasonCode(data.activePayload[0].payload.code) }}>
                                                <XAxis type="number" hide />
                                                <YAxis type="category" dataKey="shortCode" tick={{ fill: '#0F1111', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} width={110} />
                                                <Tooltip contentStyle={tooltipStyle} formatter={(v, n, props) => [`${props.payload.pct}% (${props.payload.count.toLocaleString()} returns)`, props.payload.code]} cursor={{ fill: 'rgba(255,153,0,0.06)' }} />
                                                <Bar dataKey="pct" radius={[0, 4, 4, 0]} cursor="pointer" isAnimationActive animationDuration={500} animationEasing="ease-out">
                                                    {returnReasonCodes.map((entry, i) => (
                                                        <Cell key={i} fill={entry.color} />
                                                    ))}
                                                    <LabelList dataKey="pct" position="right" formatter={(v) => `${v}%`} style={{ fontSize: 12, fontWeight: 700, fill: '#0F1111' }} />
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                        <div className="text-[11px] text-[#9CA3A3] text-center mt-1">Click any bar to drill into sub-reasons →</div>
                                    </div>

                                    {/* RIGHT: Donut */}
                                    <div className="relative">
                                        <ResponsiveContainer width="100%" height={260}>
                                            <PieChart>
                                                <Pie data={returnReasonCodes} cx="50%" cy="50%" innerRadius={65} outerRadius={100} paddingAngle={2} dataKey="pct" startAngle={90} endAngle={-270} cursor="pointer" onClick={(data) => setActiveReasonCode(data.code)} isAnimationActive animationDuration={500}>
                                                    {returnReasonCodes.map((entry, i) => (
                                                        <Cell key={i} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip contentStyle={{ ...tooltipStyle, fontSize: '12px' }} formatter={(v, n, props) => [`${props.payload.pct}%`, props.payload.code]} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        {/* Center overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ top: '-10px' }}>
                                            <div className="text-center">
                                                <div className="text-[20px] font-bold text-[#0F1111]">47,832</div>
                                                <div className="text-[11px] text-[#9CA3A3]">total returns</div>
                                            </div>
                                        </div>
                                        {/* Legend */}
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3">
                                            {returnReasonCodes.map((e) => (
                                                <div key={e.code} className="flex items-center gap-2">
                                                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: e.color }} />
                                                    <span className="text-[11px] text-[#565959] truncate">{e.shortCode}</span>
                                                    <span className="text-[11px] font-bold text-[#0F1111] ml-auto">{e.pct}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* ── DRILL-DOWN ── */
                                <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 lg:gap-8 items-center">
                                    {/* LEFT: Sub-reason bar chart */}
                                    <div>
                                        <ResponsiveContainer width="100%" height={260}>
                                            <BarChart data={activeCode.subReasons} layout="vertical" margin={{ top: 0, right: 80, left: 10, bottom: 0 }} barSize={22}>
                                                <XAxis type="number" hide />
                                                <YAxis type="category" dataKey="label" tick={{ fill: '#0F1111', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} width={180} />
                                                <Tooltip contentStyle={tooltipStyle} formatter={(v, n, props) => [`${v}% (${props.payload.count.toLocaleString()})`, props.payload.label]} cursor={{ fill: 'rgba(255,153,0,0.06)' }} />
                                                <Bar dataKey="pct" radius={[0, 4, 4, 0]} isAnimationActive animationDuration={500} animationEasing="ease-out">
                                                    {activeCode.subReasons.map((_, i) => (
                                                        <Cell key={i} fill={activeCode.color} />
                                                    ))}
                                                    <LabelList dataKey="pct" content={(props) => <SubReasonLabel {...props} subReasons={activeCode.subReasons} />} />
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                        <div className="text-[10px] text-[#6B7280] mt-2">Source: Data Warehouse · Return Reason Codes</div>
                                    </div>

                                    {/* RIGHT: Sub-reason donut */}
                                    <div className="relative">
                                        <ResponsiveContainer width="100%" height={260}>
                                            <PieChart>
                                                <Pie data={activeCode.subReasons} cx="50%" cy="50%" innerRadius={65} outerRadius={100} paddingAngle={2} dataKey="pct" startAngle={90} endAngle={-270} isAnimationActive animationDuration={500}>
                                                    {activeCode.subReasons.map((_, i) => (
                                                        <Cell key={i} fill={hexToRgba(activeCode.color, opacities[i] || 0.35)} />
                                                    ))}
                                                </Pie>
                                                <Tooltip contentStyle={{ ...tooltipStyle, fontSize: '12px' }} formatter={(v, n, props) => [`${v}%`, props.payload.label]} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        {/* Center overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ top: '-10px' }}>
                                            <div className="text-center">
                                                <div className="text-[14px] font-bold text-[#0F1111]">{activeCode.code}</div>
                                                <div className="text-[11px] text-[#9CA3A3]">{activeCode.pct}% of all returns</div>
                                            </div>
                                        </div>
                                        {/* Legend */}
                                        <div className="flex flex-col gap-1.5 mt-3">
                                            {activeCode.subReasons.map((s, i) => (
                                                <div key={s.label} className="flex items-center gap-2">
                                                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: hexToRgba(activeCode.color, opacities[i] || 0.35) }} />
                                                    <span className="text-[11px] text-[#565959] truncate flex-1">{s.label}</span>
                                                    <span className="text-[11px] font-bold text-[#0F1111]">{s.pct}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── ROW 4 — REFUND BREAKDOWN + GROWING SUB-REASONS ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-4 mb-6">
                        {/* LEFT: Refund Type */}
                        <div className="bg-white rounded-xl border border-[#E8EAED] shadow-[0_1px_4px_rgba(0,0,0,0.08)] p-4 sm:p-6">
                            <h2 className="text-[15px] sm:text-[16px] font-semibold text-[#0F1111]">Refund Type Breakdown</h2>
                            <div className="text-[12px] text-[#9CA3A3] mt-0.5 mb-4">How refunds were resolved · {rangeLabel}</div>

                            <ResponsiveContainer width="100%" height={160}>
                                <PieChart>
                                    <Pie data={refundCategories} cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={3} dataKey="pct" startAngle={90} endAngle={-270} isAnimationActive animationDuration={500}>
                                        {refundCategories.map((e, i) => (
                                            <Cell key={i} fill={e.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v, n, p) => [`${v}% · ${p.payload.count.toLocaleString()}`, p.payload.name]} contentStyle={{ ...tooltipStyle, fontSize: '11px' }} />
                                </PieChart>
                            </ResponsiveContainer>

                            <div className="flex flex-col gap-2 mt-3">
                                {refundCategories.map(e => (
                                    <div key={e.name} className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: e.color }} />
                                        <span className="text-[12px] text-[#565959] flex-1">{e.name}</span>
                                        <div className="flex-1 max-w-[80px] h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden hidden sm:block">
                                            <div className="h-full rounded-full" style={{ width: `${e.pct}%`, background: e.color }} />
                                        </div>
                                        <span className="text-[12px] font-bold text-[#0F1111] w-8 text-right">{e.pct}%</span>
                                        <span className="text-[10px] text-[#6B7280] hidden sm:inline">({e.count.toLocaleString()})</span>
                                    </div>
                                ))}
                            </div>
                            <div className="text-[10px] text-[#6B7280] mt-4">Source: Data Warehouse</div>
                        </div>

                        {/* RIGHT: Growing Sub-Reasons */}
                        <div className="bg-white rounded-xl border border-[#E8EAED] shadow-[0_1px_4px_rgba(0,0,0,0.08)] p-4 sm:p-6">
                            <h2 className="text-[15px] sm:text-[16px] font-semibold text-[#0F1111]">Fastest-Growing Return Sub-Reasons</h2>
                            <div className="text-[12px] text-[#9CA3A3] mt-0.5 mb-5">Sub-reasons with biggest 8-week growth</div>

                            {/* Alert callout */}
                            <div className="bg-[#FFF8EE] border border-[#FF9900]/20 rounded-lg p-3 flex items-start gap-2 mb-4">
                                <AlertTriangle size={14} className="text-[#FF9900] flex-shrink-0 mt-0.5" />
                                <span className="text-[12px] text-[#B7791F]">
                                    3 sub-reasons are growing faster than the overall return rate. Signal's AI Insights section has more detail.
                                </span>
                            </div>

                            <div className="flex flex-col gap-5">
                                {growingSubReasons.map(item => (
                                    <div key={item.label}>
                                        <div className="flex flex-wrap justify-between gap-2 mb-1">
                                            <div>
                                                <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold mr-2" style={{ background: hexToRgba(item.parentColor, 0.1), color: item.parentColor }}>
                                                    {item.parent}
                                                </span>
                                                <div className="text-[13px] font-medium text-[#0F1111] mt-0.5">{item.label}</div>
                                            </div>
                                            <span className="bg-red-50 text-red-600 border border-red-200 rounded-full px-2 py-0.5 text-[11px] font-bold h-fit">
                                                +{item.growthPct}%
                                            </span>
                                        </div>
                                        <ResponsiveContainer width="100%" height={40}>
                                            <LineChart data={item.weeks.map((w, i) => ({ week: w, value: item.trend[i] }))}>
                                                <Line type="monotone" dataKey="value" stroke={item.parentColor} strokeWidth={2} dot={false} isAnimationActive animationDuration={500} />
                                                <Tooltip contentStyle={{ ...tooltipStyle, fontSize: '11px' }} formatter={(v) => [v, 'Reports']} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                ))}
                            </div>
                            <div className="text-[10px] text-[#6B7280] mt-4">Source: Data Warehouse · 8-week trend</div>
                        </div>
                    </div>

                    {/* ── ROW 5 — CHATBOT ── */}
                    <ChatBot
                        scope="metrics"
                        title="Ask about these metrics"
                        subtitle="Scoped to returns data above. All answers include citations."
                        placeholder='e.g. "Why is the Defective rate highest?" or "What drove the fraud spike on Wednesday?"'
                        suggestedQueries={[
                            "Why is 'Defective / Quality' the top reason?",
                            "Which sub-reason is growing fastest?",
                            "What drove the fraud flag spike on Wednesday?",
                            "How does this week compare to last week?"
                        ]}
                    />
                </div>
            </div>
        </div>
    )
}
