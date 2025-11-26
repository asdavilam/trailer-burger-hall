// apps/admin/src/app/products/actions.ts
'use server'

import { createClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin' // Llave maestra para escribir
import { revalidatePath } from 'next/cache'
import { V2Product } from '@trailer/shared'
import { redirect } from 'next/navigation'

// --- LECTURA (Para cargar la página) ---

export async function getProductFull(id: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('v2_products')
        .select(`
      *,
      variants:v2_product_variants(*),
      allowed_modifiers:v2_product_modifiers_link(
        *,
        modifier:v2_modifiers(*)
      )
    `)
        .eq('id', id)
        .single()

    if (error || !data) return null
    return data as V2Product
}

export async function getAllModifiers() {
    const supabase = await createClient()
    // Traemos todos los modificadores (sabores y extras) activos
    const { data } = await supabase.from('v2_modifiers').select('*').eq('is_active', true).order('name')
    return data || []
}

// Get all products with their variants and modifiers
export async function getV2Products() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('v2_products')
        .select(`
      *,
      variants:v2_product_variants(*),
      allowed_modifiers:v2_product_modifiers_link(
        *,
        modifier:v2_modifiers(*)
      )
    `)
        .eq('is_active', true)
        .order('name')

    if (error) {
        console.error('Error fetching products:', error)
        return []
    }

    return data as V2Product[]
}

// --- ESCRITURA (Actions para los formularios) ---

// 1. Actualizar Datos Básicos
export async function updateProductBasic(id: string, formData: FormData) {
    const name = formData.get('name') as string
    const category = formData.get('category') as string

    const { error } = await supabaseAdmin
        .from('v2_products')
        .update({ name, category })
        .eq('id', id)

    if (error) return { error: error.message }
    revalidatePath(`/products/${id}`)
    return { success: true }
}

// 2. Actualizar Precio de una Variante
export async function updateVariantPrice(variantId: string, price: number) {
    const { error } = await supabaseAdmin
        .from('v2_product_variants')
        .update({ price })
        .eq('id', variantId)

    if (error) return { error: 'Error actualizando precio' }
    revalidatePath('/products/[id]', 'page')
    return { success: true }
}

// 3. Alternar Modificador (Activar/Desactivar un sabor para este producto)
export async function toggleModifierLink(productId: string, modifierId: string, isLinked: boolean) {
    if (isLinked) {
        // Crear enlace
        const { error } = await supabaseAdmin
            .from('v2_product_modifiers_link')
            .insert({ product_id: productId, modifier_id: modifierId })
        if (error) return { error: error.message }
    } else {
        // Borrar enlace
        const { error } = await supabaseAdmin
            .from('v2_product_modifiers_link')
            .delete()
            .match({ product_id: productId, modifier_id: modifierId })
        if (error) return { error: error.message }
    }

    revalidatePath(`/products/${productId}`)
    return { success: true }
}

// 4. Configurar Default (Hacer que "Chimi" venga pre-seleccionado)
export async function toggleModifierDefault(productId: string, modifierId: string, isDefault: boolean) {
    const { error } = await supabaseAdmin
        .from('v2_product_modifiers_link')
        .update({ is_default: isDefault })
        .match({ product_id: productId, modifier_id: modifierId })

    if (error) return { error: error.message }
    revalidatePath(`/products/${productId}`)
    return { success: true }
}

// --- GESTIÓN DE RECETAS V2 (INVENTARIO) ---

// 1. Obtener ingredientes de una variante
export async function getVariantIngredients(variantId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('v2_product_ingredients')
    .select('*, supply:supplies(*)') // Traemos nombre del insumo
    .eq('variant_id', variantId)
  
  return data || []
}

// 2. Agregar Insumo a Variante
export async function addIngredientToVariant(variantId: string, supplyId: string, quantity: number) {
  const { error } = await supabaseAdmin
    .from('v2_product_ingredients')
    .insert({
      variant_id: variantId,
      supply_id: supplyId,
      quantity: quantity
    })

  if (error) return { error: error.message }
  revalidatePath('/products/[id]', 'page')
  return { success: true }
}

// 3. Borrar Insumo
export async function removeIngredientV2(ingredientId: string) {
  const { error } = await supabaseAdmin
    .from('v2_product_ingredients')
    .delete()
    .eq('id', ingredientId)

  if (error) return { error: error.message }
  revalidatePath('/products/[id]', 'page')
  return { success: true }
}

// 5. CREAR PRODUCTO NUEVO
export async function createProduct(formData: FormData) {
  const name = formData.get('name') as string
  const category = formData.get('category') as string

  // 1. Crear el producto base
  const { data, error } = await supabaseAdmin
    .from('v2_products')
    .insert({ 
      name, 
      category,
      is_active: true,
      config: {} // Configuración vacía por defecto
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  // 2. Crear la variante "Normal" por defecto (para ahorrar tiempo)
  // Así el usuario ya tiene algo que editar de precio
  await supabaseAdmin.from('v2_product_variants').insert({
    product_id: data.id,
    name: 'normal',
    price: 0
  })

  // 3. Redirigir al Editor para terminar de configurarlo
  redirect(`/products/${data.id}`)
}