'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Download, Share, PlusSquare, X } from 'lucide-react'

export function InstallPWA() {
    const [supportsPWA, setSupportsPWA] = useState(false)
    const [promptInstall, setPromptInstall] = useState<any>(null)
    const [isIOS, setIsIOS] = useState(false)
    const [showInstructions, setShowInstructions] = useState(false)
    const [isStandalone, setIsStandalone] = useState(false)

    useEffect(() => {
        // Detectar si ya está instalada (Standalone mode)
        const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone
        setIsStandalone(isStandaloneMode)

        // Detectar iOS
        const userAgent = window.navigator.userAgent.toLowerCase()
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent)
        setIsIOS(isIosDevice)

        // Handler para Android/Desktop (Chrome/Edge)
        const handler = (e: any) => {
            e.preventDefault()
            setSupportsPWA(true)
            setPromptInstall(e)
        }

        window.addEventListener('beforeinstallprompt', handler)

        return () => window.removeEventListener('beforeinstallprompt', handler)
    }, [])

    const handleInstallClick = (e: React.MouseEvent) => {
        e.preventDefault()

        if (isIOS) {
            setShowInstructions(true)
            return
        }

        if (promptInstall) {
            promptInstall.prompt()
        }
    }

    // Si ya está instalada, no mostramos nada
    if (isStandalone) return null

    // Si no es iOS y no soportó PWA (ej. Firefox desktop o ya instalado), no mostramos nada
    if (!isIOS && !supportsPWA) return null

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                onClick={handleInstallClick}
                className="text-orange-500 hover:text-orange-700 hover:bg-orange-50"
                title="Instalar Aplicación"
            >
                <Download className="w-5 h-5" />
            </Button>

            {/* Modal de Instrucciones iOS */}
            {showInstructions && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-sm shadow-xl animate-in slide-in-from-bottom-10 duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Instalar en iPhone/iPad</h3>
                            <button onClick={() => setShowInstructions(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4 text-sm text-gray-600">
                            <p>Para instalar esta aplicación en tu dispositivo:</p>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Share className="w-5 h-5 text-blue-500" />
                                <span>1. Toca el botón <strong>Compartir</strong> en la barra inferior de Safari.</span>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <PlusSquare className="w-5 h-5 text-gray-700" />
                                <span>2. Desliza hacia abajo y selecciona <strong>"Agregar a Inicio"</strong>.</span>
                            </div>
                        </div>

                        <Button
                            fullWidth
                            className="mt-6"
                            onClick={() => setShowInstructions(false)}
                        >
                            Entendido
                        </Button>
                    </div>
                </div>
            )}
        </>
    )
}
