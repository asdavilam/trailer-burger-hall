'use client'

import { useState } from 'react'
import { login } from './actions'
import { InstallPWA } from '@/components/InstallPWA'

export function LoginForm({ initialError }: { initialError?: string }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [emailError, setEmailError] = useState('')
    const [loading, setLoading] = useState(false)

    const validateEmail = (email: string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return regex.test(email)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        // Permitimos que el formulario se envíe al server action, pero validamos antes
        if (!validateEmail(email)) {
            e.preventDefault()
            setEmailError('Por favor ingresa un correo electrónico válido')
            return
        }
        setEmailError('')
        setLoading(true)
        // El formulario continuará su envío normal al action="login"
    }

    return (
        <form action={login} onSubmit={handleSubmit} className="space-y-6">
            {initialError && (
                <div className="p-4 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {initialError}
                </div>
            )}

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="email">
                    Correo Electrónico
                </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value)
                        if (emailError) setEmailError('')
                    }}
                    className={`w-full px-4 py-3 rounded-lg border focus:ring-2 outline-none transition-all bg-gray-50 focus:bg-white ${emailError
                            ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                            : 'border-gray-300 focus:ring-[#C08A3E] focus:border-[#C08A3E]'
                        }`}
                    placeholder="admin@trailer.com"
                    required
                />
                {emailError && (
                    <p className="mt-1 text-xs text-red-600 font-medium">{emailError}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="password">
                    Contraseña
                </label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#C08A3E] focus:border-[#C08A3E] outline-none transition-all bg-gray-50 focus:bg-white"
                    placeholder="••••••••"
                    required
                />
            </div>

            <div className="flex justify-end">
                <a href="/forgot-password" className="text-sm text-[#C08A3E] hover:underline font-medium">
                    ¿Olvidaste tu contraseña?
                </a>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#6B8E62] hover:bg-[#5a7a52] text-white font-bold py-3.5 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
            </button>
        </form>
    )
}
