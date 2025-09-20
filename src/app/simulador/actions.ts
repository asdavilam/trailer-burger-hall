'use server'

import {
  getProteins,
  getFlavors,
  getProteinFlavorDefaults,
  getHouseRules,
  getTorrePrices,
  getPapasItalianasConfig,
} from '@/lib/menu-data'
import { supabaseServer } from '@/lib/supabaseServer'

// ----------------- Tipos auxiliares (sin cambiar lógica) -----------------

type DbProteinRow = {
  id: string
  name?: string | null
  price_base?: number | string | null
  price_normal?: number | string | null
  price_double?: number | string | null
  price_light?: number | string | null
}

type ProteinNormalized = {
  id: string
  name?: string | null
  price_base: number
  price_normal: number
  price_double: number
  price_light: number
}

type FlavorRow = {
  id: string
  name: string
  intensity: 'normal' | 'extremo'
  price_extra?: number | null
}

type FlavorsMapValue = {
  id: string
  name: string
  intensity: 'normal' | 'extremo'
  price_extra: number
}

type HouseRuleEntry = {
  id?: string
  protein_id?: string
  secondary_protein_id?: string
  price?: number | string | null
  includedIds?: string[] | null
  default_flavors_json?: { secondary?: string[] } | null
}

type HouseRuleInput = Record<string, HouseRuleEntry> | HouseRuleEntry[]

type HouseMap = Record<string, { price: number; includedIds: string[] }>

// ----------------- helpers numéricos (coerción robusta) -----------------
function num(v: unknown, fallback = 0): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (v == null) return fallback
  const n = Number(String(v).replace(/[^\d.-]/g, ''))
  return Number.isFinite(n) ? n : fallback
}

// Normaliza una proteína garantizando números para base/double/light
function normalizeProteinRow(row: DbProteinRow): ProteinNormalized {
  const price_normal = num(row.price_normal, 0)
  const price_base = num(row.price_base ?? price_normal, price_normal)
  const price_double = num(row.price_double, price_base)
  const price_light = num(row.price_light, price_base)

  return {
    id: String(row.id),
    name: row.name ?? null,
    price_normal,
    price_base,
    price_double,
    price_light,
  }
}

// Convierte lo que venga de getHouseRules (array u objeto) a mapa por proteinId
function toHouseMapByProteinId(houseRules: HouseRuleInput | null | undefined): Record<string, HouseRuleEntry> {
  if (!houseRules) return {}
  if (Array.isArray(houseRules)) {
    const map: Record<string, HouseRuleEntry> = {}
    for (const r of houseRules) {
      const pid = r.protein_id ?? r.secondary_protein_id ?? r.id
      if (pid) map[String(pid)] = r
    }
    return map
  }
  // ya es un objeto { [proteinId]: rule }
  return houseRules
}

export async function loadMenuDataForSimulator() {
  const [
    proteinsRaw,
    flavors,
    defaultsMap,
    houseRulesRaw,
    torreMap,
    papasCfg,
  ] = await Promise.all([
    getProteins(),
    getFlavors(),
    getProteinFlavorDefaults(),
    getHouseRules(),
    getTorrePrices(),
    getPapasItalianasConfig(),
  ])

  // 1) Traemos explícitamente los campos de precio (por si el select original no los incluye)
  const rawList = (proteinsRaw ?? []) as DbProteinRow[]
  const ids: string[] = rawList.map((p) => p.id).filter(Boolean)
  let hydrated: DbProteinRow[] = rawList

  if (ids.length) {
    const supabase = await supabaseServer()
    const { data: priceRows } = await supabase
      .from('proteins')
      .select('id, price_base, price_normal, price_double, price_light')
      .in('id', ids)

    if (Array.isArray(priceRows)) {
      const priceMap = new Map<
        string,
        Pick<DbProteinRow, 'id' | 'price_base' | 'price_normal' | 'price_double' | 'price_light'>
      >(priceRows.map((r) => [String(r.id), r]))
      hydrated = rawList.map((p) => ({
        ...p,
        ...(priceMap.get(String(p.id)) ?? {}),
      }))
    }
  }

  // 2) Normalizamos a número (evita NaN y caídas a 85 por undefined)
  const proteins = hydrated.map(normalizeProteinRow)

  // 3) Mapa rápido id->flavor para pricing (cliente) y nombre->id para resolver house rules
  const flavorsTyped = (flavors ?? []) as FlavorRow[]
  const flavorsMap: Record<string, FlavorsMapValue> = Object.fromEntries(
    flavorsTyped.map((f) => [
      f.id,
      {
        id: f.id,
        name: f.name,
        intensity: f.intensity,
        price_extra: num(f.price_extra, 0),
      },
    ]),
  )
  const flavorIdByName = new Map<string, string>()
  for (const f of flavorsTyped) flavorIdByName.set(String(f.name).trim().toLowerCase(), f.id)

  // 4) Normalizamos houseMap a { [proteinId]: { price, includedIds[] } } con IDs reales
  const houseMapInput = toHouseMapByProteinId(houseRulesRaw as HouseRuleInput)
  const houseMap: HouseMap = {}

  for (const p of proteins) {
    const pid = p.id
    const pname = String(p.name ?? '').toLowerCase()
    const entry = houseMapInput[pid]
    if (!entry) {
      // No fabricamos "Casa" si no hay regla en BD (ej. Portobello)
      continue
    }

    const price = num(entry.price, 0)

    // 4.1 Nombres desde default_flavors_json.secondary
    const collectedNames: string[] = []
    const sec = entry.default_flavors_json?.secondary
    if (Array.isArray(sec)) collectedNames.push(...sec)

    // 4.2 Reglas adicionales (deduplicadas):
    //     - Res / Pollo: Habanero + Chimi + Mojo
    //     - Camarón / Salmón: Chimi + Mojo + Diabla
    const isResPollo = pname.includes('res') || pname.includes('pollo')
    const isMar =
      pname.includes('camarón') || pname.includes('camaron') ||
      pname.includes('salmón')  || pname.includes('salmon')

    if (isResPollo) collectedNames.push('Habanero', 'Chimi', 'Mojo')
    if (isMar)      collectedNames.push('Chimi', 'Mojo', 'Diabla')

    // 4.3 Si ya venían IDs en includedIds, respétalos y mézclalos
    const includedIdsFromEntry = Array.isArray(entry.includedIds) ? entry.includedIds : []

    // 4.4 Resolver nombres -> IDs y unir con IDs existentes
    const resolvedFromNames = collectedNames
      .map((n) => flavorIdByName.get(String(n).trim().toLowerCase()))
      .filter((x): x is string => Boolean(x))

    const includedIds = Array.from(new Set<string>([...includedIdsFromEntry, ...resolvedFromNames]))

    // Si no hay sabores resolubles y tampoco hay precio, no publiques regla
    if (!includedIds.length && !price) continue

    houseMap[pid] = { price, includedIds }
  }

  return { proteins, flavors, flavorsMap, defaultsMap, houseMap, torreMap, papasCfg }
}