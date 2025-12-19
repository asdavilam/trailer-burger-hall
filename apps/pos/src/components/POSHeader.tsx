'use client'

import { ShoppingCart, LogOut, Clock } from "lucide-react"
import { logout } from "@/app/login/actions"
import { useState } from "react"

interface POSHeaderProps {
    userEmail?: string
    userName?: string | null
}

export function POSHeader({ userEmail, userName }: POSHeaderProps) {
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const handleLogout = async () => {
        setIsLoggingOut(true)
        try {
            await logout()
        } catch (err) {
            console.error('Logout error:', err)
            setIsLoggingOut(false)
        }
    }

    return (
        <header className="bg-espresso text-white shadow-lg">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <ShoppingCart className="w-10 h-10" />
                    <div>
                        <h1 className="text-2xl font-bold font-display">Trailer Burger Hall</h1>
                        <p className="text-sm text-bronze">Sistema POS</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* User Info */}
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium">{userName || userEmail}</p>
                        <p className="text-xs text-bronze flex items-center gap-1 justify-end">
                            <Clock className="w-4 h-4" />
                            {new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="btn-touch btn-outline flex items-center gap-2 min-h-[48px] px-4 py-2 bg-white/10 hover:bg-white/20 border-white/30 text-white disabled:opacity-50"
                        title="Cerrar Sesión"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="hidden sm:inline">Salir</span>
                    </button>
                </div>
            </div>
        </header>
    )
}
