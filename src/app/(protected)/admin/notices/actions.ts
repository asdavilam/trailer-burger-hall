'use server'

import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { supabaseServer } from '@/lib/supabaseServer'
import { requireAdmin } from '@/lib/auth'

const noticeSchema = z.object({
  title: z.string().min(2, 'Título requerido'),
  body: z.string().nullable().optional(),
  image_url: z.string().url('URL inválida').nullable().optional().or(z.literal('')),
  priority: z.coerce.number().int().min(0).max(999).default(0),
  // En el formulario seguiremos usando "active", pero lo mapeamos a is_active en DB
  active: z.coerce.boolean().default(true),
  starts_at: z.string().min(1, 'Fecha de inicio requerida'),
  ends_at: z.string().optional().nullable(),
})

function toISO(dtLocal: string | null | undefined) {
  if (!dtLocal) return null
  const d = new Date(dtLocal)
  return isNaN(d.getTime()) ? null : d.toISOString()
}

async function touch() {
  revalidateTag('home')
  revalidateTag('notices')
}

export async function createNotice(formData: FormData) {
  await requireAdmin()
  const raw = {
    title: String(formData.get('title') ?? ''),
    body: (formData.get('body') as string) || null,
    image_url: ((formData.get('image_url') as string) || '').trim() || null,
    priority: formData.get('priority'),
    active: formData.get('active') === 'on' || formData.get('active') === 'true',
    starts_at: String(formData.get('starts_at') ?? ''),
    ends_at: (formData.get('ends_at') as string) || '',
  }

  const parsed = noticeSchema.safeParse(raw)
  if (!parsed.success) {
    const msg = parsed.error.issues.map(i => i.message).join(', ')
    throw new Error('Validación: ' + msg)
  }

  const payload = parsed.data
  const row = {
    title: payload.title,
    body: (payload.body ?? '').trim(),
    image_url: payload.image_url || null,
    priority: payload.priority,
    is_active: payload.active, // 👈 mapeo a la columna real
    starts_at: toISO(payload.starts_at),
    ends_at: toISO(payload.ends_at || null),
  }

  const supabase = await supabaseServer()
  const { error } = await supabase.from('notices').insert(row)
  if (error) throw new Error('[createNotice] ' + error.message)

  await touch()
  redirect('/admin/notices?ok=1')
}

export async function updateNotice(id: string, formData: FormData) {
  await requireAdmin()
  const raw = {
    title: String(formData.get('title') ?? ''),
    body: (formData.get('body') as string) || null,
    image_url: ((formData.get('image_url') as string) || '').trim() || null,
    priority: formData.get('priority'),
    active: formData.get('active') === 'on' || formData.get('active') === 'true',
    starts_at: String(formData.get('starts_at') ?? ''),
    ends_at: (formData.get('ends_at') as string) || '',
  }

  const parsed = noticeSchema.safeParse(raw)
  if (!parsed.success) {
    const msg = parsed.error.issues.map(i => i.message).join(', ')
    throw new Error('Validación: ' + msg)
  }

  const payload = parsed.data
  const row = {
    title: payload.title,
    body: (payload.body ?? '').trim(),
    image_url: payload.image_url || null,
    priority: payload.priority,
    is_active: payload.active, // 👈
    starts_at: toISO(payload.starts_at),
    ends_at: toISO(payload.ends_at || null),
  }

  const supabase = await supabaseServer()
  const { error } = await supabase.from('notices').update(row).eq('id', id)
  if (error) throw new Error('[updateNotice] ' + error.message)

  await touch()
  redirect('/admin/notices?ok=1')
}

export async function deleteNotice(id: string) {
  const supabase = await supabaseServer()
  const { error } = await supabase.from('notices').delete().eq('id', id)
  if (error) throw new Error('[deleteNotice] ' + error.message)

  await touch()
  redirect('/admin/notices?ok=1')
}

export async function toggleNoticeActive(id: string, nextActive: boolean) {
  await requireAdmin()
  const supabase = await supabaseServer()

  const { error } = await supabase
    .from('notices')
    .update({ is_active: nextActive })
    .eq('id', id)

  if (error) {
    console.error('[toggleNoticeActive] error', error)
    throw new Error(error.message)
  }

  await touch()
}