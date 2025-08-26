'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  calcBurgerPriceClassic,
  calcHouseBurgerPrice,
  calcTorrePrice,
  calcPapasItalianasPrice,
} from '@/lib/pricing'

type VariantKind = 'normal' | 'double' | 'light' | 'casa' | 'torre'

type Protein = {
  id: string
  name: string
  price_base: number
  price_double: number
  price_light: number
  available?: boolean
}

type Flavor = {
  id: string
  name: string
  intensity: 'normal' | 'extremo'
  price_extra: number
  tags: string[] | null
  available?: boolean
}

type Extra = { id: string; name: string; price: number }

type PapasCfg = { basePrice: number; allowFlavors: boolean; flavorExtraNormal: number } | null

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="px-2 py-0.5 rounded-full text-xs border">{children}</span>
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <h2 className="font-semibold mb-3">{title}</h2>
      {children}
    </div>
  )
}

export default function SimulatorClient(props: {
  proteins: Protein[]
  flavors: Flavor[]
  flavorsMap: Record<string, Flavor>
  defaultsMap: Record<string, string[]>
  houseMap: Record<string, { price: number; includedIds: string[] }>
  torreMap: Record<string, number>
  papasCfg: PapasCfg
}) {
  const { proteins, flavors, flavorsMap, defaultsMap, houseMap, torreMap, papasCfg } = props

  // --------- estado de selección ---------
  const [proteinId, setProteinId] = useState<string>(proteins[0]?.id ?? '')
  const [variant, setVariant] = useState<VariantKind>('normal')
  const [selectedFlavorIds, setSelectedFlavorIds] = useState<string[]>([])
  const [selectedExtras, setSelectedExtras] = useState<Extra[]>([])
  const [simulatePapas, setSimulatePapas] = useState(false)
  const [papasFlavorIds, setPapasFlavorIds] = useState<string[]>([])

  // (Opcional) extras mock si aún no los traes por API
  const EXTRAS: Extra[] = [
    { id: 'queso', name: 'Queso', price: 10 },
    { id: 'tocino', name: 'Tocino', price: 20 },
    { id: 'carne', name: 'Carne extra', price: 50 },
  ]

  // defaults por proteína (Camarón/Salmon => Diabla+Mojo, Portobello => Chimi+Mojo)
  const defaultFlavorIds = defaultsMap[proteinId] ?? []

  // al cambiar de proteína, reseteamos sabores seleccionados para que tenga sentido la UI
  useEffect(() => {
    setSelectedFlavorIds(defaultFlavorIds)
  }, [proteinId])

  const protein = useMemo(() => proteins.find((p) => p.id === proteinId)!, [proteinId, proteins])

  // --------- cálculo de precios ---------
  const burgerPricing = useMemo(() => {
    if (!protein) return null

    // ¿Es "Casa"? (cuando el usuario elige esa modalidad desde variant)
    if (variant === 'casa') {
      const entry = houseMap[proteinId]
      if (!entry) return null
      return calcHouseBurgerPrice({
        housePrice: entry.price,
        includedFlavorIds: entry.includedIds, // vienen desde BD
        selectedFlavorIds,
        flavorsMap,
        extras: selectedExtras,
      })
    }

    // ¿Es Torre?
    if (variant === 'torre') {
      const price = protein.name.toLowerCase().includes('doble')
        ? (torreMap['Torre Doble'] ?? 130)
        : (torreMap['Torre Pizza'] ?? 100)
      return calcTorrePrice({
        torrePrice: price,
        addedFlavorIds: selectedFlavorIds, // sabores opcionales a Torre
        flavorsMap,
        extras: selectedExtras,
      })
    }

    // Clásica
    return calcBurgerPriceClassic({
      protein,
      variant,
      selectedFlavorIds,
      defaultFlavorIds, // si hay defaults, esos se incluyen gratis
      flavorsMap,
      extras: selectedExtras,
    })
  }, [
    protein,
    variant,
    selectedFlavorIds,
    defaultFlavorIds,
    selectedExtras,
    flavorsMap,
    houseMap,
    torreMap,
    proteinId,
  ])

  const papasPricing = useMemo(() => {
    if (!simulatePapas || !papasCfg) return null
    return calcPapasItalianasPrice({
      basePrice: papasCfg.basePrice, // 45 (en tu seed)
      flavorIds: papasFlavorIds,
      flavorsMap,
    })
  }, [simulatePapas, papasCfg, papasFlavorIds, flavorsMap])

  // --------- helpers UI ---------
  const toggleFlavor = (id: string) =>
    setSelectedFlavorIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )

  const toggleExtra = (e: Extra) =>
    setSelectedExtras((prev) => {
      const exists = prev.find((x) => x.id === e.id)
      return exists ? prev.filter((x) => x.id !== e.id) : [...prev, e]
    })

  const togglePapasFlavor = (id: string) =>
    setPapasFlavorIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  // ordenar sabores por grupo (picante/dulce/salado)
  const flavorsByGroup = useMemo(() => {
    const groups: Record<string, Flavor[]> = { Picante: [], Dulce: [], Salado: [], Otros: [] }
    for (const f of flavors) {
      const tag = (f.tags?.[0] ?? '').toLowerCase()
      if (tag === 'picante') groups['Picante'].push(f)
      else if (tag === 'dulce') groups['Dulce'].push(f)
      else if (tag === 'salado') groups['Salado'].push(f)
      else groups['Otros'].push(f)
    }
    Object.keys(groups).forEach((k) => groups[k].sort((a, b) => a.name.localeCompare(b.name)))
    return groups
  }, [flavors])

  return (
    <div className="grid gap-6">
      {/* Selección principal */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card title="1) Proteína">
          <div className="grid gap-2">
            {proteins.map((p) => (
              <button
                key={p.id}
                onClick={() => setProteinId(p.id)}
                className={`btn w-full text-left ${
                  proteinId === p.id ? 'border-amber-600 bg-amber-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{p.name}</span>
                  <span className="protein-price">Base ${p.price_base}</span>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card title="2) Variante">
          <div className="grid grid-cols-2 gap-2">
            {(['normal', 'double', 'light', 'casa', 'torre'] as VariantKind[]).map((v) => (
              <button
                key={v}
                onClick={() => setVariant(v)}
                className={`px-3 py-2 rounded-xl border ${
                  variant === v ? 'border-amber-600 bg-amber-50' : 'hover:bg-gray-50'
                }`}
              >
                <span className="capitalize">{v}</span>
              </button>
            ))}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {defaultFlavorIds.length > 0 ? (
              <p>
                Esta proteína incluye por defecto: <strong>{defaultFlavorIds.length}</strong>{' '}
                sabor(es).
              </p>
            ) : (
              <p>
                Sin defaults: incluye <strong>{variant === 'double' ? '2' : '1'}</strong> sabor(es)
                gratis.
              </p>
            )}
          </div>
        </Card>

        <Card title="3) Extras">
          <div className="grid gap-2">
            {EXTRAS.map((e) => {
              const active = !!selectedExtras.find((x) => x.id === e.id)
              return (
                <label key={e.id} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={active} onChange={() => toggleExtra(e)} />
                  <span>{e.name}</span>
                  <Badge>${e.price}</Badge>
                </label>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Sabores */}
      <Card title="4) Sabores">
        <div className="grid md:grid-cols-3 gap-6">
          {Object.entries(flavorsByGroup).map(([group, list]) => (
            <div key={group}>
              <h3 className="font-display text-sm tracking-wide mb-2 text-[--primary]">{group}</h3>
              <div className="grid gap-2">
                {list.map((f) => {
                  const active = selectedFlavorIds.includes(f.id)
                  const isDefault = defaultFlavorIds.includes(f.id)
                  return (
                    <label key={f.id} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={active} onChange={() => toggleFlavor(f.id)} />
                      <span>{f.name}</span>
                      {isDefault ? (
                        <Badge>Incluido</Badge>
                      ) : (
                        <Badge>{f.intensity === 'extremo' ? '+$10' : '+$5'}</Badge>
                      )}
                    </label>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Resumen burger */}
      <Card title="Resumen hamburguesa">
        {burgerPricing ? (
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm">Base</div>
              <div className="text-xl font-semibold">${burgerPricing.base}</div>
            </div>
            <div>
              <div className="text-sm mb-1">Sabores</div>
              <ul className="text-sm space-y-1">
                {burgerPricing.flavorsIncluded.map((id) => (
                  <li key={id} className="flex items-center gap-2">
                    <Badge>Incluido</Badge>
                    <span>{flavorsMap[id]?.name ?? id}</span>
                  </li>
                ))}
                {burgerPricing.flavorsCharged.map((c) => (
                  <li key={c.id} className="flex items-center gap-2">
                    <Badge>+${c.amount}</Badge>
                    <span>{flavorsMap[c.id]?.name ?? c.id}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-sm mb-1">Extras</div>
              <ul className="text-sm space-y-1">
                {burgerPricing.extras.length ? (
                  burgerPricing.extras.map((e) => (
                    <li key={e.id} className="flex items-center gap-2">
                      <Badge>+${e.amount}</Badge>
                      <span>{EXTRAS.find((x) => x.id === e.id)?.name ?? e.id}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">Sin extras</li>
                )}
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-gray-500 text-sm">Selecciona opciones para ver el total.</div>
        )}

        <div className="mt-4 flex items-center justify-between border-t pt-3">
          <div className="text-sm text-gray-600">
            Variante: <strong className="capitalize">{variant}</strong>
          </div>
          <div className="text-2xl font-display font-bold text-[--primary]">
            Total: ${burgerPricing?.total ?? 0}
          </div>
        </div>
      </Card>

      {/* Papas Italianas (opcional) */}
      {papasCfg && (
        <Card title="Papas Italianas (opcional)">
          <div className="flex items-center gap-4 mb-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={simulatePapas}
                onChange={() => setSimulatePapas((v) => !v)}
              />
              <span>Agregar Papas Italianas</span>
            </label>
            <Badge>Base ${papasCfg.basePrice}</Badge>
          </div>

          {simulatePapas && (
            <>
              <div className="grid md:grid-cols-3 gap-6">
                {Object.entries(flavorsByGroup).map(([group, list]) => (
                  <div key={group}>
                    <h3 className="font-display text-sm tracking-wide mb-2 text-[--primary]">
                      {group}
                    </h3>
                    <div className="grid gap-2">
                      {list.map((f) => {
                        const active = papasFlavorIds.includes(f.id)
                        return (
                          <label key={f.id} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={active}
                              onChange={() => togglePapasFlavor(f.id)}
                            />
                            <span>{f.name}</span>
                            <Badge>{f.intensity === 'extremo' ? '+$10' : '+$5'}</Badge>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between border-t pt-3">
                <div className="text-sm text-gray-600">
                  Primer sabor incluido; adicionales +$5 / +$10 Extremo.
                </div>
                <div className="text-2xl font-bold">
                  Total Papas: ${papasPricing?.total ?? papasCfg.basePrice}
                </div>
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  )
}
