/* eslint-disable @typescript-eslint/no-explicit-any */
// Server utilities para el Menú (Supabase REST - tablas en plural)
import { supabase } from '@/lib/supabaseClient'

export type Protein = {
  id: string
  name: string
  description?: string | null
  available: boolean
  price_base: number
}

export async function getProteins(): Promise<Protein[]> {
  // Orden alfabético; solo lectura pública
  const { data, error } = await supabase
    .from('proteins')
    .select('id,name,description,available,price_base')
    .order('name', { ascending: true })

  if (error) {
    console.error('[menu] getProteins error', error)
    return []
  }
  return data ?? []
}

// (ya existe) import { supabase } from '@/lib/supabaseClient'

export type Flavor = {
  id: string
  name: string
  intensity: 'normal' | 'extremo'
  description?: string | null
  tags: string[] | null
  price_extra: number | null
  available: boolean
}

// Obtiene todos los sabores (independientes de la proteína)
// Si más adelante necesitas mapear por proteína, cambiamos esta consulta o añadimos una tabla pivote.
export async function getFlavors(): Promise<Flavor[]> {
  const { data, error } = await supabase
    .from('flavors') // Tabla: 'flavors' (plural, como en el esquema)
    .select('id,name,intensity,description,tags,price_extra,available')
    .order('name', { ascending: true })

  if (error) {
    console.error('[menu] getFlavors error', error)
    return []
  }
  return data ?? []
}

export type Extra = {
  id: string
  name: string
  description?: string | null
  price: number
  available: boolean
}

export async function getExtras(): Promise<Extra[]> {
  const { data, error } = await supabase
    .from('extras') // Tabla: 'extras' (plural, como en el esquema)
    .select('id,name,description,price,available')
    .order('name', { ascending: true })

  if (error) {
    console.error('[menu] getExtras error', error)
    return []
  }
  return data ?? []
}

// ----------------------------
// Defaults por proteína
// ----------------------------
export async function getProteinFlavorDefaults(): Promise<Record<string, string[]>> {
  const { data, error } = await supabase
    .from('protein_flavor_defaults')
    .select('protein_id,flavor_id')

  if (error) {
    console.error('[menu] getProteinFlavorDefaults error', error)
    return {}
  }
  const map: Record<string, string[]> = {}
  for (const row of data ?? []) {
    if (!map[row.protein_id]) map[row.protein_id] = []
    map[row.protein_id].push(row.flavor_id)
  }
  return map
}

// ----------------------------
// Reglas de la Casa (precios fijos e incluidos)
// ----------------------------
export type HouseRuleEntry = {
  price: number
  includedIds: string[]
}

export async function getHouseRules(): Promise<Record<string, HouseRuleEntry>> {
  const { data, error } = await supabase
    .from('house_rules')
    .select('secondary_protein_id,price,default_flavors_json')

  if (error) {
    console.error('[menu] getHouseRules error', error)
    return {}
  }

  const map: Record<string, HouseRuleEntry> = {}
  for (const row of data ?? []) {
    // default_flavors_json puede venir como {secondary:[...]} o como array simple
    let included: string[] = []
    const j = row.default_flavors_json as any
    if (j) {
      if (Array.isArray(j?.secondary)) included = j.secondary as string[]
      else if (Array.isArray(j)) included = j as string[]
    }
    map[row.secondary_protein_id] = { price: row.price, includedIds: included }
  }
  return map
}

// ----------------------------
// Torre Pizza / Torre Doble (precios)
// ----------------------------
export async function getTorrePrices(): Promise<Record<string, number>> {
  // 1) obtener ids de productos Torre
  const { data: products, error: e1 } = await supabase
    .from('products')
    .select('id,name,type')
    .in('name', ['Torre Pizza', 'Torre Doble'])
    .eq('type', 'burger')

  if (e1) {
    console.error('[menu] getTorrePrices products error', e1)
    return {}
  }

  const ids = (products ?? []).map((p) => p.id)
  if (!ids.length) return {}

  // 2) traer precios "unique" de product_prices
  const { data: prices, error: e2 } = await supabase
    .from('product_prices')
    .select('product_id,price,variant')
    .in('product_id', ids)

  if (e2) {
    console.error('[menu] getTorrePrices prices error', e2)
    return {}
  }

  const map: Record<string, number> = {}
  for (const p of products ?? []) {
    const price = prices?.find((x) => x.product_id === p.id)?.price ?? null
    if (price != null) map[p.name] = price
  }
  return map
}

// ----------------------------
// Papas Italianas (configuración)
// ----------------------------
export type PapasConfig = {
  basePrice: number
  allowFlavors: boolean
  flavorExtraNormal: number // 5; Extremo se toma de price_extra del sabor
}

export async function getPapasItalianasConfig(): Promise<PapasConfig | null> {
  const { data: prod, error: e1 } = await supabase
    .from('products')
    .select('id')
    .eq('name', 'Papas Italianas')
    .eq('type', 'side')
    .single()

  if (e1) {
    console.error('[menu] getPapasItalianasConfig product error', e1)
    return null
  }

  const { data: price, error: e2 } = await supabase
    .from('product_prices')
    .select('price')
    .eq('product_id', prod.id)
    .single()

  if (e2) {
    console.error('[menu] getPapasItalianasConfig price error', e2)
    return null
  }

  const { data: rule, error: e3 } = await supabase
    .from('sides_rules')
    .select('allow_flavors,flavor_extra_price')
    .eq('product_id', prod.id)
    .single()

  if (e3) {
    console.error('[menu] getPapasItalianasConfig rule error', e3)
    return null
  }

  return {
    basePrice: price.price,
    allowFlavors: rule.allow_flavors,
    flavorExtraNormal: rule.flavor_extra_price,
  }
}
