// apps/web/src/app/simulador/page.tsx V2
import { loadMenuDataForSimulatorV2 } from './actions'
import SimulatorClient from './SimulatorClient'

export const metadata = {
  title: 'Simulador | Trailer Burger Hall',
  description: 'Arma tu pedido y calcula el precio total'
}

export const dynamic = 'force-dynamic'

export default async function SimuladorPage() {
  const { products, modifiers } = await loadMenuDataForSimulatorV2()

  return (
    <main className="p-6 max-w-5xl mx-auto pb-32">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-[#3B1F1A] mb-2">Simulador de Pedido</h1>
        <p className="text-gray-600">
          Selecciona tus productos, personaliza con sabores y extras, y ve el total en tiempo real.
        </p>
      </header>

      <SimulatorClient
        products={products}
        modifiers={modifiers}
      />
    </main>
  )
}