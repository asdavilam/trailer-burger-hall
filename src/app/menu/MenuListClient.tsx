'use client'

import React from 'react'
import Image from 'next/image'
import useSWR from 'swr'
import type { MenuSection, MenuItem, MenuPrice } from './types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

/* =============================
   Tokens de estilo
============================= */
const CARD_BASE = 'rounded-2xl border border-stone-200 bg-white shadow-sm'
const GRID_GAP = 'gap-5 md:gap-6'
const GRID_COMPACT = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' // Sabores
const GRID_LARGE = 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2' // Resto (2 cols fijas)

/* =============================
   Pills
============================= */
function PricePill({ price, size = 'md' }: { price: MenuPrice; size?: 'md' | 'lg' }) {
  const label = price.label ? `${price.label} ` : ''
  const pad = size === 'lg' ? 'px-3.5 py-1 text-sm' : 'px-2.5 py-[2px] text-[13px]'
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 text-stone-800 ${pad}`}>
      <span className="sr-only">Precio</span>
      <span aria-hidden>{label}</span>
      <span aria-hidden className="font-mono tabular-nums">${price.value}</span>
    </span>
  )
}

function TagPill({ text }: { text: string }) {
  return (
    <span className="inline-block rounded-full border border-stone-200 bg-stone-100 px-2 py-0.5 text-xs text-stone-700">
      {text}
    </span>
  )
}

/* =============================
   Card de Item
============================= */
function MenuItemCard({ item, variant = 'compact' }: { item: MenuItem; variant?: 'compact' | 'large' }) {
  const isLarge = variant === 'large'

  const TitleAndMeta = ({ textScale = 'base' as 'base' | 'lg' }) => (
    <>
      <h3
        id={`item-${item.id}-title`}
        className={`${textScale === 'lg' ? 'text-lg' : 'text-base'} font-semibold text-stone-900 leading-6 break-words md:hyphens-none`}
      >
        {item.name}
        {item.badges?.includes('estrella') && <span className="ml-2 inline-block text-amber-500" aria-hidden>⭐</span>}
      </h3>

      {item.description && (
        <p className={`${textScale === 'lg' ? 'text-base' : 'text-sm'} mt-1 text-stone-600 break-words md:hyphens-none`}>
          {item.description}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {item.prices?.map((p, i) => <PricePill price={p} key={i} size={isLarge ? 'lg' : 'md'} />)}
        {item.tags?.slice(0, 3).map((t) => <TagPill text={t} key={t} />)}
      </div>

      {item.note && <p className="mt-2 text-xs text-stone-500">{item.note}</p>}
    </>
  )

  return (
    <article
      aria-labelledby={`item-${item.id}-title`}
      className={`${CARD_BASE} ${isLarge ? 'p-4 md:p-5' : 'p-4'} ${item.available === false ? 'opacity-60' : ''}`}
    >
      {isLarge ? (
        <div className="flex flex-col xl:flex-row xl:items-start gap-4 xl:gap-5">
          {/* Imagen: ratio en móvil; ancho fijo contenido en XL+ */}
          <div className="relative w-full aspect-[4/3] overflow-hidden rounded-xl bg-stone-100 xl:w-48 xl:aspect-auto xl:h-40 2xl:w-56 2xl:h-44 flex-shrink-0">
            {item.image ? (
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="(max-width: 1280px) 100vw, (max-width: 1536px) 192px, 224px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-stone-400">No image</div>
            )}
          </div>

          {/* Texto: flex-1 sin min-width para no forzar columnas estrechas */}
          <div className="min-w-0 flex-1">
            <TitleAndMeta textScale="lg" />
          </div>
        </div>
      ) : (
        <div className="min-w-0">
          <TitleAndMeta textScale="base" />
        </div>
      )}

      {item.includes && (
        <div className="mt-3 text-xs text-stone-500">Incluye: {item.includes.join(', ')}</div>
      )}
      {item.available === false && (
        <div className="mt-2 text-sm text-red-600">No disponible</div>
      )}
    </article>
  )
}

/* =============================
   Grid de Sección
============================= */
function MenuSectionGrid({ section, variant = 'compact' }: { section: MenuSection; variant?: 'compact' | 'large' }) {
  const isLarge = variant === 'large'
  const isCards = section.layout !== 'list'

  return (
    <section aria-labelledby={`section-${section.id}`} className="pt-8">
      <header className="mb-3">
        <h2 className="text-xl font-semibold text-stone-900 tracking-tight">{section.title}</h2>
        {section.subtitle && <p className="text-sm text-stone-600">{section.subtitle}</p>}
      </header>

      {isCards ? (
        <div className={`${isLarge ? GRID_LARGE : GRID_COMPACT} ${GRID_GAP} items-stretch`}>
          {section.items.map((it) => (
            <MenuItemCard key={it.id} item={it} variant={isLarge ? 'large' : 'compact'} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-stone-200">
          {section.items.map((it) => (
            <div key={it.id} className="py-3">
              <MenuItemCard item={it} variant={isLarge ? 'large' : 'compact'} />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

/* =============================
   Tabs de secciones
============================= */
function SectionTabs({ sections, activeId, onChange }: {
  sections: MenuSection[]
  activeId: string
  onChange: (id: string) => void
}) {
  return (
    <div className="mt-6 sticky top-[64px] z-10 flex w-full gap-2 overflow-x-auto rounded-xl border border-stone-200 bg-white/95 backdrop-blur p-2">
      {sections.map((s) => {
        const active = s.id === activeId
        return (
          <button
            key={s.id}
            onClick={() => onChange(s.id)}
            className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition
              ${active ? 'bg-amber-100 text-stone-900 border border-amber-200'
                       : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200'}`}
            aria-pressed={active}
          >
            {s.title.replace('Hamburguesas — ', '')}
          </button>
        )
      })}
    </div>
  )
}

/* =============================
   MenuListClient
============================= */
export default function MenuListClient({ initial }: { initial: MenuSection[] }) {
  const { data } = useSWR<MenuSection[]>('/api/menu', fetcher, { fallbackData: initial })

  const raw = (data ?? initial) as any
  const sections: MenuSection[] = Array.isArray(raw) ? raw : Array.isArray(raw?.sections) ? raw.sections : []

  const sabores = sections.find((s) => s.id === 'sabores') || null
  const others = sections.filter((s) => s.id !== 'sabores')

  const [active, setActive] = React.useState<string>(others[0]?.id ?? 'clasicas')

  React.useEffect(() => {
    if (!others.find((s) => s.id === active)) {
      setActive(others[0]?.id ?? 'clasicas')
    }
  }, [others, active])

  return (
    <div className="space-y-10">
      {sabores && <MenuSectionGrid section={sabores} variant="compact" />}

      {others.length > 0 && (
        <>
          <SectionTabs sections={others} activeId={active} onChange={setActive} />
          {others.filter((s) => s.id === active).map((s) => (
            <div key={s.id} className="pt-6">
              <MenuSectionGrid section={s} variant="large" />
            </div>
          ))}
        </>
      )}

      {sections.length === 0 && (
        <div className="rounded-md border border-stone-200 p-4 text-center text-sm text-stone-600">
          Menú temporalmente no disponible.
        </div>
      )}
    </div>
  )
}