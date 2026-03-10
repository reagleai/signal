import { useState, useEffect } from 'react'
import { RefreshCw, CheckCircle, XCircle, Brain, Zap } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { integrations as mockIntegrations } from '../../data/mockData'
import { endpoints } from '../../config/endpoints'
import MetricCard from '../shared/MetricCard'
import Badge from '../shared/Badge'

// ── IST formatting helpers ──────────────────────────────────
const IST_TZ = 'Asia/Kolkata'

function formatISTTime(isoOrStr) {
    if (!isoOrStr) return '—'
    const d = new Date(isoOrStr)
    if (isNaN(d.getTime())) return String(isoOrStr)  // pass through pre-formatted strings
    return d.toLocaleTimeString('en-IN', { timeZone: IST_TZ, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
}

function formatISTDate(isoOrStr) {
    if (!isoOrStr) return '—'
    const d = new Date(isoOrStr)
    if (isNaN(d.getTime())) return String(isoOrStr)
    const today = new Date()
    const istToday = new Date(today.toLocaleString('en-US', { timeZone: IST_TZ }))
    const istDate = new Date(d.toLocaleString('en-US', { timeZone: IST_TZ }))
    if (istDate.toDateString() === istToday.toDateString()) return 'Today'
    return d.toLocaleDateString('en-IN', { timeZone: IST_TZ, day: '2-digit', month: 'short', year: 'numeric' })
}

function formatISTFull(isoOrStr) {
    if (!isoOrStr) return '—'
    const d = new Date(isoOrStr)
    if (isNaN(d.getTime())) return String(isoOrStr)
    return d.toLocaleString('en-IN', { timeZone: IST_TZ, day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
}

// Visual identity per lane — n8n doesn't return these, so we derive them locally
const LANE_META = {
    returns: { iconBg: '#FF9900', iconInitial: 'DW', label: 'Data Warehouse' },
    crm: { iconBg: '#03363D', iconInitial: 'CRM', label: 'Customer Service' },
    reviews: { iconBg: '#0D96F6', iconInitial: 'VoC', label: 'VoC / Reviews' },
    fraud: { iconBg: '#C0392B', iconInitial: 'FR', label: 'Fraud & Risk' },
    nps: { iconBg: '#8B5CF6', iconInitial: 'NPS', label: 'NPS Boards' },
}

// Normalize a source object from n8n into what the UI expects
function normalizeSource(src) {
    const meta = LANE_META[src.id] || { iconBg: '#9CA3A3', iconInitial: src.id?.[0]?.toUpperCase() || '?', label: src.id }
    const isSynced = src.status === 'Synced'
    const isIndexed = src.ragStatus === 'Indexed'
    return {
        id: src.id,
        name: src.name || meta.label,
        iconBg: meta.iconBg,
        iconInitial: meta.iconInitial,
        category: meta.label,
        status: src.status || 'Unknown',
        isSynced,
        // Parse the raw ISO time from n8n and format in IST
        lastSyncTime: formatISTTime(src.lastSyncTimeRaw || src.lastSyncTime),
        lastSyncDate: formatISTDate(src.lastSyncTimeRaw || src.lastSyncTime),
        recordsPulled: Number(src.recordsPulled || 0).toLocaleString(),
        recordsUnit: src.recordsUnit || 'rows',
        ragStatus: src.ragStatus || 'Unknown',
        isIndexed,
        ragCount: Number(src.ragIndexed ?? 1),
        namespace: src.namespace || '—',
    }
}

// Convert mock integrations to the same shape for fallback
function normalizeMock(item) {
    return {
        id: item.id,
        name: item.name,
        iconBg: item.iconBg,
        iconInitial: item.iconInitial,
        category: item.category,
        status: 'Synced',
        isSynced: true,
        lastSyncTime: item.lastSyncTime,
        lastSyncDate: item.lastSyncDate,
        recordsPulled: item.recordsPulled,
        recordsUnit: item.recordsUnit,
        ragStatus: 'Indexed',
        isIndexed: true,
        ragCount: item.ragCount,
        namespace: `RAG${item.id}`,
    }
}

export default function DataStatus() {
    const { state, setActiveSection, addToast, setLastSyncInfo } = useApp()

    const [sources, setSources] = useState(() => {
        try {
            const cached = localStorage.getItem('signal-sources-cache')
            if (cached) return JSON.parse(cached)
        } catch { }
        return mockIntegrations.map(normalizeMock)
    })

    const summary = state.lastSyncInfo || {
        activeSources: 5,
        ragIndexed: 5,
        recordsProcessed: '1,705',
        lastGlobalSyncTime: '—',
        lastGlobalSyncTimeRaw: null
    }
    const [loading, setLoading] = useState(false)
    const [syncing, setSyncing] = useState(false)
    const [lastError, setLastError] = useState(null)

    async function fetchData() {
        setLoading(true)
        setLastError(null)
        try {
            const res = await fetch(endpoints.dataSources, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: '{}'
            })
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            const json = await res.json()

            const normalized = Array.isArray(json.sources)
                ? json.sources.map(normalizeSource)
                : mockIntegrations.map(normalizeMock)

            setSources(normalized)
            try {
                localStorage.setItem('signal-sources-cache', JSON.stringify(normalized))
            } catch { }

            const syncInfo = {
                activeSources: json.activeSources ?? normalized.filter(s => s.isSynced).length,
                ragIndexed: json.ragIndexed ?? normalized.reduce((s, r) => s + r.ragCount, 0),
                recordsProcessed: json.recordsProcessed != null
                    ? Number(json.recordsProcessed).toLocaleString()
                    : normalized.reduce((s, r) => s + Number(r.recordsPulled?.replace(/,/g, '') || 0), 0).toLocaleString(),
                lastGlobalSyncTime: formatISTFull(json.lastGlobalSyncTimeRaw || json.lastGlobalSyncTime),
                lastGlobalSyncTimeRaw: json.lastGlobalSyncTimeRaw || null,
            }
            setLastSyncInfo(syncInfo)
        } catch (err) {
            setLastError(err.message)
            // keep existing state (mock)
        } finally {
            setLoading(false)
        }
    }

    // No auto-fetch on mount — data starts as mock, only fetches when Re-sync is clicked

    const handleResync = async () => {
        if (syncing) return
        setSyncing(true)
        addToast({ id: Date.now(), type: 'info', message: 'Re-syncing all sources…' })
        await fetchData()
        addToast({ id: Date.now(), type: 'success', message: 'Sources refreshed.' })
        setSyncing(false)
    }

    // ── Loading skeleton ──────────────────────────────────────
    const Skeleton = ({ className = '' }) => <div className={`bg-[#E8EAED] rounded-lg animate-pulse ${className}`} />

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
                    {lastError && (
                        <p className="text-[11px] text-amber-600 mt-2 flex items-center gap-1">
                            <XCircle size={12} /> Live data unavailable — showing cached data
                        </p>
                    )}
                </div>
                <button
                    onClick={handleResync}
                    disabled={syncing || loading}
                    className="flex items-center gap-2 px-4 py-2.5 border border-[#E8EAED] rounded-lg bg-white text-[13px] text-[#565959] font-medium hover:border-[#FF9900] hover:text-[#0F1111] transition-colors self-start min-h-[44px] disabled:opacity-50"
                >
                    <RefreshCw size={14} className={syncing || loading ? 'animate-spin' : ''} />
                    {syncing ? 'Syncing…' : 'Re-sync all sources'}
                </button>
            </div>

            {/* Summary Cards — 3 cards (Batch Duration removed) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 sm:mb-8">
                {loading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="bg-white border border-[#E8EAED] rounded-xl p-5">
                            <Skeleton className="h-3 w-24 mb-4" />
                            <Skeleton className="h-8 w-16 mb-3" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                    ))
                ) : (
                    <>
                        <MetricCard
                            label="Active Sources"
                            value={String(summary.activeSources)}
                            source="All systems synced"
                            icon={<CheckCircle size={18} className="text-[#067D62]" />}
                        />
                        <MetricCard
                            label="RAGs Indexed"
                            value={String(summary.ragIndexed)}
                            source="Knowledge bases ready"
                            icon={<Brain size={18} className="text-[#FF9900]" />}
                        />
                        <MetricCard
                            label="Records Processed"
                            value={typeof summary.recordsProcessed === 'number'
                                ? summary.recordsProcessed.toLocaleString()
                                : String(summary.recordsProcessed)}
                            source={`Last sync: ${summary.lastGlobalSyncTime}`}
                        />
                    </>
                )}
            </div>

            {/* Data Sources Table */}
            <div className="bg-white rounded-xl border border-[#E8EAED] shadow-[0_1px_4px_rgba(0,0,0,0.08)] overflow-hidden mb-6 sm:mb-8">

                {/* Mobile card layout */}
                <div className="block lg:hidden">
                    <div className="bg-[#F7F8FA] border-b border-[#E8EAED] px-4 py-3">
                        <h2 className="text-[12px] font-semibold uppercase tracking-wide text-[#9CA3A3]">Data Sources</h2>
                    </div>
                    {loading
                        ? [1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="px-4 py-4 border-b border-[#E8EAED]">
                                <Skeleton className="h-10 w-full mb-2" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        ))
                        : sources.map((item, idx) => (
                            <div key={item.id} className={`px-4 py-4 ${idx < sources.length - 1 ? 'border-b border-[#E8EAED]' : ''}`}>
                                <div className="flex items-center gap-3 mb-3">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[11px] text-white flex-shrink-0"
                                        style={{ background: item.iconBg }}
                                    >
                                        {item.iconInitial}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[14px] font-semibold text-[#0F1111]">{item.name}</div>
                                        <div className="text-[11px] text-[#9CA3A3]">{item.category}</div>
                                    </div>
                                    {item.isSynced
                                        ? <Badge variant="green" icon={<CheckCircle size={11} />} label="Synced" />
                                        : <Badge variant="red" icon={<XCircle size={11} />} label="Error" />
                                    }
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-[12px]">
                                    <div>
                                        <span className="text-[#9CA3A3] block text-[10px] uppercase tracking-wide mb-0.5">Last Sync</span>
                                        <span className="text-[#0F1111] font-medium">{item.lastSyncTime}</span>
                                        <span className="text-[#9CA3A3] ml-1 block text-[11px]">{item.lastSyncDate}</span>
                                    </div>
                                    <div>
                                        <span className="text-[#9CA3A3] block text-[10px] uppercase tracking-wide mb-0.5">Records</span>
                                        <span className="text-[#FF9900] font-bold">{item.recordsPulled}</span>
                                        <span className="text-[#9CA3A3] ml-1">{item.recordsUnit}</span>
                                    </div>
                                    <div>
                                        <span className="text-[#9CA3A3] block text-[10px] uppercase tracking-wide mb-0.5">RAG Status</span>
                                        <span className="inline-flex items-center gap-1 text-[#B7791F] font-medium">
                                            <CheckCircle size={11} />
                                            {item.ragCount} RAG{item.ragCount > 1 ? 's' : ''} · {item.ragStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    }
                </div>

                {/* Desktop table layout */}
                <div className="hidden lg:block">
                    <div className="bg-[#F7F8FA] border-b border-[#E8EAED] px-6 py-3">
                        <div className="grid grid-cols-[2.5fr_1fr_1.5fr_1.5fr_1.2fr] gap-4 items-center">
                            {['SOURCE', 'STATUS', 'LAST SYNC', 'RECORDS PULLED', 'RAG STATUS'].map(col => (
                                <span key={col} className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3A3]">{col}</span>
                            ))}
                        </div>
                    </div>

                    {loading
                        ? [1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="px-6 py-5 border-b border-[#E8EAED]">
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ))
                        : sources.map((item, idx) => (
                            <div
                                key={item.id}
                                className={`grid grid-cols-[2.5fr_1fr_1.5fr_1.5fr_1.2fr] gap-4 items-center px-6 py-5 hover:bg-[#F7F8FA] transition-colors cursor-default ${idx < sources.length - 1 ? 'border-b border-[#E8EAED]' : ''}`}
                            >
                                {/* Source */}
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[11px] text-white flex-shrink-0"
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
                                    {item.isSynced
                                        ? <Badge variant="green" icon={<CheckCircle size={11} />} label="Synced" />
                                        : <Badge variant="red" icon={<XCircle size={11} />} label="Error" />
                                    }
                                </div>

                                {/* Last Sync */}
                                <div>
                                    <div className="text-[13px] font-medium text-[#0F1111]">{item.lastSyncTime}</div>
                                    <div className="text-[11px] text-[#9CA3A3]">{item.lastSyncDate}</div>
                                </div>

                                {/* Records Pulled */}
                                <div>
                                    <span className="text-[14px] font-bold text-[#FF9900]">{item.recordsPulled}</span>
                                    <span className="text-[11px] text-[#9CA3A3] ml-1">{item.recordsUnit}</span>
                                </div>

                                {/* RAG Status */}
                                <div>
                                    <span className={`inline-flex items-center gap-1 text-[12px] font-medium rounded-full px-3 py-1 ${item.isIndexed
                                        ? 'bg-[#FFF8EE] border border-[#FF9900]/20 text-[#B7791F]'
                                        : 'bg-[#FEF2F2] border border-red-200 text-red-600'
                                        }`}>
                                        <CheckCircle size={11} />
                                        {item.ragCount} RAG{item.ragCount > 1 ? 's' : ''} · {item.ragStatus}
                                    </span>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>

            {/* PLG Insight Banner */}
            <div className="bg-[#FFF8EE] border border-[#FF9900]/20 rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                <Zap size={22} className="text-[#FF9900] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <div className="text-[14px] sm:text-[15px] font-semibold text-[#0F1111] mb-1">
                        Signal processed {typeof summary.recordsProcessed === 'number'
                            ? summary.recordsProcessed.toLocaleString()
                            : summary.recordsProcessed} return events overnight — so you don't have to.
                    </div>
                    <div className="text-[12px] sm:text-[13px] text-[#565959] leading-relaxed">
                        All {summary.ragIndexed} knowledge bases are indexed and ready. Your usual process — pulling from the
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
