'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import Link from 'next/link'

function AuthCallbackContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const supabase = createClient()
    const [errorMsg, setErrorMsg] = useState('')
    const [status, setStatus] = useState('Verificando invitación...')

    useEffect(() => {
        const handleAuth = async () => {
            const hash = window.location.hash

            // 1. Verificar errores en el hash
            if (hash && hash.includes('error=')) {
                const params = new URLSearchParams(hash.substring(1))
                const description = params.get('error_description')
                if (description) {
                    setErrorMsg(description.replace(/\+/g, ' '))
                    return
                }
            }

            // 2. Intentar extracción MANUAL del token (Lo más robusto)
            if (hash && hash.includes('access_token')) {
                setStatus('Estableciendo sesión...')
                const params = new URLSearchParams(hash.substring(1))
                const access_token = params.get('access_token')
                const refresh_token = params.get('refresh_token')

                if (access_token && refresh_token) {
                    const { error } = await supabase.auth.setSession({
                        access_token,
                        refresh_token
                    })

                    if (!error) {
                        const next = searchParams.get('next') || '/update-password'
                        router.push(next)
                        router.refresh()
                        return
                    } else {
                        console.error('Error setting session manually:', error)
                        setErrorMsg(error.message)
                        return
                    }
                }
            }

            // 3. Si no hubo hash, intentar getSession normal (por si acaso ya estaba logueado)
            const { data: { session }, error } = await supabase.auth.getSession()

            if (session) {
                const next = searchParams.get('next') || '/update-password'
                router.push(next)
                router.refresh()
                return
            }

            // 4. Fallback PKCE
            const code = searchParams.get('code')
            if (code) {
                const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
                if (!exchangeError) {
                    const next = searchParams.get('next') || '/update-password'
                    router.push(next)
                    router.refresh()
                    return
                }
            }

            if (!hash && !code && !session) {
                setErrorMsg('Link inválido o expirado.')
            }
        }

        handleAuth()
    }, [router, searchParams, supabase.auth])

    if (errorMsg) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Hubo un problema</h2>
                    <p className="text-gray-600 mb-6">{errorMsg}</p>

                    <Link
                        href="/login"
                        className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-700 transition"
                    >
                        Volver al Login
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                <h2 className="text-xl font-bold text-gray-700">{status}</h2>
                <p className="text-gray-500">Por favor espera un momento.</p>
            </div>
        </div>
    )
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        }>
            <AuthCallbackContent />
        </Suspense>
    )
}
