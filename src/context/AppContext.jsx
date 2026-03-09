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
    durableActions: {}, // { [actionKey]: { status: 'idle'|'running'|'completed'|'failed'|'recovering', jobId, startedAt, error, data } }
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
        case 'SET_DURABLE_ACTION':
            return {
                ...state,
                durableActions: {
                    ...state.durableActions,
                    [action.payload.key]: {
                        ...(state.durableActions[action.payload.key] || {}),
                        ...action.payload.state
                    }
                }
            }
        case 'SET_PREFERENCES':
            return { ...state, preferences: { ...state.preferences, ...action.payload } }
        default:
            return state
    }
}

import { fetchAIInsights } from '../api/aiInsightsAdapter'

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
            const savedActions = localStorage.getItem('signal-durable-actions')
            if (savedActions) {
                const parsedActions = JSON.parse(savedActions)
                // Degrade any 'running' actions that got interrupted by a reload
                Object.keys(parsedActions).forEach(key => {
                    const action = parsedActions[key]
                    if (action.status === 'running') {
                        const isStale = (Date.now() - new Date(action.startedAt).getTime()) > 600000;
                        action.status = isStale ? 'failed' : 'recovering';
                        action.error = isStale ? "Run timed out." : "Action was interrupted by a page reload. We cannot confirm the active status.";
                    }
                })
                hydrated.durableActions = parsedActions
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

    // Save durable actions to localStorage on change
    useEffect(() => {
        try {
            localStorage.setItem('signal-durable-actions', JSON.stringify(state.durableActions))
        } catch { }
    }, [state.durableActions])

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

        // Generalized single-action updater
        setDurableAction: (key, actionState) => dispatch({
            type: 'SET_DURABLE_ACTION',
            payload: { key, state: actionState }
        }),
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

/**
 * Hook to consume a shared durable action.
 * Survives component unmounts and tracks state globally.
 */
export function useDurableAction(actionKey) {
    const { state, setDurableAction } = useApp()

    // Default struct if it has never been triggered
    const actionState = state.durableActions[actionKey] || {
        status: 'idle',
        startedAt: null,
        error: null,
        data: null
    }

    const runAction = async (promiseFn) => {
        // Prevent duplicate execution if already running globally
        if (actionState.status === 'running') return;

        setDurableAction(actionKey, {
            status: 'running',
            startedAt: new Date().toISOString(),
            error: null
        })

        try {
            // Unmount-safe execution: modifies global context
            const result = await promiseFn()

            setDurableAction(actionKey, {
                status: 'completed',
                data: result
            })
            return result
        } catch (err) {
            setDurableAction(actionKey, {
                status: 'failed',
                error: err.message || 'Operation failed'
            })
            throw err
        }
    }

    const setStatus = (newStatusOrPartial) => {
        if (typeof newStatusOrPartial === 'string') {
            setDurableAction(actionKey, { status: newStatusOrPartial })
        } else {
            setDurableAction(actionKey, newStatusOrPartial)
        }
    }

    const resetAction = () => {
        setDurableAction(actionKey, { status: 'idle', data: null, error: null })
    }

    return {
        ...actionState,     // status, startedAt, error, data
        runAction,          // method to wrap async operations safely
        setStatus,          // manual override
        resetAction         // clear back to idle
    }
}
