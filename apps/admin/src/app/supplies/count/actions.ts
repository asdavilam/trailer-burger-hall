// apps/admin/src/app/supplies/count/actions.ts
'use server'

import { createClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin' // 👈 IMPORTANTE
import { revalidatePath } from 'next/cache'

// 1. Obtener lo que me toca contar hoy (Esto sigue igual, lectura normal)
export async function getMyAssignments() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('inventory_assignments')
    .select(`
      supply_id,
      supplies (
        id,
        name,
        unit,
        current_stock
      )
    `)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error fetching my count list:', error)
    return []
  }

  return data.map((item: any) => ({
    assignment_id: item.supply_id,
    ...item.supplies
  }))
}

// 2. Guardar el conteo
export async function submitDailyCount(counts: Record<string, number>, comments?: string, date?: string) {
  // A. Verificamos identidad con el cliente normal (Seguridad)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  // Usamos la fecha enviada por el cliente (Local) o fallback a UTC
  const logDate = date || new Date().toISOString().split('T')[0]
  const updates = []

  // B. Usamos la Llave Maestra para escribir (Saltamos RLS)
  // Porque confiamos en que esta función validó al usuario arriba.
  for (const [supplyId, finalCount] of Object.entries(counts)) {

    // 1. Leemos el stock actual para calcular diferencias
    // (Podemos usar supabaseAdmin para asegurar lectura consistente)
    const { data: supply } = await supabaseAdmin
      .from('supplies')
      .select('current_stock')
      .eq('id', supplyId)
      .single()

    const currentStock = supply?.current_stock || 0

    // 2. Insertamos el LOG
    updates.push(
      supabaseAdmin.from('inventory_logs').insert({
        date: logDate,
        supply_id: supplyId,
        user_id: user.id,
        initial_stock: currentStock,
        final_count: finalCount,
        exits: currentStock > finalCount ? (currentStock - finalCount) : 0,
        entries: finalCount > currentStock ? (finalCount - currentStock) : 0,
        comments: comments || null
      })
      // Agregamos 'upsert' por si corrigen el conteo el mismo día
      // .select() no es necesario aquí
    )

    // 3. Actualizamos el STOCK MAESTRO
    updates.push(
      supabaseAdmin.from('supplies')
        .update({ current_stock: finalCount })
        .eq('id', supplyId)
    )
  }

  try {
    // Ejecutamos todas las promesas y verificamos si hubo error
    const results = await Promise.all(updates)

    // Verificar si alguna falló (Supabase devuelve { error } en lugar de lanzar excepción)
    const errors = results.filter(r => r.error)
    if (errors.length > 0) {
      console.error('Errores al guardar:', errors)
      return { error: 'Hubo un error guardando algunos datos.' }
    }

    revalidatePath('/supplies')
    revalidatePath('/supplies/count')
    return { success: true }
  } catch (err) {
    console.error('Error crítico:', err)
    return { error: 'Error de conexión con la base de datos.' }
  }
}