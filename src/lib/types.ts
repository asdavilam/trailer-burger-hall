export type Protein = {
  id: string
  name: string
  available: boolean
  created_at: string
}

export type Flavor = {
  id: string
  name: string
  description: string | null
  tags: string[] | null
  price_extra: number | null
  available: boolean
  created_at: string
}

export type Extra = {
  id: string
  name: string
  price: number
  available: boolean
  created_at: string
}