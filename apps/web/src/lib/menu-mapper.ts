// src/lib/menu-mapper.ts
import type { MenuSection, MenuItem, MenuPrice } from '@/app/menu/types'

type DbPrice = { label: string | null; amount: number | null }
type DbItem = {
  id: string
  name: string
  description?: string | null
  note?: string | null
  image_path?: string | null
  available?: boolean | null
  tags?: string[] | null
  badges?: string[] | null
  includes?: string[] | null
  prices?: DbPrice[] | null
}
type DbSection = {
  id: string
  title: string
  subtitle?: string | null
  layout?: string | null
  items?: DbItem[] | null
}

const mapPrice = (p: DbPrice): MenuPrice => ({
  label: p.label ?? undefined,
  value: Number(p.amount ?? 0),
})

const mapItem = (i: DbItem): MenuItem => ({
  id: i.id,
  name: i.name,
  description: i.description ?? undefined,
  note: i.note ?? undefined,
  image: i.image_path ?? undefined,
  available: i.available ?? true,
  tags: i.tags ?? undefined,
  badges: i.badges ?? undefined,
  includes: i.includes ?? undefined,
  prices: (i.prices ?? []).map(mapPrice),
})

export function mapSections(db: DbSection[]): MenuSection[] {
  return (db ?? []).map((s) => ({
    id: s.id,
    title: s.title,
    subtitle: s.subtitle ?? undefined,
    layout: (s.layout === 'list' ? 'list' : 'cards') as MenuSection['layout'],
    items: (s.items ?? []).map(mapItem),
  }))
}