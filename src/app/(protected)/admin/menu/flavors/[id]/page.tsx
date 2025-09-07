import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import { supabaseServer } from '@/lib/supabaseServer'
import FlavorForm from '../FlavorForm'
import { updateFlavor } from '../actions'
import ConfirmSubmit from '@/app/components/admin/ConfirmSubmit'

export default async function FlavorEditPage(
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin()
  const id = (await params).id

  const supabase = await supabaseServer()
  const { data, error } = await supabase
    .from('flavors')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('[admin/flavors:id] fetch error', error)
  }
  if (!data) notFound()

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">Editar sabor</h1>
        <Link href="/admin/menu/flavors" className="underline">Volver</Link>
      </div>

      <form action={updateFlavor.bind(null, id)} className="space-y-4">
        <FlavorForm mode="edit" initial={data} />
        <ConfirmSubmit
          label="Guardar cambios"
          confirmMessage="¿Guardar cambios de este sabor?"
          className="btn"
        />
      </form>
    </section>
  )
}