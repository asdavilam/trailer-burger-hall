// apps/admin/src/app/supplies/count/actions.ts
'use server'

import { createClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin' // 👈 IMPORTANTE
import { revalidatePath } from 'next/cache'

// 1. Obtener lo que me toca contar hoy (Esto sigue igual, lectura normal)
// 1. Obtener lo que me toca contar hoy
export async function getTodayDateHeader() {
  const timeZone = 'America/Mexico_City'
  const now = new Date()
  const mexicoDateStr = now.toLocaleString('en-US', { timeZone })
  const today = new Date(mexicoDateStr)

  // Format: "Domingo, 7 de diciembre de 2025"
  return today.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

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
        current_stock,
        counting_mode,
        quantity_per_package,
        abc_classification,
        average_weight
      )
    `)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error fetching my count list:', error)
    return []
  }

  // Obtener la última fecha de conteo para cada insumo
  const supplyIds = data.map((item: any) => item.supply_id)
  const { data: lastLogs } = await supabase
    .from('inventory_logs')
    .select('supply_id, date')
    .in('supply_id', supplyIds)
    .order('date', { ascending: false })

  // Crear un mapa de supply_id -> última fecha
  const lastCountMap: Record<string, string> = {}
  lastLogs?.forEach((log: any) => {
    if (!lastCountMap[log.supply_id]) {
      lastCountMap[log.supply_id] = log.date
    }
  })

  // Lógica de Filtrado ABC
  // 1. Obtener configuración de días
  const { data: settingsData } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'financial_settings')
    .single()

  const settings = settingsData?.value || {}
  const abcDaysB = settings.abc_days_b || [1, 4] // Default: Lunes, Jueves
  const abcDaysC = settings.abc_days_c || [0]    // Default: Domingo

  // Fix Timezone: Ensure we are working with Mexico City time
  const timeZone = 'America/Mexico_City'
  const now = new Date()
  const mexicoDateStr = now.toLocaleString('en-US', { timeZone })
  const today = new Date(mexicoDateStr)
  const dayOfWeek = today.getDay() // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado

  const isDayForB = abcDaysB.includes(dayOfWeek)
  const isDayForC = abcDaysC.includes(dayOfWeek)

  const filteredData = data.filter((item: any) => {
    const supply = item.supplies
    const classification = supply.abc_classification || 'A' // Default A
    const lastDateStr = lastCountMap[supply.id]

    // Grupo A: Siempre se cuenta (Diario)
    if (classification === 'A') return true

    // Grupo B: Días configurados (Bi-semanal)
    if (classification === 'B') {
      if (isDayForB) return true

      // Staleness check: Si lleva más de 4 días sin contar, forzar aparición
      if (lastDateStr) {
        const lastDate = new Date(lastDateStr + 'T12:00:00')
        const diffTime = today.getTime() - lastDate.getTime()
        const daysSince = Math.floor(diffTime / (1000 * 60 * 60 * 24))
        if (daysSince > 4) return true
      } else {
        return true // Nunca contado
      }
    }

    // Grupo C: Días configurados (Semanal)
    if (classification === 'C') {
      if (isDayForC) return true

      // Staleness check: Si lleva más de 7 días sin contar, forzar aparición
      if (lastDateStr) {
        const lastDate = new Date(lastDateStr + 'T12:00:00')
        const diffTime = today.getTime() - lastDate.getTime()
        const daysSince = Math.floor(diffTime / (1000 * 60 * 60 * 24))
        if (daysSince > 7) return true
      } else {
        return true // Nunca contado
      }
    }

    // Si no cumple nada de lo anterior, se oculta hoy
    return false
  })

  return filteredData.map((item: any) => ({
    assignment_id: item.supply_id,
    ...item.supplies,
    last_count_date: lastCountMap[item.supply_id] || null
  }))
}

// 2. Guardar el conteo
export async function submitDailyCount(
  counts: Record<string, number>,
  comments?: string,
  date?: string,
  force: boolean = false
) {
  // A. Verificamos identidad con el cliente normal (Seguridad)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  // Usamos la fecha enviada por el cliente (Local) o fallback a UTC
  const logDate = date || new Date().toISOString().split('T')[0]
  const updates = []
  const discrepancies: string[] = []

  // B. Validación de Discrepancias (Antes de escribir)
  if (!force) {
    for (const [supplyId, finalCount] of Object.entries(counts)) {
      const { data: supply } = await supabaseAdmin
        .from('supplies')
        .select('current_stock, name')
        .eq('id', supplyId)
        .single()

      if (supply) {
        const currentStock = supply.current_stock || 0
        // Evitar división por cero
        if (currentStock > 0) {
          const diff = Math.abs(finalCount - currentStock)
          const percentageDiff = (diff / currentStock) * 100

          // Tolerancia del 20%
          if (percentageDiff > 20) {
            discrepancies.push(supplyId)
          }
        } else if (finalCount > 0) {
          // Si el stock era 0 y ahora es > 0, también es un cambio drástico si es grande, 
          // pero asumiremos que es una entrada válida. 
          // Podríamos validar si finalCount es muy grande (ej. > 10)
          if (finalCount > 10) discrepancies.push(supplyId)
        }
      }
    }

    if (discrepancies.length > 0) {
      return {
        error: `Se detectaron diferencias inusuales (>20%) en ${discrepancies.length} insumo(s). Por favor verifica tu conteo.`,
        discrepancies
      }
    }
  }

  // C. Escritura en Base de Datos (Si no hay discrepancias o force=true)
  for (const [supplyId, finalCount] of Object.entries(counts)) {

    // 1. Leemos el stock actual para calcular diferencias exactas
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