'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const [requirements, setRequirements] = useState({
        length: false,
        uppercase: false,
        number: false,
        special: false
    })

    const checkRequirements = (pass: string) => {
        setRequirements({
            length: pass.length >= 8,
            uppercase: /[A-Z]/.test(pass),
            number: /[0-9]/.test(pass),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(pass)
        })
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setPassword(val)
        checkRequirements(val)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(null)

        if (!requirements.length || !requirements.uppercase || !requirements.number || !requirements.special) {
            setError('La contraseña no cumple con los requisitos de seguridad')
            setLoading(false)
            return
        }

        // eslint-disable-next-line security/detect-possible-timing-attacks
        if (password !== confirm) {
            setError('Las contraseñas no coinciden')
            setLoading(false)
            return
        }

        const { error } = await supabase.auth.updateUser({ password })

        if (error) {
            setError(error.message)
        } else {
            setSuccess('Contraseña actualizada correctamente')
            setTimeout(() => router.push('/'), 2000)
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#3B1F1A] p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
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
                        Actualizar Contraseña
                    </h1>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="p-4 text-sm text-green-700 bg-green-50 rounded-lg border border-green-200">
                                {success}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="password">
                                Nueva Contraseña
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={handlePasswordChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#C08A3E] focus:border-[#C08A3E] outline-none transition-all bg-gray-50 focus:bg-white"
                                placeholder="••••••••"
                                required
                            />
                            {/* Password Strength Indicators */}
                            <div className="mt-3 space-y-2 text-xs text-gray-500">
                                <div className={`flex items-center gap-2 ${requirements.length ? 'text-green-600 font-medium' : ''}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${requirements.length ? 'bg-green-500' : 'bg-gray-300'}`} />
                                    Mínimo 8 caracteres
                                </div>
                                <div className={`flex items-center gap-2 ${requirements.uppercase ? 'text-green-600 font-medium' : ''}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${requirements.uppercase ? 'bg-green-500' : 'bg-gray-300'}`} />
                                    Al menos una mayúscula
                                </div>
                                <div className={`flex items-center gap-2 ${requirements.number ? 'text-green-600 font-medium' : ''}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${requirements.number ? 'bg-green-500' : 'bg-gray-300'}`} />
                                    Al menos un número
                                </div>
                                <div className={`flex items-center gap-2 ${requirements.special ? 'text-green-600 font-medium' : ''}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${requirements.special ? 'bg-green-500' : 'bg-gray-300'}`} />
                                    Al menos un carácter especial (!@#$...)
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="confirm">
                                Confirmar Contraseña
                            </label>
                            <input
                                id="confirm"
                                type="password"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#C08A3E] focus:border-[#C08A3E] outline-none transition-all bg-gray-50 focus:bg-white"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#6B8E62] hover:bg-[#5a7a52] text-white font-bold py-3.5 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
