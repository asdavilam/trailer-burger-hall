import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseServer } from '@/lib/supabaseServer'
import { requireAdmin } from '@/lib/auth'
import NoticeForm from '../NoticeForm'

export default async function NoticeEditPage({ params }: { params: { id: string } }) {
  await requireAdmin()

  const supabase = await supabaseServer()
  const { data, error } = await supabase
    .from('notices')
    .select('id,title,body,image_url,priority,is_active,starts_at,ends_at')
    .eq('id', params.id)
    .single()

  if (error) {
    console.error('[admin/notices:id] fetch error', error)
  }
  if (!data) notFound()

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">Editar aviso</h1>
        <Link href="/admin/notices" className="underline">Volver</Link>
      </div>
      <NoticeForm mode="edit" initial={data} />
    </section>
  )
}