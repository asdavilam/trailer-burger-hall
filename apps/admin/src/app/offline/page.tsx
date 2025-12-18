'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OfflinePage() {
    const router = useRouter()
    const [isOnline, setIsOnline] = useState(false)

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true)
        }

        window.addEventListener('online', handleOnline)
        setIsOnline(navigator.onLine)

        return () => {
            window.removeEventListener('online', handleOnline)
        }
    }, [])

    const handleRetry = () => {
        if (navigator.onLine) {
            router.back()
        } else {
            window.location.reload()
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f6f1e7] to-[#ebe6da] flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
                {/* Icon */}
                <div className="mb-6">
                    <div className="w-24 h-24 mx-auto bg-[#fff8f0] rounded-full flex items-center justify-center">
                        <svg
                            className="w-12 h-12 text-[#c08a3e]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
                            />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-display font-bold text-[#3b1f1a] mb-3">
                    Sin Conexión
                </h1>

                {/* Message */}
                <p className="text-[#3b1f1a]/70 mb-6 font-sans">
                    {isOnline
                        ? '¡Conexión restaurada! Puedes continuar trabajando.'
                        : 'No hay conexión a internet. Tus datos están guardados de forma segura y podrás continuar cuando se restablezca la conexión.'}
                </p>

                {/* Status Indicator */}
                <div className="mb-6 p-4 rounded-xl bg-[#f6f1e7] border border-[#e5e0d4]">
                    <div className="flex items-center justify-center gap-2">
                        <div
                            className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-[#c08a3e]'
                                }`}
                        />
                        <span className="text-sm font-bold text-[#3b1f1a]">
                            {isOnline ? 'En línea' : 'Sin conexión'}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={handleRetry}
                        className={`w-full py-3 px-6 rounded-xl font-bold font-sans transition-all shadow-lg ${isOnline
                                ? 'bg-[#6b8e62] text-white hover:bg-[#5a7a52] shadow-[#6b8e62]/30'
                                : 'bg-[#c08a3e] text-white hover:bg-[#a67633] shadow-[#c08a3e]/30'
                            }`}
                    >
                        {isOnline ? 'Continuar' : 'Reintentar'}
                    </button>

                    <button
                        onClick={() => router.push('/')}
                        className="w-full py-3 px-6 rounded-xl font-bold font-sans bg-white text-[#3b1f1a] border-2 border-[#e5e0d4] hover:bg-[#f6f1e7] transition-all"
                    >
                        Ir al Inicio
                    </button>
                </div>

                {/* Info */}
                <div className="mt-6 pt-6 border-t border-[#e5e0d4]">
                    <p className="text-xs text-[#3b1f1a]/50 font-sans">
                        💡 Los datos de formularios se guardan automáticamente en tu dispositivo
                    </p>
                </div>
            </div>
        </div>
    )
}
