'use server'

import {
  getProteins,
  getFlavors,
  getProteinFlavorDefaults,
  getHouseRules,
  getTorrePrices,
  getPapasItalianasConfig,
} from '@/lib/menu-data'

export async function loadMenuDataForSimulator() {
  const [proteins, flavors, defaultsMap, houseMap, torreMap, papasCfg] = await Promise.all([
    getProteins(),
    getFlavors(),
    getProteinFlavorDefaults(),
    getHouseRules(),
    getTorrePrices(),
    getPapasItalianasConfig(),
  ])

  // Mapa rápido id->flavor para el motor de precios
  const flavorsMap = Object.fromEntries(
    flavors.map((f) => [
      f.id,
      { id: f.id, name: f.name, intensity: f.intensity, price_extra: f.price_extra ?? 0 },
    ]),
  )

  return { proteins, flavors, flavorsMap, defaultsMap, houseMap, torreMap, papasCfg }
}
