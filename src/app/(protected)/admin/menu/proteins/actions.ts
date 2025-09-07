'use server'

import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { supabaseServer } from '@/lib/supabaseServer'
import { requireAdmin } from '@/lib/auth'

const CATEGORIES = ['carne', 'mar', 'vegetariano'] as const
type ProteinCategory = (typeof CATEGORIES)[number]

const CATEGORY_DEFAULT: ProteinCategory = 'carne'

const proteinSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  description: z.string().optional().nullable(),
  price_base: z.coerce.number().nonnegative().optional().nullable(),
  price_normal: z.coerce.number().nonnegative('Precio inválido'),
  price_double: z.coerce.number().nonnegative('Precio doble inválido'),
  price_light: z.coerce.number().nonnegative('Precio light inválido'),
  available: z.coerce.boolean().default(true),
  category: z.enum(CATEGORIES).default(CATEGORY_DEFAULT),
})

.refine(d => d.price_double >= d.price_normal, {
    path: ['price_double'],
    message: 'El precio doble no puede ser menor que el normal',
  })
  .refine(d => d.price_light <= d.price_normal, {
    path: ['price_light'],
    message: 'El precio light no puede ser mayor que el normal',
  })

function touchMenu() {
  revalidateTag('menu')
}

export async function createProtein(formData: FormData) {
  await requireAdmin()

  const raw = {
    name: String(formData.get('name') ?? ''),
    description: (formData.get('description') as string) || null,
    price_base: formData.get('price_base') ?? null,
    price_normal: formData.get('price_normal'),
    price_double: formData.get('price_double'),
    price_light: formData.get('price_light'),
    available: formData.get('available') === 'on' || formData.get('available') === 'true',
    category: (formData.get('category') as string) || undefined,
  }

  const parsed = proteinSchema.safeParse(raw)
  if (!parsed.success) {
    const msg = parsed.error.issues.map(i => i.message).join(', ')
    throw new Error('Validación: ' + msg)
  }

  const payload = {
    ...parsed.data,
    price_base:
      parsed.data.price_base ?? parsed.data.price_normal,
  }

  const supabase = await supabaseServer()
  const { error } = await supabase.from('proteins').insert(payload)
  if (error) throw new Error('[createProtein] ' + error.message)

  touchMenu()
  redirect('/admin/menu/proteins')
}

export async function updateProtein(id: string, formData: FormData) {
  await requireAdmin()

  const raw = {
    name: String(formData.get('name') ?? ''),
    description: (formData.get('description') as string) || null,
    price_base: formData.get('price_base') ?? null,
    price_normal: formData.get('price_normal'),
    price_double: formData.get('price_double'),
    price_light: formData.get('price_light'),
    available: formData.get('available') === 'on' || formData.get('available') === 'true',
  }

  const parsed = proteinSchema.safeParse(raw)
  if (!parsed.success) {
    const msg = parsed.error.issues.map(i => i.message).join(', ')
    throw new Error('Validación: ' + msg)
  }

  const payload = {
    ...parsed.data,
    price_base:
      parsed.data.price_base ?? parsed.data.price_normal,
  }

  const supabase = await supabaseServer()
  const { error, data } = await supabase
  .from('proteins')
  .update(payload)
  .eq('id', id)
  .select('id')
  .single()
  if (error) throw new Error('[updateProtein] ' + error.message)
  if (!data) throw new Error('[updateProtein] no row updated (revisa RLS/policies)')  

  touchMenu()
  redirect('/admin/menu/proteins')
}

export async function deleteProtein(id: string) {
  await requireAdmin()
  const supabase = await supabaseServer()
  const { error } = await supabase.from('proteins').delete().eq('id', id)
  if (error) throw new Error('[deleteProtein] ' + error.message)

  touchMenu()
  redirect('/admin/menu/proteins')
}

export async function toggleProteinAvailable(id: string, next: boolean) {
  await requireAdmin()
  const supabase = await supabaseServer()
  const { error } = await supabase.from('proteins').update({ available: next }).eq('id', id)
  if (error) throw new Error('[toggleProteinAvailable] ' + error.message)

  touchMenu()
}