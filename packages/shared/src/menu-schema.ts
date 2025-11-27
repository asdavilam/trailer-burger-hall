// Tipos de la carta digital (puedes extenderlos si lo necesitas)
export type MenuPrice = {
  label?: string // ej. "Combo", "Doble"
  value: number // precio
}

export type MenuItem = {
  id: string
  name: string
  description?: string | null
  prices: MenuPrice[] // uno o varios precios
  tags?: string[] // ej. ["picante", "vegetariano"]
  available?: boolean // si no lo pones, asume true
  // 👇 campos visuales adicionales (no rompen nada existente)
  includes?: string[] // sabores por defecto visibles como píldoras (ej. ["diabla","mojo"])
  badges?: string[] // ej. ["vegetariano","estrella","doble","torre","light"]
  note?: string // microcopy corto (reglas de sabores)
  image?: string // ruta opcional a imagen
}

export type MenuSection = {
  id: string
  title: string // Título visible de la sección
  subtitle?: string // Línea de apoyo (opcional)
  layout?: 'cards' | 'list' // cómo renderizar (cards por defecto)
  items: MenuItem[]
}

// Carta digital con énfasis en SABORES primero (hero informativo)
// La constante MENU_SECTIONS se ha eliminado porque ahora los datos vienen de Supabase.
// Si necesitas los datos de respaldo, revisa supabase_seed.sql

