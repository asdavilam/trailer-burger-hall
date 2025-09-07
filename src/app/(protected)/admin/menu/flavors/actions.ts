'use server'

import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { supabaseServer } from '@/lib/supabaseServer'
import { requireAdmin } from '@/lib/auth'

// 👇 Si conoces los valores exactos de tus enums, cámbialos por z.enum([...])
const flavorSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  description: z.string().optional().nullable(),

  // En tu DB: tag (USER-DEFINED). Aceptamos string y deja que PG valide contra el enum.
  tag: z.string().min(1, 'Tag requerido'),

  // En tu DB: intensity (USER-DEFINED) default 'normal'
  intensity: z.string().default('normal'),

  // NOT NULL en DB (default 0). Coerce para aceptar textos de <input type="number">
  extra_price: z.coerce.number().nonnegative('Precio extra inválido').default(0),

  // Flags
  is_active: z.coerce.boolean().default(true),

  // nullable en DB; lo manejamos como booleano opcional
  available: z.coerce.boolean().default(true),

  // Orden para la UI (NOT NULL en DB con default 0)
  sort_order: z.coerce.number().int().min(0).default(0),

  // Campo opcional en tu tabla (numeric, nullable). Úsalo si lo ocupas en UI.
  price_extra: z.coerce.number().nonnegative().optional().nullable(),

  // ARRAY opcional en tu tabla; desde un input “comma-separated” del form
  tags: z
    .string()
    .transform(v => (v?.trim() ? v.split(',').map(s => s.trim()).filter(Boolean) : null))
    .optional(),
})

function touchMenu() {
  revalidateTag('menu')
}

/** CREATE */
export async function createFlavor(formData: FormData) {
  await requireAdmin()

  const raw = {
    name: String(formData.get('name') ?? ''),
    description: (formData.get('description') as string) || null,
    tag: (formData.get('tag') as string) || '',
    intensity: (formData.get('intensity') as string) || 'normal',
    extra_price: formData.get('extra_price'),
    is_active: formData.get('is_active') === 'on' || formData.get('is_active') === 'true',
    available: formData.get('available') === 'on' || formData.get('available') === 'true',
    sort_order: formData.get('sort_order'),
    price_extra: formData.get('price_extra'),
    tags: (formData.get('tags') as string) ?? '', // "a,b,c" → array (via transform)
  }

  const parsed = flavorSchema.safeParse(raw)
  if (!parsed.success) {
    const msg = parsed.error.issues.map(i => i.message).join(', ')
    throw new Error('Validación: ' + msg)
  }

  // Ajuste pequeño: si tags quedó como [], mándalo como null
  const row = {
    ...parsed.data,
    tags: parsed.data.tags && parsed.data.tags.length ? parsed.data.tags : null,
  }

  const supabase = await supabaseServer()
  const { error } = await supabase.from('flavors').insert(row)
  if (error) throw new Error('[createFlavor] ' + error.message)

  touchMenu()
  redirect('/admin/menu/flavors')
}

/** UPDATE */
export async function updateFlavor(id: string, formData: FormData) {
  await requireAdmin()

  const raw = {
    name: String(formData.get('name') ?? ''),
    description: (formData.get('description') as string) || null,
    tag: (formData.get('tag') as string) || '',
    intensity: (formData.get('intensity') as string) || 'normal',
    extra_price: formData.get('extra_price'),
    is_active: formData.get('is_active') === 'on' || formData.get('is_active') === 'true',
    available: formData.get('available') === 'on' || formData.get('available') === 'true',
    sort_order: formData.get('sort_order'),
    price_extra: formData.get('price_extra'),
    tags: (formData.get('tags') as string) ?? '',
  }

  const parsed = flavorSchema.safeParse(raw)
  if (!parsed.success) {
    const msg = parsed.error.issues.map(i => i.message).join(', ')
    throw new Error('Validación: ' + msg)
  }

  const row = {
    ...parsed.data,
    tags: parsed.data.tags && parsed.data.tags.length ? parsed.data.tags : null,
  }

  const supabase = await supabaseServer()
  const { error, data } = await supabase
    .from('flavors')
    .update(row)
    .eq('id', id)
    .select('id')
    .single()

  if (error) throw new Error('[updateFlavor] ' + error.message)
  if (!data) throw new Error('[updateFlavor] no row updated (revisa RLS/policies)')

  touchMenu()
  redirect('/admin/menu/flavors')
}

/** DELETE */
export async function deleteFlavor(id: string) {
  await requireAdmin()
  const supabase = await supabaseServer()
  const { error } = await supabase.from('flavors').delete().eq('id', id)
  if (error) throw new Error('[deleteFlavor] ' + error.message)

  touchMenu()
  redirect('/admin/menu/flavors')
}

/** TOGGLE is_active */
export async function toggleFlavorActive(id: string, next: boolean) {
  await requireAdmin()
  const supabase = await supabaseServer()
  const { error } = await supabase.from('flavors').update({ is_active: next }).eq('id', id)
  if (error) throw new Error('[toggleFlavorActive] ' + error.message)

  touchMenu()
}

/** TOGGLE available (opcional, si lo quieres en UI) */
export async function toggleFlavorAvailable(id: string, next: boolean) {
  await requireAdmin()
  const supabase = await supabaseServer()
  const { error } = await supabase.from('flavors').update({ available: next }).eq('id', id)
  if (error) throw new Error('[toggleFlavorAvailable] ' + error.message)

  touchMenu()
}