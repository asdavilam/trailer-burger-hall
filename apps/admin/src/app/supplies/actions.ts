// apps/admin/src/app/supplies/actions.ts
'use server'

import { createClient } from '@/lib/supabase'
import { Supply } from '@trailer/shared'

export async function getSupplies() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('supplies')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching supplies:', error)
    return []
  }

  return data as Supply[]
}