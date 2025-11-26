// apps/web/src/app/simulador/actions.ts V2
'use server'

import { createClient } from '@trailer/shared'
import { V2Product, V2Modifier } from '@trailer/shared'

/**
 * Carga los datos necesarios para el simulador V2
 * - Productos (burgers, sides, drinks)
 * - Modificadores (flavors, extras)
 */
export async function loadMenuDataForSimulatorV2() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // 1. Cargar todos los productos con sus variantes y modificadores permitidos
  const { data: products, error: productsError } = await supabase
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

  if (productsError) {
    console.error('Error loading products:', productsError)
    return { products: [], modifiers: [] }
  }

  // 2. Cargar todos los modificadores (para mostrar precios y opciones)
  const { data: modifiers, error: modifiersError } = await supabase
    .from('v2_modifiers')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (modifiersError) {
    console.error('Error loading modifiers:', modifiersError)
    return { products: products as V2Product[], modifiers: [] }
  }

  return {
    products: products as V2Product[],
    modifiers: modifiers as V2Modifier[]
  }
}