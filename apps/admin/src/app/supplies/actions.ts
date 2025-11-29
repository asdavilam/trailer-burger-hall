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
  const packageCost = parseFloat(formData.get('package_cost') as string) || 0
  const quantityPerPackage = parseFloat(formData.get('quantity_per_package') as string) || 1
  const purchaseUnit = formData.get('purchase_unit') as string
  const minStock = parseFloat(formData.get('min_stock') as string) || 0
  const provider = formData.get('provider') as string
  const brand = formData.get('brand') as string
  const category = formData.get('category') as string

  // Calcular costo unitario automáticamente
  const costPerUnit = quantityPerPackage > 0 ? packageCost / quantityPerPackage : 0

  const { error } = await supabaseAdmin.from('supplies').insert({
    name,
    unit,
    cost_per_unit: costPerUnit,
    package_cost: packageCost,
    quantity_per_package: quantityPerPackage,
    purchase_unit: purchaseUnit || null,
    last_price_check: new Date().toISOString(),
    min_stock: minStock,
    provider: provider || null,
    brand: brand || null,
    category: category || null,
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
  const packageCost = parseFloat(formData.get('package_cost') as string) || 0
  const quantityPerPackage = parseFloat(formData.get('quantity_per_package') as string) || 1
  const purchaseUnit = formData.get('purchase_unit') as string
  const minStock = parseFloat(formData.get('min_stock') as string) || 0
  const provider = formData.get('provider') as string
  const brand = formData.get('brand') as string
  const category = formData.get('category') as string

  // Calcular costo unitario automáticamente
  const costPerUnit = quantityPerPackage > 0 ? packageCost / quantityPerPackage : 0

  const { error } = await supabaseAdmin
    .from('supplies')
    .update({
      name,
      unit,
      cost_per_unit: costPerUnit,
      package_cost: packageCost,
      quantity_per_package: quantityPerPackage,
      purchase_unit: purchaseUnit || null,
      last_price_check: new Date().toISOString(), // Actualizar fecha de verificación
      min_stock: minStock,
      provider: provider || null,
      brand: brand || null,
      category: category || null
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

// 5. AJUSTE RÁPIDO DE STOCK (con registro en inventory_logs)
export async function adjustStock(supplyId: string, newStock: number, reason: string) {
  const supabase = await createClient()

  // 1. Obtener el stock actual y el usuario
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Usuario no autenticado' }

  const { data: supply } = await supabaseAdmin
    .from('supplies')
    .select('current_stock, name')
    .eq('id', supplyId)
    .single()

  if (!supply) return { error: 'Insumo no encontrado' }

  const oldStock = supply.current_stock || 0
  const changeAmount = newStock - oldStock

  // 2. Actualizar el stock
  const { error: updateError } = await supabaseAdmin
    .from('supplies')
    .update({ current_stock: newStock })
    .eq('id', supplyId)

  if (updateError) return { error: updateError.message }

  // 3. Registrar en inventory_logs
  const { error: logError } = await supabaseAdmin
    .from('inventory_logs')
    .insert({
      supply_id: supplyId,
      user_id: user.id,
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      initial_stock: oldStock,
      entries: changeAmount > 0 ? changeAmount : 0,
      exits: changeAmount < 0 ? Math.abs(changeAmount) : 0,
      final_count: newStock,
      comments: reason ? `Ajuste rápido: ${reason}` : `Ajuste rápido: ${oldStock} → ${newStock}`
    })

  if (logError) {
    console.error('Error logging inventory change:', logError)
    return { error: `Stock actualizado pero no se pudo registrar en historial: ${logError.message}` }
  }

  revalidatePath('/supplies')
  revalidatePath('/supplies/history')
  return { success: true }
}

// 6. CONFIRMAR PRECIO VIGENTE (actualizar solo last_price_check)
export async function confirmPriceValid(supplyId: string) {
  const { error } = await supabaseAdmin
    .from('supplies')
    .update({ last_price_check: new Date().toISOString() })
    .eq('id', supplyId)

  if (error) return { error: error.message }

  revalidatePath('/supplies')
  return { success: true }
}