/* eslint-disable @typescript-eslint/no-explicit-any */
import { loadMenuDataForSimulator } from './actions'
import SimulatorClient from './SimulatorClient'

export default async function SimuladorPage() {
  const { proteins, flavors, flavorsMap, defaultsMap, houseMap, torreMap, papasCfg } =
    await loadMenuDataForSimulator()

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-display tracking-wide mb-2">Simulador</h1>
      <p className="text-sm text-gray-500 mb-6">
        ⚠️ Este simulador está en desarrollo. Los precios y configuraciones mostrados podrían contener errores.
      </p>

      <SimulatorClient
        proteins={proteins as any}
        flavors={flavors as any}
        flavorsMap={flavorsMap as any}
        defaultsMap={defaultsMap}
        houseMap={houseMap}
        torreMap={torreMap}
        papasCfg={papasCfg}
      />
    </main>
  )
}