import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseServer } from '@/lib/supabaseServer'
import ProteinForm from '../ProteinForm'
import { updateProtein } from '../actions'
import ConfirmSubmit from '@/app/components/admin/ConfirmSubmit' // deja este import si el archivo se llama así

export default async function ProteinEditPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const id  = (await params).id

  const supabase = await supabaseServer()
  const { data, error } = await supabase
    .from('proteins')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('[admin/proteins:id] fetch error', error)
  }
  if (!data) notFound()

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">Editar proteína</h1>
        <Link href="/admin/menu/proteins" className="underline">Volver</Link>
      </div>

      {/* Server Action en el <form> */}
      <form action={updateProtein.bind(null, id)} className="space-y-4">
        <ProteinForm mode="edit" initial={data} />
        <div className="mt-4">
          <ConfirmSubmit
            label="Guardar cambios"
            confirmMessage="¿Guardar cambios de esta proteína?"
            className="btn"
          />
        </div>
      </form>
    </section>
  )
}