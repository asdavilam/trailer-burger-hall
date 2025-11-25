// packages/shared/src/types.ts

// 1. Variantes de hamburguesa
export type VariantKind = 'normal' | 'double' | 'light' | 'casa' | 'torre';

// 2. Entidades Principales (DB + Lógica)
export type Protein = {
  id: string
  name: string
  price_base: number
  price_double: number
  price_light: number
  available?: boolean
  created_at?: string
}

export type Flavor = {
  id: string
  name: string
  intensity: 'normal' | 'extremo'
  price_extra: number
  description?: string | null
  tags?: string[] | null
  available?: boolean
  created_at?: string
}

export type Extra = {
  id: string
  name: string
  price: number
  available?: boolean
  created_at?: string
}

// 3. Tipos de Resultados (para el ticket/carrito)
export type PriceBreakdown = {
  base: number
  flavorsIncluded: string[]
  flavorsCharged: { id: string; amount: number }[]
  extras: { id: string; amount: number }[]
  total: number
}