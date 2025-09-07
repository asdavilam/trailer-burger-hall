import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { supabaseServer } from '@/lib/supabaseServer'
import { toggleNoticeActive, deleteNotice } from './actions'
import ConfirmSubmit from '@/app/components/admin/ConfirmSubmit'

type NoticeRow = {
  id: string
  title: string
  is_active: boolean
  priority: number | null
  starts_at: string
  ends_at: string | null
  created_at: string
}

function Badge({ active }: { active: boolean }) {
  return (
    <span
      className={
        active
          ? 'inline-flex items-center rounded-full px-2 py-0.5 text-xs border border-green-300 bg-green-50 text-green-700'
          : 'inline-flex items-center rounded-full px-2 py-0.5 text-xs border border-gray-300 bg-gray-50 text-gray-600'
      }
    >
      {active ? 'Activo' : 'Inactivo'}
    </span>
  )
}

export default async function NoticesPage() {
  await requireAdmin() // asegura sesión/rol

  const supabase = await supabaseServer()
  const { data, error } = await supabase
    .from('notices')
    .select('id,title,is_active,priority,starts_at,ends_at,created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[admin/notices] list error', error)
    return (
      <div className="space-y-3">
        <h1 className="font-display text-xl">Avisos</h1>
        <p className="text-red-600">No se pudieron cargar los avisos.</p>
        <Link href="/admin/notices/new" className="btn">Nuevo aviso</Link>
      </div>
    )
  }

  const rows = (data ?? []) as NoticeRow[]

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-xl">Avisos</h1>
        <Link href="/admin/notices/new" className="btn">Nuevo aviso</Link>
      </header>

      {rows.length === 0 ? (
        <p className="text-muted">Aún no hay avisos.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-sm text-muted">
                <th className="px-3 py-1.5">Título</th>
                <th className="px-3 py-1.5">Estado</th>
                <th className="px-3 py-1.5">Prioridad</th>
                <th className="px-3 py-1.5">Vigencia</th>
                <th className="px-3 py-1.5">Creado</th>
                <th className="px-3 py-1.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((n) => (
                <tr key={n.id} className="bg-white rounded-xl border align-top">
                  <td className="px-3 py-2 font-medium">{n.title}</td>
                  <td className="px-3 py-2"><Badge active={n.is_active} /></td>
                  <td className="px-3 py-2">{n.priority ?? '—'}</td>
                  <td className="px-3 py-2 text-sm text-muted">
                    {new Date(n.starts_at).toLocaleString()} {n.ends_at ? `→ ${new Date(n.ends_at).toLocaleString()}` : ''}
                  </td>
                  <td className="px-3 py-2 text-sm text-muted">
                    {new Date(n.created_at).toLocaleString()}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/notices/${n.id}`} className="underline text-sm">Editar</Link>

                      {/* Publicar/Despublicar */}
                      <form action={async () => {
                        'use server'
                        await toggleNoticeActive(n.id, !n.is_active)
                      }}>
                        <ConfirmSubmit
                          label={n.is_active ? 'Despublicar' : 'Publicar'}
                          confirmMessage={`¿Seguro que quieres ${n.is_active ? 'despublicar' : 'publicar'} este aviso?`}
                          className="text-sm underline"
                        />
                      </form>

                      {/* Eliminar */}
                      <form action={async () => {
                          'use server'
                          await deleteNotice(n.id)
                        }}>
                          <ConfirmSubmit
                            label="Eliminar"
                            confirmMessage="¿Eliminar este aviso?"
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