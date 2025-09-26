// src/lib/menu-dal.ts
import { supabaseServer } from './supabaseServer'
import type { MenuSection, MenuItem, MenuPrice } from '@/app/menu/types'
import { MENU_SECTIONS } from '@/lib/menu-schema' // usamos tu schema para TODO excepto 'sabores'

/** Filas reales de la tabla flavors */
type FlavorRow = {
  id: string
  name: string
  intensity: 'normal' | 'extremo' | null
  description: string | null
  tags: string[] | null
  price_extra: number | null
  available: boolean | null
}

/* Helpers */
const safeBool = (v: unknown, d = true): boolean => (typeof v === 'boolean' ? v : d)
const safeNum = (v: unknown, d = 0): number =>
  typeof v === 'number' && Number.isFinite(v) ? v : d

/** Lee los sabores desde Supabase */
async function fetchFlavors(): Promise<FlavorRow[]> {
  const supabase = await supabaseServer()
  const { data, error } = await supabase
    .from('flavors')
    .select('id,name,intensity,description,tags,price_extra,available')
    .order('name', { ascending: true })

  if (error) {
    console.warn('[menu-dal] fetchFlavors warn:', error.message)
    return []
  }
  return (data ?? []) as FlavorRow[]
}

/**
 * Construye el MenuSection[] híbrido:
 * - Sección 'sabores' viene de BD
 * - Todas las demás secciones vienen del schema estático
 */
export async function fetchMenuSectionsFromDb(): Promise<MenuSection[]> {
  // 1) Trae sabores desde BD
  const flavors = await fetchFlavors()

  // 2) Mapea sabores de BD -> MenuItem[]
  const flavorItems: MenuItem[] = flavors
    .filter((f) => safeBool(f.available, true))
    .map((f) => {
      const extraPrice = f.price_extra ?? (f.intensity === 'extremo' ? 10 : 5)
      const prices: MenuPrice[] = [{ label: 'Extra', value: safeNum(extraPrice, 0) }]
      const tags = f.tags ?? (f.intensity === 'extremo' ? ['muy_picante'] : undefined)
      return {
        id: f.id,
        name: f.name,
        description: f.description ?? undefined,
        prices,
        tags,
        available: safeBool(f.available, true),
      }
    })

  // 3) Toma la metadata base de la sección 'sabores' del schema estático
  const saboresBase = MENU_SECTIONS.find((s) => s.id === 'sabores')
  const saboresSection: MenuSection = {
    id: 'sabores',
    title: saboresBase?.title ?? 'Sabores',
    subtitle:
      saboresBase?.subtitle ??
      'Elige tu combinación. En Res/Pollo el primer sabor está incluido. Extras: +$5 (Extremo +$10).',
    layout: saboresBase?.layout ?? 'cards',
    items: flavorItems,
  }

  // 4) Mantén todas las demás secciones EXACTAMENTE como en tu schema estático
  const otherSections = MENU_SECTIONS.filter((s) => s.id !== 'sabores')

  // 5) Devuelve el menú final (BD + estático)
  return [saboresSection, ...otherSections]
}