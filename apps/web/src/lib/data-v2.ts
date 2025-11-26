// apps/web/src/lib/data-v2.ts
import { createClient } from '@trailer/shared' // Usamos el cliente compartido
import { V2Product, V2Modifier } from '@trailer/shared'

// Esta función traerá TODO el menú estructurado para la web
export async function getMenuV2() {
  // Necesitamos url/key aquí porque estamos en el servidor de la web
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Traemos productos activos con sus variantes y modificadores
  const { data, error } = await supabase
    .from('v2_products')
    .select(`
      *,
      variants:v2_product_variants(*),
      allowed_modifiers:v2_product_modifiers_link(
        is_default,
        is_included_free,
        modifier:v2_modifiers(*)
      )
    `)
    .eq('is_active', true)
    .order('name')

  if (error) {
    console.error('Error cargando menú V2:', error)
    return []
  }

  // Tipamos el retorno
  return data as V2Product[]
}

// Traer Sabores y Extras sueltos
export async function getModifiersV2() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase
    .from('v2_modifiers')
    .select('*')
    .eq('is_active', true)
    .order('name') // Orden alfabético

  if (error) {
    console.error('Error cargando modificadores:', error)
    return []
  }

  return data as V2Modifier[]
}