import { useEffect, useRef, useCallback } from 'react'
import { useApp } from '../context/AppContext'

export function useSession() {
    const { state, setActiveSection } = useApp()
    const sectionTimerRef = useRef(null)
    const sessionStartRef = useRef(Date.now())

    // Increment session count on mount
    useEffect(() => {
        let prefs = {}
        try {
            const saved = localStorage.getItem('signal-preferences')
            if (saved) prefs = JSON.parse(saved) ?? {}
        } catch { /* corrupted data — reset */ }
        prefs.sessionCount = (prefs.sessionCount || 0) + 1
        localStorage.setItem('signal-preferences', JSON.stringify(prefs))

        // After 3 sessions, auto-navigate to dominant section
        if (prefs.sessionCount >= 3 && prefs.sectionDurations) {
            const durations = prefs.sectionDurations
            const total = Object.values(durations).reduce((a, b) => a + b, 0)
            if (total > 0) {
                const dominant = Object.entries(durations).sort((a, b) => b[1] - a[1])[0]
                if (dominant && dominant[1] / total > 0.6) {
                    prefs.defaultSection = dominant[0]
                    localStorage.setItem('signal-preferences', JSON.stringify(prefs))
                    setActiveSection(dominant[0])
                }
            }
        }
    }, [])

    // Track time spent per section
    useEffect(() => {
        const section = state.activeSection
        const start = Date.now()

        return () => {
            const elapsed = Date.now() - start
            try {
                const saved = localStorage.getItem('signal-preferences')
                let prefs = saved ? JSON.parse(saved) : {}
                if (!prefs.sectionDurations) prefs.sectionDurations = {}
                prefs.sectionDurations[section] = (prefs.sectionDurations[section] || 0) + elapsed
                localStorage.setItem('signal-preferences', JSON.stringify(prefs))
            } catch { }
        }
    }, [state.activeSection])

    return {
        sessionDuration: Date.now() - sessionStartRef.current,
        sectionDurations: state.preferences.sectionDurations || {}
    }
}
