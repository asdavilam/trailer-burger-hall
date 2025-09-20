'use client'

import { Suspense, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabaseBrowser'

/**
 * Wrapper que coloca un Suspense boundary alrededor del componente
 * que usa useSearchParams().
 */
export default function AdminLoginPage() {
  return (
    <section className="max-w-md mx-auto card">
      <h1 className="font-display text-2xl mb-4">Iniciar sesión</h1>

      <Suspense fallback={<div>Cargando…</div>}>
        <LoginFormInner />
      </Suspense>
    </section>
  )
}

/**
 * Este componente SÍ usa useSearchParams() y por eso debe vivir
 * dentro de un <Suspense>.
 */
function LoginFormInner() {
  const router = useRouter()
  const sp = useSearchParams()
  const next = sp.get('next') || '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    const supabase = supabaseBrowser()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setErr(error.message || 'Error al iniciar sesión')
      return
    }
    // refresca el árbol y redirige
    startTransition(() => {
      router.replace(next)
      router.refresh()
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          className="w-full rounded-xl border px-3 py-2"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="admin@tudominio.com"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="password">Contraseña</label>
        <input
          id="password"
          type="password"
          className="w-full rounded-xl border px-3 py-2"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
      </div>

      {err && <p className="text-[--danger] text-sm">{err}</p>}

      <button type="submit" className="btn-cta" disabled={isPending}>
        {isPending ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  )
}