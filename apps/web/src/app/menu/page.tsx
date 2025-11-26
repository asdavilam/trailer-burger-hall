import { getMenuV2, getModifiersV2 } from '@/lib/data-v2'
import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'
import { V2Product, V2Modifier } from '@trailer/shared'

export const metadata: Metadata = {
  title: 'Menú | Trailer Burger Hall',
  description: 'Carta digital: hamburguesas, sabores, extras y bebidas.',
}

export const dynamic = 'force-dynamic'

export default async function MenuPage() {
  const [menu, allModifiers] = await Promise.all([
    getMenuV2(),
    getModifiersV2()
  ])

  // --- 1. CLASIFICACIÓN DE SABORES ---
  const flavors = allModifiers.filter(m => m.type === 'flavor')
  const extras = allModifiers.filter(m => m.type === 'extra')

  // --- 2. CLASIFICACIÓN INTELIGENTE DE HAMBURGUESAS ---
  // En lugar de mostrar "Res" con 4 botones, vamos a mostrar "Res" en 3 secciones distintas.

  // A. CLÁSICAS (Res y Pollo -> Solo Normal y Doble)
  const classicBurgers = menu.filter(p =>
    p.category === 'protein_base' &&
    (p.name.toLowerCase().includes('res') || p.name.toLowerCase().includes('pollo'))
  )

  // B. DEL MAR (Camarón y Salmón -> Solo Normal y Doble)
  const seaBurgers = menu.filter(p =>
    p.category === 'protein_base' &&
    (p.name.toLowerCase().includes('camarón') || p.name.toLowerCase().includes('salmón'))
  )

  // C. DE LA CASA (Cualquier proteína que tenga variante 'casa')
  // Aquí mostramos el producto PERO enfocados en su versión "Casa"
  const houseSpecials = menu.filter(p => p.variants?.some((v) => v.name === 'casa'))

  // D. LÍNEA LIGHT (Cualquier proteína -> Solo variante Light)
  const lightMenu = menu.filter(p =>
    p.category === 'protein_base' &&
    p.variants?.some((v) => v.name === 'light')
  )

  // E. VEGETARIANA (Portobello -> Normal y Doble)
  const vegBurgers = menu.filter(p =>
    p.category === 'protein_base' &&
    p.name.toLowerCase().includes('portobello')
  )

  // Otros
  const allSides = menu.filter(p => p.category === 'side')
  const papas = allSides.filter(p => p.name.toLowerCase().includes('papas'))
  const snacks = allSides.filter(p => !p.name.toLowerCase().includes('papas'))
  const drinks = menu.filter(p => p.category === 'drink')

  return (
    <main className="container mx-auto max-w-5xl px-4 py-10 pb-32 bg-[#FAFAFA]">

      {/* HEADER */}
      <header className="text-center mb-12">
        <h1 className="text-5xl font-black text-[#3B1F1A] mb-2 uppercase tracking-tight">Menú</h1>
        <div className="mt-4">
          <Link
            href="/simulador"
            className="inline-block bg-[#C08A3E] text-white px-6 py-2 rounded-full font-bold hover:bg-[#9F6B2A] transition-colors shadow-md"
          >
            Armar mi pedido en el Simulador →
          </Link>
        </div>
      </header>

      <div className="space-y-16">

        {/* 🌶️ NUESTROS SABORES (CORE) */}
        <section>
          <SectionHeader title="Nuestros Sabores" icon="🌶️" />
          <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
            <p className="text-center text-gray-500 mb-6 text-sm">
              Personaliza tu hamburguesa. <span className="font-bold text-orange-600">+$5</span> (Habanero Extremo +$10).
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {flavors.map(flavor => (
                <FlavorCard key={flavor.id} flavor={flavor} />
              ))}
            </div>
          </div>
        </section>

        {/* 🍔 HAMBURGUESAS CLÁSICAS */}
        <section>
          <SectionHeader title="Clásicas" icon="🔥" subtitle="Al Carbón (Res y Pollo)" />
          <div className="grid gap-4 md:grid-cols-2">
            {classicBurgers.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                showVariants={['normal', 'doble']} // Solo mostramos estas
                descriptionOverride={p.description || undefined} // Descripción normal
              />
            ))}
          </div>
        </section>

        {/* 🏠 DE LA CASA (SECCIÓN ESPECIAL) */}
        <section>
          <SectionHeader title="Especiales de la Casa" icon="⭐" subtitle="Con Portobello y Doble Proteína" />
          <div className="grid gap-4 md:grid-cols-2">
            {houseSpecials.map(p => (
              <ProductCard
                key={`casa-${p.id}`}
                product={p}
                showVariants={['casa']} // Solo mostramos variante CASA
                // Podemos personalizar la descripción visualmente aquí si quieres
                descriptionOverride={`La especialidad de ${p.name}: Incluye Portobello, Queso y Salsas de la casa.`}
              />
            ))}
          </div>
        </section>

        {/* 🥗 LÍNEA LIGHT */}
        <section>
          <SectionHeader title="Línea Light" icon="🥗" subtitle="En cama de lechuga (Sin pan)" />
          <div className="grid gap-4 md:grid-cols-2">
            {lightMenu.map(p => (
              <ProductCard
                key={`light-${p.id}`}
                product={p}
                showVariants={['light']}
                descriptionOverride={`Versión ligera de ${p.name} sobre vegetales frescos.`}
              />
            ))}
          </div>
        </section>

        {/* 🌊 DEL MAR */}
        <section>
          <SectionHeader title="Del Mar" icon="🦐" />
          <div className="grid gap-4 md:grid-cols-2">
            {seaBurgers.map(p => (
              <ProductCard key={p.id} product={p} showVariants={['normal', 'doble']} />
            ))}
          </div>
        </section>

        {/* 🍄 VEGETARIANA */}
        <section>
          <SectionHeader title="Vegetariana" icon="🍄" />
          <div className="grid gap-4 md:grid-cols-2">
            {vegBurgers.map(p => (
              <ProductCard key={p.id} product={p} showVariants={['normal', 'doble', 'light']} />
            ))}
          </div>
        </section>

        {/* 🍟 ACOMPAÑAMIENTOS */}
        <div className="grid md:grid-cols-2 gap-8">
          <section>
            <SectionHeader title="Papas" icon="🍟" />
            <div className="space-y-4">
              {papas.map(p => <SideCard key={p.id} product={p} />)}
            </div>
          </section>
          <section>
            <SectionHeader title="Snacks" icon="🍗" />
            <div className="space-y-4">
              {snacks.map(p => <SideCard key={p.id} product={p} />)}
            </div>
          </section>
        </div>

        {/* 🥓 EXTRAS */}
        <section>
          <SectionHeader title="Extras" icon="🥓" />
          <div className="bg-white rounded-xl p-6 border border-gray-200 flex flex-wrap gap-3 justify-center">
            {extras.map(extra => (
              <span key={extra.id} className="inline-flex items-center px-4 py-2 rounded-full border border-gray-200 bg-gray-50 text-gray-700 text-sm font-medium">
                {extra.name} <span className="ml-2 text-[#C08A3E] font-bold">+${extra.price}</span>
              </span>
            ))}
          </div>
        </section>

        {/* 🥤 BEBIDAS */}
        <section>
          <SectionHeader title="Bebidas" icon="🥤" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {drinks.map(drink => <SimpleCard key={drink.id} product={drink} />)}
          </div>
        </section>

      </div>
    </main>
  )
}

// --- COMPONENTES ADAPTADOS A TU VISIÓN ---

function FlavorCard({ flavor }: { flavor: V2Modifier }) {
  const isHabanero = flavor.name.toLowerCase().includes('habanero')
  const showExtreme = isHabanero && (flavor.price_intense ?? 0) > flavor.price

  return (
    <div className="bg-white p-2 rounded-xl border border-orange-100 text-center shadow-sm hover:shadow-md transition">
      <div className="font-bold text-gray-800 text-sm mb-1">{flavor.name}</div>
      <div className="text-xs text-gray-500">
        {showExtreme ? (
          <>
            <div>Normal <strong className="text-orange-600">+${flavor.price}</strong></div>
            <div>Extremo <strong className="text-red-600">+${flavor.price_intense}</strong></div>
          </>
        ) : (
          <div className="font-bold text-orange-600">+${flavor.price}</div>
        )}
      </div>
    </div>
  )
}

type ProductCardProps = {
  product: V2Product
  showVariants: string[]
  descriptionOverride?: string
}

function ProductCard({ product, showVariants, descriptionOverride }: ProductCardProps) {
  // Filtramos las variantes que queremos mostrar en ESTA tarjeta
  const variantsToShow = product.variants?.filter((v) => showVariants.includes(v.name)) || []

  if (variantsToShow.length === 0) return null // Si no hay variantes de este tipo, no mostramos nada

  const sortedVariants = variantsToShow.sort((a, b) => a.price - b.price)
  const minPrice = sortedVariants[0]?.price || 0

  // Si es la sección "Casa" o "Light", usamos un estilo visual ligeramente distinto para diferenciar
  const isSpecialSection = showVariants.includes('casa') || showVariants.includes('light')

  return (
    <div className={`
      group flex gap-4 items-start bg-white p-4 rounded-xl shadow-sm border transition-all
      ${isSpecialSection ? 'border-orange-100 hover:border-orange-300' : 'border-gray-100 hover:border-gray-300'}
    `}>
      {/* Imagen */}
      <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden relative flex-shrink-0">
        {product.image_url ? (
          <Image src={product.image_url} alt={product.name} fill className="object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-2xl opacity-20">
            {showVariants.includes('light') ? '🥗' : '🍔'}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-lg text-[#3B1F1A]">
            {product.name}
            {/* Agregamos sufijo visual si es una sección especial para que quede claro */}
            {showVariants.includes('casa') && <span className="text-orange-600 text-sm ml-1">Especial</span>}
          </h3>
          <span className="font-bold text-[#C08A3E] text-lg">${minPrice}</span>
        </div>

        <p className="text-gray-500 text-xs mb-3 leading-snug line-clamp-2">
          {descriptionOverride || product.description}
        </p>

        {/* Botones de Precio/Variante */}
        <div className="flex flex-wrap gap-2">
          {sortedVariants.map((v) => (
            <span key={v.name} className={`
              text-xs font-bold px-3 py-1 rounded-md border
              ${v.name === 'casa' ? 'bg-orange-50 text-orange-800 border-orange-200' :
                v.name === 'light' ? 'bg-green-50 text-green-800 border-green-200' :
                  'bg-gray-50 text-gray-600 border-gray-200'}
            `}>
              {v.name === 'normal' ? 'Sencilla' : v.name.charAt(0).toUpperCase() + v.name.slice(1)}
              ${v.price}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function SideCard({ product }: { product: V2Product }) {
  return (
    <div className="flex justify-between items-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
      <span className="font-bold text-[#3B1F1A]">{product.name}</span>
      <span className="font-bold text-[#C08A3E]">${product.variants?.[0]?.price}</span>
    </div>
  )
}

function SimpleCard({ product }: { product: V2Product }) {
  return (
    <div className="text-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="font-bold text-gray-900 text-sm">{product.name}</div>
      <div className="text-gray-500 text-xs mt-1">${product.variants?.[0]?.price}</div>
    </div>
  )
}

function SectionHeader({ title, icon, subtitle }: { title: string, icon: string, subtitle?: string }) {
  return (
    <div className="mb-6 flex flex-col md:flex-row md:items-end gap-2 border-b border-gray-200 pb-2">
      <h2 className="text-2xl font-black text-[#3B1F1A] uppercase flex items-center gap-2">
        <span>{icon}</span> {title}
      </h2>
      {subtitle && <span className="text-gray-400 text-sm font-medium md:mb-1">{subtitle}</span>}
    </div>
  )
}