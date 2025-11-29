'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres')
            return
        }

        if (password !== confirm) {
            setError('Las contraseñas no coinciden')
            return
        }

        setLoading(true)

        const { error } = await supabase.auth.updateUser({
            password: password
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            // Éxito, redirigir al home
            router.push('/')
            router.refresh()
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Establecer Contraseña</h1>
                    <p className="text-gray-500 mt-2">Ingresa tu nueva contraseña para acceder.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Nueva Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                            placeholder="••••••"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Confirmar Contraseña</label>
                        <input
                            type="password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            required
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                            placeholder="••••••"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Guardando...' : 'Establecer Contraseña'}
                    </button>
                </form>
            </div>
        </div>
    )
}
