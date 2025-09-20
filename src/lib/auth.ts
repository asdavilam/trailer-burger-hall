import { redirect } from 'next/navigation'
import { supabaseServer } from './supabaseServer'

type AppMetadata = {
  role?: string
  [key: string]: unknown
}

export async function getSessionUser() {
  const supabase = await supabaseServer()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) return null
  return data.user
}

export async function requireAdmin() {
  const user = await getSessionUser()
  if (!user) {
    // sin sesión → al login, con parámetro next
    redirect('/admin/login?next=/admin')
  }

  const role = (user.app_metadata as AppMetadata)?.role
  if (role !== 'admin') {
    // con sesión pero sin rol admin → fuera (home, por ejemplo)
    redirect('/')
  }

  return user
}