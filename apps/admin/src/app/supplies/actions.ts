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
// BORRAR INSUMO
export async function deleteSupply(id: string) {
  // 1. Primero borramos el historial (Logs) de este insumo para evitar error de FK
  const { error: logsError } = await supabaseAdmin
    .from('inventory_logs')
    .delete()
    .eq('supply_id', id)

  if (logsError) {
    return { error: `No se pudo borrar el historial: ${logsError.message}` }
  }

  // 2. Ahora sí borramos el insumo
  const { error } = await supabaseAdmin.from('supplies').delete().eq('id', id)

  if (error) {
    // Si falla aquí, puede ser por otra tabla (ej. recetas/ingredientes)
    if (error.code === '23503') {
      return { error: 'No se puede borrar: Este insumo se usa en una Receta (Ingredients).' }
    }
    return { error: `Error al borrar: ${error.message}` }
  }

  revalidatePath('/supplies')
  return { success: true }
}

// 4. REGISTRAR COMPRA (Aumentar Stock)
export async function addStock(supplyId: string, quantity: number) {
  const supabase = await createClient() // Usamos cliente normal o admin según prefieras auditoría

  // 1. Obtener stock actual para sumar (o usar una función RPC de base de datos si hay concurrencia alta)
  // Por simplicidad, leeremos y sumaremos aquí.
  const { data: item } = await supabaseAdmin
    .from('supplies')
    .select('current_stock')
    .eq('id', supplyId)
    .single()

  if (!item) return { error: 'Insumo no encontrado' }

  const newStock = (item.current_stock || 0) + quantity

  const { error } = await supabaseAdmin
    .from('supplies')
    .update({ current_stock: newStock })
    .eq('id', supplyId)

  if (error) return { error: error.message }

  revalidatePath('/supplies')
  revalidatePath('/supplies/shopping-list') // Importante refrescar la lista
  return { success: true }
}