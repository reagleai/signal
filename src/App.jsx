import { useState } from 'react'
import { useApp } from './context/AppContext'
import { useSession } from './hooks/useSession'

import LandingPage from './components/LandingPage'

import Navbar from './components/layout/Navbar'
import SectionNav from './components/layout/SectionNav'
import StatusBar from './components/layout/StatusBar'
import FeedbackButton from './components/layout/FeedbackButton'

import DataStatus from './components/sections/DataStatus'
import HighLevelMetrics from './components/sections/HighLevelMetrics'
import AIInsights from './components/sections/AIInsights'

import Toast from './components/shared/Toast'

export default function App() {
    const { state } = useApp()
    useSession()

    const [view, setView] = useState(() => {
        try {
            return localStorage.getItem('signal-view') === 'dashboard' ? 'dashboard' : 'landing'
        } catch { return 'landing' }
    })

    const handleEnterDashboard = () => {
        setView('dashboard')
        try { localStorage.setItem('signal-view', 'dashboard') } catch {}
    }

    const handleBackToLanding = () => {
        setView('landing')
        try { localStorage.setItem('signal-view', 'landing') } catch {}
    }

    if (view === 'landing') {
        return <LandingPage onEnterDashboard={handleEnterDashboard} />
    }

    return (
        <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#F7F8FA] font-['Inter']">
            <Navbar onBackToLanding={handleBackToLanding} />
            <SectionNav />

            <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth" role="main">
                {state.activeSection === 'data-status' && <DataStatus />}
                {state.activeSection === 'metrics' && <HighLevelMetrics />}
                {state.activeSection === 'ai-insights' && <AIInsights />}
            </main>

            <StatusBar />
            <FeedbackButton />
            <Toast />
        </div>
    )
}
