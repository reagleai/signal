import { CheckCircle, XCircle, Info, X } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function Toast() {
    const { state, removeToast } = useApp()

    if (state.toasts.length === 0) return null

    const icons = {
        success: <CheckCircle size={14} className="text-[#067D62] flex-shrink-0" />,
        error: <XCircle size={14} className="text-[#C0392B] flex-shrink-0" />,
        info: <Info size={14} className="text-[#FF9900] flex-shrink-0" />,
    }

    const borders = {
        success: 'border-l-[#067D62]',
        error: 'border-l-[#C0392B]',
        info: 'border-l-[#FF9900]',
    }

    return (
        <div className="fixed bottom-16 sm:bottom-20 right-4 sm:right-6 z-[100] flex flex-col gap-2" role="status" aria-live="polite">
            {state.toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`toast-enter flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-[13px] min-w-[200px] sm:min-w-[240px] max-w-[calc(100vw-32px)] sm:max-w-[320px] bg-white border-l-4 text-[#0F1111] ${borders[toast.type] || borders.info}`}
                    role="alert"
                >
                    {icons[toast.type] || icons.info}
                    <span className="flex-1">{toast.message}</span>
                    <button
                        aria-label="Dismiss notification"
                        className="ml-auto p-2 text-[#9CA3A3] cursor-pointer hover:text-[#0F1111] flex-shrink-0 rounded min-w-[32px] min-h-[32px] flex items-center justify-center"
                        onClick={() => removeToast(toast.id)}
                    >
                        <X size={12} />
                    </button>
                </div>
            ))}
        </div>
    )
}
