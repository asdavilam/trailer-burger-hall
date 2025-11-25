// src/lib/menu-dal.ts
import { supabaseServer } from './supabaseServer'
import type { MenuSection, MenuItem, MenuPrice } from '@trailer/shared'

/**
 * Tipos de respuesta de Supabase (Join)
 */
type PriceRow = {
  label: string | null
  value: number
  sort_order: number
}

type ItemRow = {
  id: string
  name: string
  description: string | null
  image_url: string | null
  available: boolean
  tags: string[] | null
  badges: string[] | null
  includes_list: string[] | null
  note: string | null
  sort_order: number
  prices: PriceRow[]
}

type SectionRow = {
  id: string
  title: string
  subtitle: string | null
  layout: 'cards' | 'list'
  sort_order: number
  items: ItemRow[]
}

/**
 * Obtiene el menú completo desde las nuevas tablas de Supabase.
 * Realiza un join profundo: menu_sections -> menu_items -> menu_item_prices
 */
export async function fetchMenuSectionsFromDb(): Promise<MenuSection[]> {
  const supabase = await supabaseServer()

  const { data, error } = await supabase
    .from('menu_sections')
    .select(`
      id,
      title,
      subtitle,
      layout,
      sort_order,
      items:menu_items (
        id,
        name,
        description,
        image_url,
        available,
        tags,
        badges,
        includes_list,
        note,
        sort_order,
        prices:menu_item_prices (
          label,
          value,
          sort_order
        )
      )
    `)
    .order('sort_order', { ascending: true })
    .order('sort_order', { foreignTable: 'menu_items', ascending: true })
    .order('sort_order', { foreignTable: 'menu_items.prices', ascending: true })

  if (error) {
    console.error('[menu-dal] Error fetching menu:', error)
    return []
  }

  if (!data) return []

  // Mapear la respuesta de Supabase al tipo MenuSection[] que espera el frontend
  const sections: MenuSection[] = (data as unknown as SectionRow[]).map((s) => ({
    id: s.id,
    title: s.title,
    subtitle: s.subtitle ?? undefined,
    layout: s.layout ?? 'cards',
    items: s.items.map((item) => {
      // Mapear precios
      const prices: MenuPrice[] = item.prices.map((p) => ({
        label: p.label ?? undefined,
        value: Number(p.value), // Asegurar que sea número
      }))

      // Construir el MenuItem
      const menuItem: MenuItem = {
        id: item.id,
        name: item.name,
        description: item.description ?? undefined,
        prices,
        tags: item.tags ?? undefined,
        available: item.available,
        includes: item.includes_list ?? undefined,
        badges: item.badges ?? undefined,
        note: item.note ?? undefined,
        image: item.image_url ?? undefined,
      }

      return menuItem
    }),
  }))

  return sections
}