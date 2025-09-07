'use client'

import type { Flavor } from '@/lib/menu-data'

type Props = {
  flavors: Flavor[]
  selectedId?: string | null
  onSelect: (id: string) => void
}

export default function FlavorList({ flavors, selectedId, onSelect }: Props) {
  if (!flavors.length) {
    return <p className="text-gray-600">Aún no hay sabores configurados.</p>
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {flavors.map((f) => {
        const disabled = !f.available
        const selected = selectedId === f.id
        const priceExtra = f.price_extra ?? 0

        return (
          <button
            key={f.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(f.id)}
            aria-pressed={selected}
            className={[
              'rounded-2xl border p-4 text-left transition',
              disabled
                ? 'cursor-not-allowed opacity-50'
                : 'hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C08A3E]',
              selected ? 'border-[#C08A3E] shadow-md' : 'border-gray-200',
            ].join(' ')}
          >
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold text-[#3B1F1A]">{f.name}</h3>
              <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                {priceExtra > 0 ? `+ $${priceExtra.toFixed(2)}` : 'incluido'}
              </span>
            </div>

            {f.description ? (
              <p className="mt-1 line-clamp-2 text-sm text-gray-600">{f.description}</p>
            ) : null}

            {/* Etiquetas */}
            {Array.isArray(f.tags) && f.tags.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {f.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : null}

            {!f.available ? <p className="mt-2 text-sm font-medium text-red-600">Agotado</p> : null}

            {selected ? <p className="mt-2 text-sm text-[#6B8E62]">Seleccionado</p> : null}
          </button>
        )
      })}
    </div>
  )
}
