// apps/admin/src/app/supplies/actions.ts
'use server'

import { createClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { Supply, SupplyUnit, SupplyType } from '@trailer/shared'
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
  const supplyType = (formData.get('supply_type') as SupplyType) || 'purchase'
  const minStock = parseFloat(formData.get('min_stock') as string) || 0
  const category = formData.get('category') as string
  const yieldQuantity = parseFloat(formData.get('yield_quantity') as string) || 1
  const shrinkagePercent = parseFloat(formData.get('shrinkage_percent') as string) || 0

  let costPerUnit = 0
  let packageCost = 0
  let quantityPerPackage = 1
  let purchaseUnit = null
  let provider = null
  let brand = null

  if (supplyType === 'purchase') {
    packageCost = parseFloat(formData.get('package_cost') as string) || 0
    quantityPerPackage = parseFloat(formData.get('quantity_per_package') as string) || 1
    purchaseUnit = formData.get('purchase_unit') as string
    provider = formData.get('provider') as string
    brand = formData.get('brand') as string

    // Calcular costo unitario automáticamente
    costPerUnit = quantityPerPackage > 0 ? packageCost / quantityPerPackage : 0
  } else {
    // Producción Interna
    // Si es nuevo, el costo empieza en 0 o lo que pongan manual, luego se recalcula con ingredientes
    costPerUnit = parseFloat(formData.get('manual_cost') as string) || 0
  }

  const { error } = await supabaseAdmin.from('supplies').insert({
    name,
    unit,
    supply_type: supplyType,
    cost_per_unit: costPerUnit,
    package_cost: packageCost,
    quantity_per_package: quantityPerPackage,
    purchase_unit: purchaseUnit,
    last_price_check: new Date().toISOString(),
    min_stock: minStock,
    provider: provider,
    brand: brand,
    category: category || null,
    yield_quantity: yieldQuantity,
    shrinkage_percent: shrinkagePercent,
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
  const supplyType = (formData.get('supply_type') as SupplyType) || 'purchase'
  const minStock = parseFloat(formData.get('min_stock') as string) || 0
  const category = formData.get('category') as string
  const yieldQuantity = parseFloat(formData.get('yield_quantity') as string) || 1
  const shrinkagePercent = parseFloat(formData.get('shrinkage_percent') as string) || 0

  let costPerUnit = 0
  let packageCost = 0
  let quantityPerPackage = 1
  let purchaseUnit = null
  let provider = null
  let brand = null

  // Recuperar el costo actual si no se recalculó, o confiar en el recálculo posterior
  // Para simplificar: Si es compra, calculamos. Si es producción, mantenemos el que tiene (o manual si se envía)
  // PERO si cambiamos el Yield, deberíamos recalcular el costo de producción.

  if (supplyType === 'purchase') {
    packageCost = parseFloat(formData.get('package_cost') as string) || 0
    quantityPerPackage = parseFloat(formData.get('quantity_per_package') as string) || 1
    purchaseUnit = formData.get('purchase_unit') as string
    provider = formData.get('provider') as string
    brand = formData.get('brand') as string

    costPerUnit = quantityPerPackage > 0 ? packageCost / quantityPerPackage : 0
  } else {
    // Producción: Si enviaron manual_cost, úsalo. Si no, intenta recalcular o mantener.
    // Lo ideal es que al guardar Yield, se dispare un recálculo.
    // Por ahora, si viene manual_cost lo usamos (para compatibilidad), si no, no lo tocamos aquí (se actualiza vía ingredientes)
    // Sin embargo, updateSupply DEBE poder actualizar el yield.
    const manualCost = parseFloat(formData.get('manual_cost') as string)
    if (!isNaN(manualCost)) {
      costPerUnit = manualCost
    } else {
      // Si no viene manual cost, tal vez deberíamos leer el actual de la BD, pero update requiere pasar el valor.
      // Asumiremos que el cliente manda el costo actual si no quiere cambiarlo.
      // O mejor: recalculamos aquí mismo si es producción.
      costPerUnit = await calculateProductionCost(id, yieldQuantity)
    }
  }

  const { error } = await supabaseAdmin
    .from('supplies')
    .update({
      name,
      unit,
      supply_type: supplyType,
      cost_per_unit: costPerUnit,
      package_cost: packageCost,
      quantity_per_package: quantityPerPackage,
      purchase_unit: purchaseUnit,
      last_price_check: new Date().toISOString(), // Actualizar fecha de verificación
      min_stock: minStock,
      provider: provider,
      brand: brand,
      category: category || null,
      yield_quantity: yieldQuantity,
      shrinkage_percent: shrinkagePercent
    })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/supplies')
  return { success: true }
}

// --- GESTIÓN DE SUB-RECETAS (INGREDIENTES DE INSUMOS) ---

async function calculateProductionCost(supplyId: string, yieldQty: number): Promise<number> {
  // 1. Obtener ingredientes
  const { data: ingredients } = await supabaseAdmin
    .from('supply_ingredients')
    .select('quantity, child_supply:supplies!supply_ingredients_child_supply_id_fkey(cost_per_unit, shrinkage_percent)')
    .eq('parent_supply_id', supplyId)

  if (!ingredients || ingredients.length === 0) return 0

  // 2. Sumar costos (Costo Insumo * Cantidad Usada)
  const totalCost = ingredients.reduce((sum, item: any) => {
    const cost = item.child_supply?.cost_per_unit || 0
    return sum + (cost * item.quantity)
  }, 0)

  // 3. Dividir por rendimiento
  return yieldQty > 0 ? totalCost / yieldQty : 0
}

export async function getSupplyIngredients(supplyId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('supply_ingredients')
    .select('*, child_supply:supplies!supply_ingredients_child_supply_id_fkey(*)')
    .eq('parent_supply_id', supplyId)

  if (error) {
    console.error('Error fetching ingredients:', error)
    return []
  }

  return data || []
}

export async function addSupplyIngredient(parentSupplyId: string, childSupplyId: string, quantity: number) {
  console.log(`Adding ingredient: Parent=${parentSupplyId}, Child=${childSupplyId}, Qty=${quantity}`)

  const { error } = await supabaseAdmin
    .from('supply_ingredients')
    .insert({
      parent_supply_id: parentSupplyId,
      child_supply_id: childSupplyId,
      quantity: quantity
    })

  if (error) {
    console.error('Error adding ingredient:', error)
    return { error: error.message }
  }

  // Recalcular costo del padre
  await triggerCostRecalculation(parentSupplyId)

  revalidatePath('/supplies')
  return { success: true }
}

export async function removeSupplyIngredient(ingredientId: string, parentSupplyId: string) {
  const { error } = await supabaseAdmin
    .from('supply_ingredients')
    .delete()
    .eq('id', ingredientId)

  if (error) return { error: error.message }

  // Recalcular costo del padre
  await triggerCostRecalculation(parentSupplyId)

  revalidatePath('/supplies')
  return { success: true }
}

async function triggerCostRecalculation(supplyId: string) {
  // 1. Obtener yield actual
  const { data: supply } = await supabaseAdmin
    .from('supplies')
    .select('yield_quantity')
    .eq('id', supplyId)
    .single()

  if (!supply) return

  // 2. Calcular nuevo costo
  const newCost = await calculateProductionCost(supplyId, supply.yield_quantity || 1)

  // 3. Actualizar
  await supabaseAdmin
    .from('supplies')
    .update({ cost_per_unit: newCost })
    .eq('id', supplyId)
}

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

  // 1.5 Borrar ingredientes donde este insumo sea padre (cascade debería encargarse, pero por si acaso)
  // Y verificar si es hijo en otro lado (RESTRICT en BD lo impedirá)

  // 2. Ahora sí borramos el insumo
  const { error } = await supabaseAdmin.from('supplies').delete().eq('id', id)

  if (error) {
    // Si falla aquí, puede ser por otra tabla (ej. recetas/ingredientes)
    if (error.code === '23503') {
      return { error: 'No se puede borrar: Este insumo se usa en una Receta o Sub-receta.' }
    }
    return { error: `Error al borrar: ${error.message}` }
  }

  revalidatePath('/supplies')
  return { success: true }
}

// 4. REGISTRAR COMPRA (Aumentar Stock)
export async function addStock(supplyId: string, quantity: number) {
  const supabase = await createClient()

  // 1. Obtener usuario actual
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Usuario no autenticado' }

  // 2. Obtener stock actual
  const { data: item } = await supabaseAdmin
    .from('supplies')
    .select('current_stock')
    .eq('id', supplyId)
    .single()

  if (!item) return { error: 'Insumo no encontrado' }

  const oldStock = item.current_stock || 0
  const newStock = oldStock + quantity

  // 3. Actualizar stock
  const { error } = await supabaseAdmin
    .from('supplies')
    .update({ current_stock: newStock })
    .eq('id', supplyId)

  if (error) return { error: error.message }

  // 4. Registrar en inventory_logs
  const { error: logError } = await supabaseAdmin
    .from('inventory_logs')
    .insert({
      supply_id: supplyId,
      user_id: user.id,
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      initial_stock: oldStock,
      entries: quantity,
      exits: 0,
      final_count: newStock,
      comments: 'Compra rápida desde Shopping List'
    })

  if (logError) {
    console.error('Error logging purchase:', logError)
    // No fallamos la request completa si solo falló el log, pero es bueno saberlo
  }

  revalidatePath('/supplies')
  revalidatePath('/supplies/shopping-list')
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