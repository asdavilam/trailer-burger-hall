// apps/admin/src/app/supplies/history/actions.ts
'use server'

import { createClient } from '@/lib/supabase'

export async function getInventoryLogs(date?: string) {
  const supabase = await createClient()

  // Si no hay fecha, usamos hoy
  const queryDate = date || new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('inventory_logs')
    .select(`
      *,
      supplies (name, unit),
      user_profiles (display_name, email)
    `)
    .eq('date', queryDate)
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
    return []
  }

  return data
}