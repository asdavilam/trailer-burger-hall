'use client'

import type { Extra } from '@/lib/menu-data'

type Props = {
  extras: Extra[]
  selectedIds: string[]
  onToggle: (id: string) => void
}

export default function ExtrasList({ extras, selectedIds, onToggle }: Props) {
  if (!extras.length) {
    return <p className="text-gray-600">Aún no hay extras configurados.</p>
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {extras.map((e) => {
        const disabled = !e.available
        const selected = selectedIds.includes(e.id)
        return (
          <label
            key={e.id}
            className={[
              'rounded-2xl border p-4 transition',
              disabled
                ? 'cursor-not-allowed opacity-50'
                : 'hover:shadow-md focus-within:outline-none focus-within:ring-2 focus-within:ring-[#C08A3E]',
              selected ? 'border-[#C08A3E] shadow-md' : 'border-gray-200',
            ].join(' ')}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="mt-1 h-5 w-5 accent-[#6B8E62]"
                  disabled={disabled}
                  checked={selected}
                  onChange={() => onToggle(e.id)}
                  aria-label={`Extra ${e.name}`}
                />
                <span className="text-lg font-semibold text-[#3B1F1A]">{e.name}</span>
              </div>
              <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                ${e.price.toFixed(2)}
              </span>
            </div>

            {e.description ? (
              <p className="mt-1 line-clamp-2 text-sm text-gray-600">{e.description}</p>
            ) : null}

            {!e.available ? <p className="mt-2 text-sm font-medium text-red-600">Agotado</p> : null}
          </label>
        )
      })}
    </div>
  )
}
