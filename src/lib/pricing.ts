// lib/pricing.ts

export type VariantKind = 'normal' | 'double' | 'light' | 'casa' | 'torre'

export type Protein = {
  id: string
  name: string
  price_base: number // compat con tu frontend (sin tocar consultas)
  price_double: number
  price_light: number
  available?: boolean
}

export type Flavor = {
  id: string
  name: string
  intensity: 'normal' | 'extremo'
  price_extra: number // 5 o 10 (ya lo mapeamos en BD a price_extra)
  available?: boolean
}

export type Extra = {
  id: string
  name: string
  price: number
}

export type PriceBreakdown = {
  base: number
  flavorsIncluded: string[] // ids incluidos gratis
  flavorsCharged: { id: string; amount: number }[]
  extras: { id: string; amount: number }[]
  total: number
}

const sum = (ns: number[]) => ns.reduce((a, b) => a + b, 0)

/**
 * Determina cuántos sabores van incluidos gratis si NO hay defaults de BD.
 * Regla: normal => 1, double => 2, light => 1
 */
function includedCountByVariant(variant: VariantKind): number {
  switch (variant) {
    case 'double':
      return 2
    case 'normal':
    case 'light':
    default:
      return 1
  }
}

/**
 * Calcula total de sabores extra a cobrar.
 * @param selectedIds   ids de sabores elegidos por el cliente (ordenados según UI)
 * @param includedIds   ids de sabores incluidos gratis (defaults o por variante)
 * @param flavorsMap    mapa id -> Flavor (para conocer intensidad y price_extra)
 */
function calcFlavorCharges(
  selectedIds: string[],
  includedIds: string[],
  flavorsMap: Record<string, Flavor>,
): { charged: { id: string; amount: number }[]; included: string[] } {
  const includedSet = new Set(includedIds)
  const charged: { id: string; amount: number }[] = []
  const included: string[] = []

  for (const id of selectedIds) {
    if (includedSet.has(id)) {
      included.push(id)
      continue
    }
    const f = flavorsMap[id]
    if (!f) continue
    // Si no está incluido, se cobra según intensidad (price_extra ya es 5 u 10)
    charged.push({ id, amount: f.price_extra })
  }

  return { charged, included }
}

export function calcExtrasTotal(extras: Extra[] | undefined): number {
  if (!extras || !extras.length) return 0
  return sum(extras.map((e) => e.price))
}

/**
 * Precio para hamburguesas "clásicas" (Res/Pollo/Camarón/Salmón/Portobello)
 * con variantes normal/double/light.
 *
 * @param protein            proteína elegida
 * @param variant            'normal' | 'double' | 'light'
 * @param selectedFlavorIds  sabores elegidos por el cliente (ids)
 * @param defaultFlavorIds   sabores por defecto de la proteína (ids desde protein_flavor_defaults)
 * @param flavorsMap         mapa id->Flavor (con intensity y price_extra)
 * @param extras             extras (queso/tocino/carne extra)
 */
export function calcBurgerPriceClassic(params: {
  protein: Protein
  variant: Exclude<VariantKind, 'casa' | 'torre'>
  selectedFlavorIds: string[]
  defaultFlavorIds?: string[]
  flavorsMap: Record<string, Flavor>
  extras?: Extra[]
}): PriceBreakdown {
  const {
    protein,
    variant,
    selectedFlavorIds,
    defaultFlavorIds = [],
    flavorsMap,
    extras = [],
  } = params

  // 1) Base por variante
  const base =
    variant === 'double'
      ? protein.price_double
      : variant === 'light'
        ? protein.price_light
        : protein.price_base

  // 2) Determinar sabores incluidos
  //    - Si hay defaults, esos van incluidos gratis.
  //    - Si NO hay defaults, va incluido 1 (o 2 si 'double').
  const includedDefaults = defaultFlavorIds.length > 0
  let includedIds: string[] = []

  if (includedDefaults) {
    includedIds = [...new Set(defaultFlavorIds)]
  } else {
    const freeCount = includedCountByVariant(variant)
    includedIds = selectedFlavorIds.slice(0, freeCount)
  }

  // 3) Cobrar sabores adicionales (no incluidos)
  const flavorCalc = calcFlavorCharges(selectedFlavorIds, includedIds, flavorsMap)

  // 4) Extras (queso/tocino/carne extra)
  const extrasTotal = calcExtrasTotal(extras)

  const total = base + sum(flavorCalc.charged.map((c) => c.amount)) + extrasTotal

  return {
    base,
    flavorsIncluded: flavorCalc.included,
    flavorsCharged: flavorCalc.charged,
    extras: extras.map((e) => ({ id: e.id, amount: e.price })),
    total,
  }
}

/**
 * Hamburguesas de la Casa (precio fijo).
 * @param housePrice         precio fijo según proteína secundaria
 * @param selectedFlavorIds  sabores extra elegidos
 * @param includedFlavorIds  sabores incluidos por la regla de la Casa
 * @param flavorsMap         mapa id->Flavor (para conocer price_extra)
 * @param extras             extras (queso/tocino/carne extra)
 */
export function calcHouseBurgerPrice(params: {
  housePrice: number
  selectedFlavorIds: string[]
  includedFlavorIds: string[] // e.g. ["Chimi","Mojo", ... ids reales]
  flavorsMap: Record<string, Flavor>
  extras?: Extra[]
}): PriceBreakdown {
  const { housePrice, selectedFlavorIds, includedFlavorIds, flavorsMap, extras = [] } = params

  const flavorCalc = calcFlavorCharges(selectedFlavorIds, includedFlavorIds, flavorsMap)
  const extrasTotal = calcExtrasTotal(extras)

  const total = housePrice + sum(flavorCalc.charged.map((c) => c.amount)) + extrasTotal

  return {
    base: housePrice,
    flavorsIncluded: flavorCalc.included,
    flavorsCharged: flavorCalc.charged,
    extras: extras.map((e) => ({ id: e.id, amount: e.price })),
    total,
  }
}

/**
 * Torre Pizza / Torre Doble (precio fijo).
 */
export function calcTorrePrice(params: {
  torrePrice: number
  addedFlavorIds?: string[]
  flavorsMap: Record<string, Flavor>
  extras?: Extra[]
}): PriceBreakdown {
  const { torrePrice, addedFlavorIds = [], flavorsMap, extras = [] } = params

  // Torre ya incluye su salsa/quesos. Cualquier sabor adicional se cobra.
  const flavorCalc = calcFlavorCharges(addedFlavorIds, [], flavorsMap)
  const extrasTotal = calcExtrasTotal(extras)

  const total = torrePrice + sum(flavorCalc.charged.map((c) => c.amount)) + extrasTotal

  return {
    base: torrePrice,
    flavorsIncluded: [],
    flavorsCharged: flavorCalc.charged,
    extras: extras.map((e) => ({ id: e.id, amount: e.price })),
    total,
  }
}

/**
 * Papas Italianas: base + primer sabor incluido + extras cobrados
 * - El primer sabor (según orden de selección) va gratis.
 * - Sabores adicionales: +$5 normal / +$10 extremo (price_extra).
 */
export function calcPapasItalianasPrice(params: {
  basePrice: number // 45
  flavorIds: string[] // sabores elegidos (en orden)
  flavorsMap: Record<string, Flavor>
}): PriceBreakdown {
  const { basePrice, flavorIds, flavorsMap } = params

  const included: string[] = []
  const charged: { id: string; amount: number }[] = []

  flavorIds.forEach((id, idx) => {
    const f = flavorsMap[id]
    if (!f) return
    if (idx === 0) {
      // primer sabor incluido
      included.push(id)
    } else {
      charged.push({ id, amount: f.price_extra })
    }
  })

  const total = basePrice + charged.reduce((sum, c) => sum + c.amount, 0)

  return {
    base: basePrice,
    flavorsIncluded: included,
    flavorsCharged: charged,
    extras: [],
    total,
  }
}
