'use client'

import { useState, useEffect } from 'react'
import { login } from './actions'

interface LoginFormProps {
    initialError?: string
}

export function LoginForm({ initialError }: LoginFormProps) {
    const [error, setError] = useState(initialError)
    const [loading, setLoading] = useState(false)

    // Clear error when user starts typing
    useEffect(() => {
        if (initialError) {
            setError(initialError)
        }
    }, [initialError])

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        setError(undefined)

        try {
            await login(formData)
        } catch (err) {
            // Login action will redirect, so this shouldn't happen
            console.error('Login error:', err)
            setLoading(false)
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div>
                <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                    Correo Electrónico
                </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bronze focus:border-bronze text-lg"
                    placeholder="usuario@trailer.com"
                    onChange={() => setError(undefined)}
                />
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">
                    Contraseña
                </label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bronze focus:border-bronze text-lg"
                    placeholder="••••••••"
                    onChange={() => setError(undefined)}
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-bronze text-white px-6 py-4 rounded-lg font-bold text-lg hover:bg-[#b07a35] transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
        </form>
    )
}
