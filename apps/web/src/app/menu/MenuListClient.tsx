'use client'

import React from 'react'
import Image from 'next/image'
import useSWR from 'swr'
import type { MenuSection, MenuItem, MenuPrice } from '@trailer/shared'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

/* =============================
   Types for Products & Extras
============================= */
type ProductPrice = {
  price: number
  variant: string | null
}

type Product = {
  id: string
  name: string
  description: string | null
  type: string
  available?: boolean
  image_url?: string | null
  prices: ProductPrice[]
}

type Extra = {
  id: string
  name: string
  description: string | null
  price: number
  available: boolean
}

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
   Card de Product
============================= */
function ProductCard({ product, variant = 'large' }: { product: Product; variant?: 'compact' | 'large' }) {
  const isLarge = variant === 'large'
  const isAvailable = product.available ?? true // Default to true if not specified

  return (
    <article
      aria-labelledby={`product-${product.id}-title`}
      className={`${CARD_BASE} ${isLarge ? 'p-4 md:p-5' : 'p-4'} ${!isAvailable ? 'opacity-60' : ''}`}
    >
      <div className="flex flex-col xl:flex-row xl:items-start gap-4 xl:gap-5">
        {/* Imagen */}
        <div className="relative w-full aspect-[4/3] overflow-hidden rounded-xl bg-stone-100 xl:w-48 xl:aspect-auto xl:h-40 2xl:w-56 2xl:h-44 flex-shrink-0">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 1280px) 100vw, (max-width: 1536px) 192px, 224px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-stone-400">No image</div>
          )}
        </div>

        {/* Contenido */}
        <div className="min-w-0 flex-1">
          <h3
            id={`product-${product.id}-title`}
            className="text-lg font-semibold text-stone-900 leading-6"
          >
            {product.name}
          </h3>

          {product.description && (
            <p className="text-base mt-1 text-stone-600">
              {product.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {product.prices?.map((p, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 text-stone-800 px-3.5 py-1 text-sm"
              >
                {p.variant && <span>{p.variant}</span>}
                <span className="font-mono tabular-nums">${p.price}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {!isAvailable && (
        <div className="mt-2 text-sm text-red-600">No disponible</div>
      )}
    </article>
  )
}

/* =============================
   Card de Extra
============================= */
function ExtraCard({ extra }: { extra: Extra }) {
  return (
    <article
      aria-labelledby={`extra-${extra.id}-title`}
      className={`${CARD_BASE} p-4 ${!extra.available ? 'opacity-60' : ''}`}
    >
      <div className="min-w-0">
        <h3
          id={`extra-${extra.id}-title`}
          className="text-base font-semibold text-stone-900 leading-6"
        >
          {extra.name}
        </h3>

        {extra.description && (
          <p className="text-sm mt-1 text-stone-600">
            {extra.description}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 text-stone-800 px-2.5 py-[2px] text-[13px]">
            <span className="font-mono tabular-nums">${extra.price}</span>
          </span>
        </div>
      </div>

      {!extra.available && (
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
   Título de Sección
============================= */
function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-4 mt-12">
      <h2 className="text-2xl font-bold text-stone-900 tracking-tight">{title}</h2>
      {subtitle && <p className="text-sm text-stone-600 mt-1">{subtitle}</p>}
    </header>
  )
}

/* =============================
   Skeleton de Carga
============================= */
function MenuSkeleton() {
  return (
    <div className="space-y-10 animate-pulse">
      {/* Sección Hero (Sabores) */}
      <div className="space-y-4">
        <div className="h-8 w-48 bg-stone-200 rounded" />
        <div className="h-4 w-full max-w-2xl bg-stone-100 rounded" />
        <div className={GRID_COMPACT + ' ' + GRID_GAP}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-stone-100 border border-stone-200" />
          ))}
        </div>
      </div>

      {/* Sección Clásicas */}
      <div className="space-y-4 pt-4">
        <div className="h-8 w-64 bg-stone-200 rounded" />
        <div className={GRID_LARGE + ' ' + GRID_GAP}>
          {[1, 2].map((i) => (
            <div key={i} className="h-40 rounded-2xl bg-stone-100 border border-stone-200" />
          ))}
        </div>
      </div>
    </div>
  )
}

/* =============================
   MenuListClient
============================= */
type SectionsPayload = MenuSection[] | { sections: MenuSection[] }

export default function MenuListClient({ initial }: { initial: MenuSection[] }) {
  // Fetch menu sections (hamburguesas)
  const { data, isLoading, isValidating } = useSWR<MenuSection[]>('/api/menu', fetcher, {
    fallbackData: initial,
    revalidateOnFocus: false
  })

  // Fetch products (papas y otros)
  const { data: sidesData } = useSWR<Product[]>('/api/products?type=side', fetcher, {
    revalidateOnFocus: false
  })

  const { data: othersData } = useSWR<Product[]>('/api/products?type=other', fetcher, {
    revalidateOnFocus: false
  })

  // Fetch extras
  const { data: extrasData } = useSWR<Extra[]>('/api/extras', fetcher, {
    revalidateOnFocus: false
  })

  const raw = (data ?? initial) as SectionsPayload
  const sections: MenuSection[] = Array.isArray(raw) ? raw : Array.isArray(raw?.sections) ? raw.sections : []

  // Categorizar secciones de hamburguesas
  const sabores = sections.find((s) => s.id === 'sabores') || null
  const hamburguesas = sections.filter((s) => s.id !== 'sabores')

  // Categorizar productos por nombre
  const papasFrancesas = (sidesData ?? []).filter((p) => p.name.toLowerCase().includes('francesa'))
  const papasItalianas = (sidesData ?? []).filter((p) => p.name.toLowerCase().includes('italiana'))
  const papasCanicas = (sidesData ?? []).filter((p) => p.name.toLowerCase().includes('canica'))

  const banderillas = (othersData ?? []).filter((p) => p.name.toLowerCase().includes('banderilla'))
  const hotDogs = (othersData ?? []).filter((p) => p.name.toLowerCase().includes('hot dog') && !p.name.toLowerCase().includes('jumbo'))
  const hotDogsJumbo = (othersData ?? []).filter((p) => p.name.toLowerCase().includes('hot dog jumbo'))
  const nuggets = (othersData ?? []).filter((p) => p.name.toLowerCase().includes('nugget'))

  // Categorizar extras por nombre
  const extrasQueso = (extrasData ?? []).filter((e) => e.name.toLowerCase().includes('queso'))
  const extrasCarne = (extrasData ?? []).filter((e) => e.name.toLowerCase().includes('carne'))
  const extrasTocino = (extrasData ?? []).filter((e) => e.name.toLowerCase().includes('tocino'))

  // Estados activos para cada grupo de tabs
  const [activeHamburguesa, setActiveHamburguesa] = React.useState<string>(hamburguesas[0]?.id ?? '')
  const [activePapas, setActivePapas] = React.useState<'francesas' | 'italianas' | 'canicas'>('francesas')
  const [activeOtros, setActiveOtros] = React.useState<'banderillas' | 'hotdog' | 'hotdogjumbo' | 'nuggets'>('banderillas')
  const [activeExtras, setActiveExtras] = React.useState<'queso' | 'carne' | 'tocino'>('queso')

  React.useEffect(() => {
    if (hamburguesas.length > 0 && !hamburguesas.find((s) => s.id === activeHamburguesa)) {
      setActiveHamburguesa(hamburguesas[0].id)
    }
  }, [hamburguesas, activeHamburguesa])

  // Lógica de carga
  const showSkeleton = sections.length === 0 && (isLoading || isValidating)
  const showEmpty = sections.length === 0 && !showSkeleton

  if (showSkeleton) {
    return <MenuSkeleton />
  }

  // Determinar qué mostrar en cada categoría
  const hasPapas = papasFrancesas.length > 0 || papasItalianas.length > 0 || papasCanicas.length > 0
  const hasOtros = banderillas.length > 0 || hotDogs.length > 0 || hotDogsJumbo.length > 0 || nuggets.length > 0
  const hasExtras = extrasQueso.length > 0 || extrasCarne.length > 0 || extrasTocino.length > 0

  return (
    <div className="space-y-10">
      {/* Sabores */}
      {sabores && <MenuSectionGrid section={sabores} variant="compact" />}

      {/* Hamburguesas Tabs */}
      {hamburguesas.length > 0 && (
        <>
          <SectionHeader title="Hamburguesas" subtitle="Elige entre nuestras deliciosas opciones" />
          <SectionTabs sections={hamburguesas} activeId={activeHamburguesa} onChange={setActiveHamburguesa} />
          {hamburguesas.filter((s) => s.id === activeHamburguesa).map((s) => (
            <div key={s.id} className="pt-6">
              <MenuSectionGrid section={s} variant="large" />
            </div>
          ))}
        </>
      )}

      {/* Papas Tabs */}
      {hasPapas && (
        <>
          <SectionHeader title="Papas" subtitle="Nuestras especialidades en papas" />
          <div className="mt-6 sticky top-[64px] z-10 flex w-full gap-2 overflow-x-auto rounded-xl border border-stone-200 bg-white/95 backdrop-blur p-2">
            {papasFrancesas.length > 0 && (
              <button
                onClick={() => setActivePapas('francesas')}
                className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition
                  ${activePapas === 'francesas' ? 'bg-amber-100 text-stone-900 border border-amber-200'
                    : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200'}`}
                aria-pressed={activePapas === 'francesas'}
              >
                Papas Francesas
              </button>
            )}
            {papasItalianas.length > 0 && (
              <button
                onClick={() => setActivePapas('italianas')}
                className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition
                  ${activePapas === 'italianas' ? 'bg-amber-100 text-stone-900 border border-amber-200'
                    : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200'}`}
                aria-pressed={activePapas === 'italianas'}
              >
                Papas Italianas
              </button>
            )}
            {papasCanicas.length > 0 && (
              <button
                onClick={() => setActivePapas('canicas')}
                className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition
                  ${activePapas === 'canicas' ? 'bg-amber-100 text-stone-900 border border-amber-200'
                    : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200'}`}
                aria-pressed={activePapas === 'canicas'}
              >
                Papas Canicas
              </button>
            )}
          </div>
          <div className="pt-6">
            <div className={`${GRID_LARGE} ${GRID_GAP} items-stretch`}>
              {activePapas === 'francesas' && papasFrancesas.map((p) => <ProductCard key={p.id} product={p} />)}
              {activePapas === 'italianas' && papasItalianas.map((p) => <ProductCard key={p.id} product={p} />)}
              {activePapas === 'canicas' && papasCanicas.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </>
      )}

      {/* Otros Tabs */}
      {hasOtros && (
        <>
          <SectionHeader title="Otros" subtitle="Más opciones deliciosas" />
          <div className="mt-6 sticky top-[64px] z-10 flex w-full gap-2 overflow-x-auto rounded-xl border border-stone-200 bg-white/95 backdrop-blur p-2">
            {banderillas.length > 0 && (
              <button
                onClick={() => setActiveOtros('banderillas')}
                className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition
                  ${activeOtros === 'banderillas' ? 'bg-amber-100 text-stone-900 border border-amber-200'
                    : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200'}`}
                aria-pressed={activeOtros === 'banderillas'}
              >
                Banderillas
              </button>
            )}
            {hotDogs.length > 0 && (
              <button
                onClick={() => setActiveOtros('hotdog')}
                className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition
                  ${activeOtros === 'hotdog' ? 'bg-amber-100 text-stone-900 border border-amber-200'
                    : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200'}`}
                aria-pressed={activeOtros === 'hotdog'}
              >
                Hot Dog
              </button>
            )}
            {hotDogsJumbo.length > 0 && (
              <button
                onClick={() => setActiveOtros('hotdogjumbo')}
                className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition
                  ${activeOtros === 'hotdogjumbo' ? 'bg-amber-100 text-stone-900 border border-amber-200'
                    : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200'}`}
                aria-pressed={activeOtros === 'hotdogjumbo'}
              >
                Hot Dog Jumbo
              </button>
            )}
            {nuggets.length > 0 && (
              <button
                onClick={() => setActiveOtros('nuggets')}
                className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition
                  ${activeOtros === 'nuggets' ? 'bg-amber-100 text-stone-900 border border-amber-200'
                    : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200'}`}
                aria-pressed={activeOtros === 'nuggets'}
              >
                Nuggets
              </button>
            )}
          </div>
          <div className="pt-6">
            <div className={`${GRID_LARGE} ${GRID_GAP} items-stretch`}>
              {activeOtros === 'banderillas' && banderillas.map((p) => <ProductCard key={p.id} product={p} />)}
              {activeOtros === 'hotdog' && hotDogs.map((p) => <ProductCard key={p.id} product={p} />)}
              {activeOtros === 'hotdogjumbo' && hotDogsJumbo.map((p) => <ProductCard key={p.id} product={p} />)}
              {activeOtros === 'nuggets' && nuggets.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </>
      )}

      {/* Extras Tabs */}
      {hasExtras && (
        <>
          <SectionHeader title="Extras" subtitle="Personaliza tu orden" />
          <div className="mt-6 sticky top-[64px] z-10 flex w-full gap-2 overflow-x-auto rounded-xl border border-stone-200 bg-white/95 backdrop-blur p-2">
            {extrasQueso.length > 0 && (
              <button
                onClick={() => setActiveExtras('queso')}
                className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition
                  ${activeExtras === 'queso' ? 'bg-amber-100 text-stone-900 border border-amber-200'
                    : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200'}`}
                aria-pressed={activeExtras === 'queso'}
              >
                Queso
              </button>
            )}
            {extrasCarne.length > 0 && (
              <button
                onClick={() => setActiveExtras('carne')}
                className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition
                  ${activeExtras === 'carne' ? 'bg-amber-100 text-stone-900 border border-amber-200'
                    : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200'}`}
                aria-pressed={activeExtras === 'carne'}
              >
                Carne
              </button>
            )}
            {extrasTocino.length > 0 && (
              <button
                onClick={() => setActiveExtras('tocino')}
                className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition
                  ${activeExtras === 'tocino' ? 'bg-amber-100 text-stone-900 border border-amber-200'
                    : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200'}`}
                aria-pressed={activeExtras === 'tocino'}
              >
                Tocino
              </button>
            )}
          </div>
          <div className="pt-6">
            <div className={`${GRID_COMPACT} ${GRID_GAP} items-stretch`}>
              {activeExtras === 'queso' && extrasQueso.map((e) => <ExtraCard key={e.id} extra={e} />)}
              {activeExtras === 'carne' && extrasCarne.map((e) => <ExtraCard key={e.id} extra={e} />)}
              {activeExtras === 'tocino' && extrasTocino.map((e) => <ExtraCard key={e.id} extra={e} />)}
            </div>
          </div>
        </>
      )}

      {showEmpty && (
        <div className="rounded-md border border-stone-200 p-8 text-center">
          <p className="text-lg font-medium text-stone-900">Menú no disponible</p>
          <p className="text-sm text-stone-500 mt-1">Estamos actualizando nuestra carta. Vuelve en unos momentos.</p>
        </div>
      )}
    </div>
  )
}