import Link from 'next/link'
import MenuInformativo from './MenuInformativo'
import { fetchMenuSectionsFromDb } from '@/lib/menu-dal'
import type { MenuSection } from '@trailer/shared'

export const metadata = {
  title: 'Menú — Trailer Burger Hall',
  description: 'Carta digital: hamburguesas, sabores, extras y bebidas.',
}

export const revalidate = 60 // ISR: revalida cada 60 segundos
export const dynamic = 'force-dynamic' // Force dynamic rendering to prevent build-time errors

export default async function MenuPage() {
  // Fetch menu data server-side with fallback for build time
  let menuSections: MenuSection[] = []
  try {
    menuSections = await fetchMenuSectionsFromDb()
  } catch (error) {
    console.error('Error fetching menu sections:', error)
    menuSections = []
  }

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

      <MenuInformativo menuSections={menuSections} />
    </main>
  )
}
