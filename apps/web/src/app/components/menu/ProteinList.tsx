'use client'

import { type Protein } from '@/lib/menu-data'

type Props = {
  proteins: Protein[]
  selectedId?: string | null
  onSelect: (id: string) => void
}

export default function ProteinList({ proteins, selectedId, onSelect }: Props) {
  if (!proteins.length) {
    return <p className="text-gray-600">Aún no hay proteínas configuradas.</p>
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {proteins.map((p) => {
        const disabled = !p.available
        const selected = selectedId === p.id

        return (
          <button
            key={p.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(p.id)}
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
              <h3 className="text-lg font-semibold text-[#3B1F1A]">{p.name}</h3>
              <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                ${p.price_base.toFixed(2)}
              </span>
            </div>
            {p.description ? (
              <p className="mt-1 line-clamp-2 text-sm text-gray-600">{p.description}</p>
            ) : null}
            {!p.available ? <p className="mt-2 text-sm font-medium text-red-600">Agotado</p> : null}
            {selected ? <p className="mt-2 text-sm text-[#6B8E62]">Seleccionada</p> : null}
          </button>
        )
      })}
    </div>
  )
}
