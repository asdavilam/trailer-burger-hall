import Link from 'next/link'
import { supabaseServer } from '@/lib/supabaseServer'
import { requireAdmin } from '@/lib/auth'
import { toggleProteinAvailable, deleteProtein } from './actions'
import ConfirmSubmit from '@/app/components/admin/ConfirmSubmit' // ya lo tienes

type ProteinRow = {
  id: string
  name: string
  description: string | null
  price_base: number
  available: boolean
  created_at: string
}

export default async function ProteinsAdminPage() {
  await requireAdmin()

  const supabase = await supabaseServer()
  const { data, error } = await supabase
    .from('proteins')
    .select('id,name,description,price_base,available,created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[admin/proteins] list error', error)
    return (
      <div className="space-y-3">
        <h1 className="font-display text-xl">Proteínas</h1>
        <p className="text-red-600">No se pudieron cargar.</p>
        <Link className="btn" href="/admin/menu/proteins/new">Nueva proteína</Link>
      </div>
    )
  }

  const rows = (data ?? []) as ProteinRow[]

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-xl">Proteínas</h1>
        <Link className="btn" href="/admin/menu/proteins/new">Nueva proteína</Link>
      </header>

      {rows.length === 0 ? (
        <p className="text-muted">Aún no hay proteínas.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-sm text-muted">
                <th className="px-3 py-1.5">Nombre</th>
                <th className="px-3 py-1.5">Precio base</th>
                <th className="px-3 py-1.5">Estado</th>
                <th className="px-3 py-1.5">Creado</th>
                <th className="px-3 py-1.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="bg-white rounded-xl border align-top">
                  <td className="px-3 py-2">
                    <div className="font-medium">{p.name}</div>
                    {p.description && <div className="text-sm text-muted">{p.description}</div>}
                  </td>
                  <td className="px-3 py-2">${p.price_base}</td>
                  <td className="px-3 py-2">
                    <span className={p.available
                      ? 'inline-flex items-center rounded-full px-2 py-0.5 text-xs border border-green-300 bg-green-50 text-green-700'
                      : 'inline-flex items-center rounded-full px-2 py-0.5 text-xs border border-gray-300 bg-gray-50 text-gray-600'}>
                      {p.available ? 'Disponible' : 'Agotado'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-sm text-muted">
                    {new Date(p.created_at).toLocaleString()}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/menu/proteins/${p.id}`} className="underline text-sm">
                        Editar
                      </Link>

                      {/* Toggle disponible */}
                      <form action={async () => {
                        'use server'
                        await toggleProteinAvailable(p.id, !p.available)
                      }}>
                        <ConfirmSubmit
                          label={p.available ? 'Marcar agotado' : 'Marcar disponible'}
                          confirmMessage={p.available
                            ? '¿Marcar esta proteína como agotada?'
                            : '¿Marcar esta proteína como disponible?'}
                          className="underline text-sm"
                        />
                      </form>

                      {/* Eliminar */}
                      <form action={async () => {
                        'use server'
                        await deleteProtein(p.id)
                      }}>
                        <ConfirmSubmit
                          label="Eliminar"
                          confirmMessage="¿Eliminar esta proteína?"
                          className="underline text-sm text-red-600"
                        />
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}