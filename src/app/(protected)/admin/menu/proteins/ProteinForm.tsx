// ✅ ProteinForm.tsx — Server Component (sin 'use client')

type ProteinCategory = (typeof CATEGORIES)[number]

type ProteinFormProps = {
  mode: 'new' | 'edit'
  initial?: {
    id?: string
    name: string
    description?: string | null
    price_normal: number
    price_double: number
    price_light: number
    available: boolean
    category?: ProteinCategory
  }
}

const CATEGORIES = ['carne', 'mar', 'vegetariano'] as const

export default function ProteinForm({ mode, initial }: ProteinFormProps) {
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

      <div>
        <label className="block text-sm mb-1">Precio normal</label>
        <input
          name="price_normal"
          type="number"
          step="0.01"
          min="0"
          defaultValue={initial?.price_normal ?? 0}
          className="input"
          required
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Precio doble</label>
        <input
          name="price_double"
          type="number"
          step="0.01"
          min="0"
          defaultValue={initial?.price_double ?? 0}
          className="input"
          required
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Precio light</label>
        <input
          name="price_light"
          type="number"
          step="0.01"
          min="0"
          defaultValue={initial?.price_light ?? 0}
          className="input"
          required
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Categoría</label>
        <select
          name="category"
          className="input"
          defaultValue={initial?.category ?? CATEGORIES[0]}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="available"
          name="available"
          type="checkbox"
          defaultChecked={initial?.available ?? true}
        />
        <label htmlFor="available">Disponible</label>
      </div>
    </div>
  )
}