import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { supabaseServer } from '@/lib/supabaseServer'
import { toggleFlavorActive, deleteFlavor } from './actions'
import ConfirmSubmit from '@/app/components/admin/ConfirmSubmit'

type Row = {
  id: string
  name: string
  tag: string
  intensity: string
  extra_price: number
  is_active: boolean
  sort_order: number
  created_at: string
}

function Badge({ active }: { active: boolean }) {
  return (
    <span className={
      active
        ? 'inline-flex items-center rounded-full px-2 py-0.5 text-xs border border-green-300 bg-green-50 text-green-700'
        : 'inline-flex items-center rounded-full px-2 py-0.5 text-xs border border-gray-300 bg-gray-50 text-gray-600'
    }>
      {active ? 'Activo' : 'Inactivo'}
    </span>
  )
}

export default async function FlavorsAdminPage() {
  await requireAdmin()

  const supabase = await supabaseServer()
  const { data, error } = await supabase
    .from('flavors')
    .select('id,name,tag,intensity,extra_price,is_active,sort_order,created_at')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[admin/flavors] list error', error)
    return (
      <div className="space-y-3">
        <h1 className="font-display text-xl">Sabores</h1>
        <p className="text-red-600">No se pudieron cargar los sabores.</p>
        <Link href="/admin/menu/flavors/new" className="btn">Nuevo sabor</Link>
      </div>
    )
  }

  const rows = (data ?? []) as Row[]

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-xl">Sabores</h1>
        <Link href="/admin/menu/flavors/new" className="btn">Nuevo sabor</Link>
      </header>

      {rows.length === 0 ? (
        <p className="text-muted">Aún no hay sabores.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-sm text-muted">
                <th className="px-3 py-1.5">Nombre</th>
                <th className="px-3 py-1.5">Tag</th>
                <th className="px-3 py-1.5">Intensidad</th>
                <th className="px-3 py-1.5">Extra</th>
                <th className="px-3 py-1.5">Estado</th>
                <th className="px-3 py-1.5">Orden</th>
                <th className="px-3 py-1.5">Creado</th>
                <th className="px-3 py-1.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="bg-white rounded-xl border align-top">
                  <td className="px-3 py-2 font-medium">{r.name}</td>
                  <td className="px-3 py-2">{r.tag}</td>
                  <td className="px-3 py-2">{r.intensity}</td>
                  <td className="px-3 py-2">${Number(r.extra_price).toFixed(2)}</td>
                  <td className="px-3 py-2"><Badge active={r.is_active} /></td>
                  <td className="px-3 py-2">{r.sort_order}</td>
                  <td className="px-3 py-2 text-sm text-muted">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/menu/flavors/${r.id}`} className="underline text-sm">Editar</Link>

                      {/* Publicar/Despublicar */}
                      <form action={async () => {
                        'use server'
                        await toggleFlavorActive(r.id, !r.is_active)
                      }}>
                        <button type="submit" className="text-sm underline">
                          {r.is_active ? 'Despublicar' : 'Publicar'}
                        </button>
                      </form>

                      {/* Eliminar (con confirmación) */}
                      <form action={async () => {
                        'use server'
                        const { deleteFlavor } = await import('./actions')
                        await deleteFlavor(r.id)
                      }}>
                        <ConfirmSubmit
                          label="Eliminar"
                          confirmMessage="¿Eliminar este sabor?"
                          className="text-sm underline text-red-600"
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
    </div>
  )
}