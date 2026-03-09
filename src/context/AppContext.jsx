import React, { createContext, useContext, useReducer, useEffect } from 'react'

const AppContext = createContext(null)

const defaultState = {
    activeSection: "data-status",
    dateRange: {
        preset: "7d",
        startDate: null,
        endDate: null
    },
    toasts: [],
    selectedProblemId: null,
    notePadItems: [],
    activeCitations: [],
    lastSyncInfo: null,  // { lastGlobalSyncTime, activeSources, ragIndexed, recordsProcessed }
    preferences: {
        defaultSection: null,
        lastVisited: null,
        sessionCount: 0,
        sectionDurations: {}
    }
}

function reducer(state, action) {
    switch (action.type) {
        case 'SET_ACTIVE_SECTION':
            return { ...state, activeSection: action.payload }
        case 'SET_DATE_RANGE':
            return { ...state, dateRange: { ...state.dateRange, ...action.payload } }
        case 'ADD_TOAST':
            return { ...state, toasts: [...state.toasts, action.payload] }
        case 'REMOVE_TOAST':
            return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) }
        case 'SET_SELECTED_PROBLEM_ID':
            return { ...state, selectedProblemId: action.payload }
        case 'ADD_TO_NOTEPAD':
            return { ...state, notePadItems: [...state.notePadItems, action.payload] }
        case 'UPDATE_NOTEPAD_ITEM':
            return {
                ...state,
                notePadItems: state.notePadItems.map(item =>
                    item.problemId === action.payload.id ? { ...item, ...action.payload.changes } : item
                )
            }
        case 'REMOVE_FROM_NOTEPAD':
            return { ...state, notePadItems: state.notePadItems.filter(item => item.problemId !== action.payload) }
        case 'SET_ACTIVE_CITATIONS':
            return { ...state, activeCitations: action.payload }
        case 'SET_LAST_SYNC_INFO':
            return { ...state, lastSyncInfo: action.payload }
        case 'SET_PREFERENCES':
            return { ...state, preferences: { ...state.preferences, ...action.payload } }
        default:
            return state
    }
}

export function AppProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, defaultState, (initial) => {
        let hydrated = { ...initial }
        try {
            const savedPrefs = localStorage.getItem('signal-preferences')
            if (savedPrefs) {
                hydrated.preferences = { ...hydrated.preferences, ...JSON.parse(savedPrefs) }
            }
            const savedSync = localStorage.getItem('signal-sync-cache')
            if (savedSync) {
                hydrated.lastSyncInfo = JSON.parse(savedSync)
            }
        } catch { }
        return hydrated
    })

    // Save sync info to localStorage on change
    useEffect(() => {
        if (state.lastSyncInfo) {
            try {
                localStorage.setItem('signal-sync-cache', JSON.stringify(state.lastSyncInfo))
            } catch { }
        }
    }, [state.lastSyncInfo])

    // Save preferences to localStorage on change
    useEffect(() => {
        try {
            localStorage.setItem('signal-preferences', JSON.stringify(state.preferences))
        } catch { }
    }, [state.preferences])

    // Track section visits
    useEffect(() => {
        const prefs = { ...state.preferences, lastVisited: state.activeSection }
        dispatch({ type: 'SET_PREFERENCES', payload: prefs })
    }, [state.activeSection])

    const actions = {
        setActiveSection: (section) => dispatch({ type: 'SET_ACTIVE_SECTION', payload: section }),
        setDateRange: (range) => dispatch({ type: 'SET_DATE_RANGE', payload: range }),
        addToast: (toast) => {
            dispatch({ type: 'ADD_TOAST', payload: toast })
            setTimeout(() => dispatch({ type: 'REMOVE_TOAST', payload: toast.id }), 4000)
        },
        removeToast: (id) => dispatch({ type: 'REMOVE_TOAST', payload: id }),
        setSelectedProblemId: (id) => dispatch({ type: 'SET_SELECTED_PROBLEM_ID', payload: id }),
        addToNotepad: (item) => dispatch({ type: 'ADD_TO_NOTEPAD', payload: item }),
        updateNotepadItem: (id, changes) => dispatch({ type: 'UPDATE_NOTEPAD_ITEM', payload: { id, changes } }),
        removeFromNotepad: (id) => dispatch({ type: 'REMOVE_FROM_NOTEPAD', payload: id }),
        setActiveCitations: (ids) => dispatch({ type: 'SET_ACTIVE_CITATIONS', payload: ids }),
        setLastSyncInfo: (info) => dispatch({ type: 'SET_LAST_SYNC_INFO', payload: info }),
    }

    return (
        <AppContext.Provider value={{ state, ...actions }}>
            {children}
        </AppContext.Provider>
    )
}

export function useApp() {
    const context = useContext(AppContext)
    if (!context) throw new Error('useApp must be used within AppProvider')
    return context
}
