// src/app/menu/types.ts
export type MenuPrice = {
  label?: string
  value: number
}

export type MenuItem = {
  id: string
  name: string
  description?: string | null
  prices: MenuPrice[]
  tags?: string[]
  available?: boolean
  includes?: string[]
  badges?: string[]
  note?: string
  image?: string
}

export type MenuSection = {
  id: string
  title: string
  subtitle?: string
  layout?: 'cards' | 'list'
  items: MenuItem[]
}