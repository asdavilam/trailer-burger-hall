'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
    message: string
    type?: ToastType
    isVisible: boolean
    onClose: () => void
}

export function Toast({ message, type = 'info', isVisible, onClose }: ToastProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        if (isVisible) {
            const timer = setTimeout(onClose, 3000)
            return () => clearTimeout(timer)
        }
    }, [isVisible, onClose])

    if (!mounted || !isVisible) return null

    const getColors = () => {
        switch (type) {
            case 'success':
                return 'bg-[#6b8e62] text-white border-[#5a7a50]' // Sage (Brand)
            case 'error':
                return 'bg-[#6a1e1a] text-white border-[#501614]' // Wine (Brand)
            default:
                return 'bg-[#3b1f1a] text-white border-[#2a1612]' // Espresso (Brand)
        }
    }

    const getIcon = () => {
        switch (type) {
            case 'success': return '✅'
            case 'error': return '🛑'
            default: return 'ℹ️'
        }
    }

    return createPortal(
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div
                className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-xl border ${getColors()} min-w-[300px]`}
            >
                <span className="text-xl">{getIcon()}</span>
                <div className="flex-1">
                    <p className="font-bold font-display tracking-wide text-sm">
                        {type === 'error' ? 'Atención' : type === 'success' ? 'Éxito' : 'Información'}
                    </p>
                    <p className="text-sm opacity-90 font-sans">{message}</p>
                </div>
                <button
                    onClick={onClose}
                    className="text-white/60 hover:text-white transition-colors"
                >
                    ✕
                </button>
            </div>
        </div>,
        document.body
    )
}
