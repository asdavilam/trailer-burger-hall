// src/lib/auth.ts
import { redirect } from 'next/navigation'
import { supabaseServer } from './supabaseServer'

type AppMetadata = { role?: string }

function readRole(meta: unknown): string | null {
  if (meta && typeof meta === 'object' && 'role' in meta) {
    const r = (meta as AppMetadata).role
    return typeof r === 'string' ? r : null
  }
  return null
}

export async function getSessionUser() {
  const supabase = await supabaseServer()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) return null
  return data.user
}

export async function requireAdmin(nextPath: string = '/admin') {
  const user = await getSessionUser()
  if (!user) {
    // sin sesión → al login, con parámetro next
    redirect(`/admin/login?next=${encodeURIComponent(nextPath)}`)
  }

  const role = readRole(user.app_metadata)
  if (role !== 'admin') {
    // con sesión pero sin rol admin → fuera (home, por ejemplo)
    redirect('/')
  }

  return user
}