import { createNotice, updateNotice } from './actions'

type NoticeFormProps = {
  mode: 'create' | 'edit'
  initial?: {
    id: string
    title: string
    body: string | null
    image_url: string | null
    priority: number | null
    is_active: boolean
    starts_at: string | null
    ends_at: string | null
  } | null
}

function toLocalInputValue(iso?: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  // Ajustar a local y truncar segundos
  const tz = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  const pad = (n: number) => String(n).padStart(2, '0')
  const yyyy = tz.getFullYear()
  const mm = pad(tz.getMonth() + 1)
  const dd = pad(tz.getDate())
  const hh = pad(tz.getHours())
  const mi = pad(tz.getMinutes())
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
}

export default function NoticeForm({ mode, initial }: NoticeFormProps) {
  const action = mode === 'create'
    ? createNotice
    : async (formData: FormData) => {
        'use server'
        await updateNotice(initial!.id, formData)
      }

  return (
    <form action={action} className="card space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="title">Título *</label>
          <input
            id="title"
            name="title"
            required
            defaultValue={initial?.title ?? ''}
            className="w-full rounded-xl border px-3 py-2"
            placeholder="Ej. Promo 2x1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="priority">Prioridad</label>
          <input
            id="priority"
            name="priority"
            type="number"
            min={0}
            max={999}
            defaultValue={initial?.priority ?? 0}
            className="w-full rounded-xl border px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="image_url">Imagen (URL)</label>
        <input
          id="image_url"
          name="image_url"
          defaultValue={initial?.image_url ?? ''}
          className="w-full rounded-xl border px-3 py-2"
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="body">Texto</label>
        <textarea
          id="body"
          name="body"
          rows={4}
          defaultValue={initial?.body ?? ''}
          className="w-full rounded-xl border px-3 py-2"
          placeholder="Descripción del aviso (opcional)"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="starts_at">Inicio *</label>
          <input
            id="starts_at"
            name="starts_at"
            type="datetime-local"
            required
            defaultValue={toLocalInputValue(initial?.starts_at)}
            className="w-full rounded-xl border px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="ends_at">Fin</label>
          <input
            id="ends_at"
            name="ends_at"
            type="datetime-local"
            defaultValue={toLocalInputValue(initial?.ends_at)}
            className="w-full rounded-xl border px-3 py-2"
          />
        </div>
      </div>

      <label className="inline-flex items-center gap-2">
        <input
          type="checkbox"
          name="active"
          defaultChecked={initial?.is_active ?? true}
        />
        <span>Activo</span>
      </label>

      <div className="flex gap-3">
        <button type="submit" className="btn-cta">
          {mode === 'create' ? 'Crear' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )
}