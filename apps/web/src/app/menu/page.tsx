
import Link from 'next/link'
import MenuInformativo from './MenuInformativo'

export const metadata = {
  title: 'Menú — Trailer Burger Hall',
  description: 'Carta digital: hamburguesas, sabores, extras y bebidas.',
}

export default async function MenuPage() {
  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-[#3B1F1A]">Menú</h1>
        <p className="text-gray-700">
          Consulta nuestras opciones y precios. ¿Quieres armar tu combinación?{' '}
          <Link
            href="/simulador"
            className="font-semibold text-[#6B8E62] hover:text-[#C08A3E] underline"
          >
            Ir al simulador
          </Link>
        </p>
      </header>

      <MenuInformativo menuSections={[]} />
    </main>
  )
}
