/**
 * IST (Indian Standard Time) formatting helpers — shared across components.
 */
const IST_TZ = 'Asia/Kolkata'

export function formatISTTime(isoOrStr) {
    if (!isoOrStr) return '—'
    const d = new Date(isoOrStr)
    if (isNaN(d.getTime())) return String(isoOrStr)
    return d.toLocaleTimeString('en-IN', { timeZone: IST_TZ, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
}

export function formatISTDate(isoOrStr) {
    if (!isoOrStr) return '—'
    const d = new Date(isoOrStr)
    if (isNaN(d.getTime())) return String(isoOrStr)
    const today = new Date()
    const istToday = new Date(today.toLocaleString('en-US', { timeZone: IST_TZ }))
    const istDate = new Date(d.toLocaleString('en-US', { timeZone: IST_TZ }))
    if (istDate.toDateString() === istToday.toDateString()) return 'Today'
    return d.toLocaleDateString('en-IN', { timeZone: IST_TZ, day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatISTFull(isoOrStr) {
    if (!isoOrStr) return '—'
    const d = new Date(isoOrStr)
    if (isNaN(d.getTime())) return String(isoOrStr)
    return d.toLocaleString('en-IN', { timeZone: IST_TZ, day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
}
