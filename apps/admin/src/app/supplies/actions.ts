// apps/admin/src/app/supplies/actions.ts
'use server'

import { createClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { Supply, SupplyUnit } from '@trailer/shared'
import { revalidatePath } from 'next/cache'

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

// CREAR INSUMO
export async function createSupply(formData: FormData) {
  const name = formData.get('name') as string
  const unit = formData.get('unit') as SupplyUnit
  const cost = parseFloat(formData.get('cost') as string) || 0
  const minStock = parseFloat(formData.get('min_stock') as string) || 0
  const provider = formData.get('provider') as string

  const { error } = await supabaseAdmin.from('supplies').insert({
    name,
    unit,
    cost_per_unit: cost,
    min_stock: minStock,
    provider,
    current_stock: 0 // Empieza en 0
  })

  if (error) return { error: error.message }
  revalidatePath('/supplies')
  return { success: true }
}

// EDITAR INSUMO
export async function updateSupply(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const unit = formData.get('unit') as SupplyUnit
  const cost = parseFloat(formData.get('cost') as string) || 0
  const minStock = parseFloat(formData.get('min_stock') as string) || 0
  const provider = formData.get('provider') as string

  const { error } = await supabaseAdmin
    .from('supplies')
    .update({
      name,
      unit,
      cost_per_unit: cost,
      min_stock: minStock,
      provider
    })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/supplies')
  return { success: true }
}

// BORRAR INSUMO (Opcional, cuidado con integridad referencial)
export async function deleteSupply(id: string) {
  const { error } = await supabaseAdmin.from('supplies').delete().eq('id', id)
  if (error) return { error: 'No se puede borrar: Probablemente esté en uso en una receta.' }
  revalidatePath('/supplies')
  return { success: true }
}