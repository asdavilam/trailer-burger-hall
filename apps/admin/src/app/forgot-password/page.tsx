'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import Link from 'next/link'
import Image from 'next/image'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const supabase = createClient()

    const validateEmail = (email: string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return regex.test(email)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        if (!validateEmail(email)) {
            setMessage({ type: 'error', text: 'Por favor ingresa un correo electrónico válido' })
            setLoading(false)
            return
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
        })

        if (error) {
            setMessage({ type: 'error', text: error.message })
        } else {
            setMessage({
                type: 'success',
                text: 'Si el correo existe, recibirás un enlace para restablecer tu contraseña.'
            })
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#3B1F1A] p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header with Logo */}
                <div className="bg-[#2A1512] p-8 flex flex-col items-center justify-center border-b-4 border-[#C08A3E]">
                    <div className="relative w-24 h-24 mb-4">
                        <Image
                            src="/icons/LOGO_TBH.png"
                            alt="Trailer Burger Hall Logo"
                            fill
                            sizes="96px"
                            className="object-contain"
                            priority
                        />
                    </div>
                    <h1 className="text-[#C08A3E] font-display text-xl font-bold tracking-wider uppercase">
                        Recuperar Contraseña
                    </h1>
                </div>

                {/* Form Section */}
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {message && (
                            <div className={`p-4 text-sm rounded-lg border flex items-center gap-2 ${message.type === 'success'
                                ? 'text-green-700 bg-green-50 border-green-200'
                                : 'text-red-700 bg-red-50 border-red-200'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="email">
                                Correo Electrónico
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#C08A3E] focus:border-[#C08A3E] outline-none transition-all bg-gray-50 focus:bg-white"
                                placeholder="admin@trailer.com"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#6B8E62] hover:bg-[#5a7a52] text-white font-bold py-3.5 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Enviando...' : 'Enviar Enlace'}
                        </button>

                        <div className="text-center">
                            <Link href="/login" className="text-sm text-[#C08A3E] hover:underline font-medium">
                                Volver al inicio de sesión
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
