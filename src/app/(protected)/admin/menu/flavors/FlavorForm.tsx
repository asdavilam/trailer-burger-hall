// Server Component (sin 'use client')
type FlavorFormProps = {
  mode: 'new' | 'edit'
  initial?: {
    id?: string
    name: string
    description?: string | null
    tag: string
    intensity: string
    extra_price: number
    is_active: boolean
    sort_order: number
    price_extra?: number | null
    available?: boolean | null
  }
}

export default function FlavorForm({ mode, initial }: FlavorFormProps) {
  return (
    <div className="space-y-4 max-w-md">
      {mode === 'edit' && initial?.id ? (
        <input type="hidden" name="id" value={initial.id} />
      ) : null}

      <div>
        <label className="block text-sm mb-1">Nombre</label>
        <input
          name="name"
          defaultValue={initial?.name ?? ''}
          className="input"
          required
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Descripción</label>
        <textarea
          name="description"
          defaultValue={initial?.description ?? ''}
          className="textarea"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">Tag</label>
          <input
            name="tag"
            defaultValue={initial?.tag ?? ''}
            placeholder="p.ej. picante / dulce / ahumado"
            className="input"
            required
          />
          {/* Si prefieres select con enums, lo cambiamos luego */}
        </div>
        <div>
          <label className="block text-sm mb-1">Intensidad</label>
          <input
            name="intensity"
            defaultValue={initial?.intensity ?? ''}
            placeholder="p.ej. suave / normal / fuerte"
            className="input"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">Extra (precio)</label>
          <input
            name="extra_price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={initial?.extra_price ?? 0}
            className="input"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Orden</label>
          <input
            name="sort_order"
            type="number"
            step="1"
            min="0"
            defaultValue={initial?.sort_order ?? 0}
            className="input"
            required
          />
        </div>
      </div>

      {/* Opcionales de tu tabla */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">price_extra (opcional)</label>
          <input
            name="price_extra"
            type="number"
            step="0.01"
            min="0"
            defaultValue={initial?.price_extra ?? ''}
            className="input"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            id="available"
            name="available"
            type="checkbox"
            defaultChecked={initial?.available ?? undefined}
          />
          <label htmlFor="available">Disponible (opcional)</label>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="is_active"
          name="is_active"
          type="checkbox"
          defaultChecked={initial?.is_active ?? true}
        />
        <label htmlFor="is_active">Activo</label>
      </div>
    </div>
  )
}