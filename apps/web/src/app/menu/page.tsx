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

  // --- 2. CLASIFICACIÓN INTELIGENTE ---
  const classicBurgers = menu.filter(p =>
    p.category === 'protein_base' &&
    (p.name.toLowerCase().includes('res') || p.name.toLowerCase().includes('pollo'))
  )

  const seaBurgers = menu.filter(p =>
    p.category === 'protein_base' &&
    (p.name.toLowerCase().includes('camarón') || p.name.toLowerCase().includes('salmón'))
  )

  const houseSpecials = menu.filter(p => p.variants?.some((v) => v.name === 'casa'))
  const lightMenu = menu.filter(p =>
    p.category === 'protein_base' &&
    p.variants?.some((v) => v.name === 'light')
  )

  const vegBurgers = menu.filter(p =>
    p.category === 'protein_base' &&
    p.name.toLowerCase().includes('portobello')
  )

  const allSides = menu.filter(p => p.category === 'side')
  const papas = allSides.filter(p => p.name.toLowerCase().includes('papas'))
  const snacks = allSides.filter(p => !p.name.toLowerCase().includes('papas'))
  const drinks = menu.filter(p => p.category === 'drink')

  return (
    <main className="container mx-auto max-w-4xl px-3 sm:px-4 py-8 pb-32 bg-[#F6F1E7]">

      {/* HEADER */}
      <header className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-black text-[#3B1F1A] mb-2 uppercase tracking-tight font-[Cinzel] drop-shadow-sm">
          Menú
        </h1>

        <div className="mt-4">
          <Link
            href="/simulador"
            className="inline-block bg-[#6B8E62] text-white px-6 py-3 rounded-full text-base sm:text-lg font-bold hover:bg-[#C08A3E] transition shadow-md tracking-wide"
          >
            Armar mi pedido →
          </Link>
        </div>
      </header>

      <div className="space-y-16">

        {/* 🌶️ SABORES */}
        <section>
          <SectionHeader title="Nuestros Sabores" icon="🌶️" />
          <div className="bg-white rounded-2xl shadow-sm border border-[#E8DCC7] p-6">
            <p className="text-center text-gray-600 mb-6 text-sm">
              Personaliza tu hamburguesa. <span className="font-bold text-orange-600">+$5</span> (Habanero Extremo +$10).
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {flavors.map(flavor => (
                <FlavorCard key={flavor.id} flavor={flavor} />
              ))}
            </div>
          </div>
        </section>

        {/* 🍔 CLÁSICAS */}
        <section>
          <SectionHeader title="Clásicas" icon="🔥" subtitle="A la parrilla (Res y Pollo)" />
          <div className="grid gap-5 md:grid-cols-2">
            {classicBurgers.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                showVariants={['normal', 'doble']}
                descriptionOverride={p.description || undefined}
              />
            ))}
          </div>
        </section>

        {/* 🏠 CASA */}
        <section>
          <SectionHeader title="Especiales de la Casa" icon="⭐" subtitle="Con Portobello y Proteína Adicional" />
          <div className="grid gap-5 md:grid-cols-2">
            {houseSpecials.map(p => (
              <ProductCard
                key={`casa-${p.id}`}
                product={p}
                showVariants={['casa']}
                descriptionOverride={`La especialidad de ${p.name}: Incluye Portobello, Queso y Salsas de la casa.`}
              />
            ))}
          </div>
        </section>

        {/* 🥗 LIGHT */}
        <section>
          <SectionHeader title="Línea Light" icon="🥗" subtitle="En cama de lechuga (Sin pan)" />
          <div className="grid gap-5 md:grid-cols-2">
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
          <div className="grid gap-5 md:grid-cols-2">
            {seaBurgers.map(p => (
              <ProductCard key={p.id} product={p} showVariants={['normal', 'doble']} />
            ))}
          </div>
        </section>

        {/* 🍄 VEGETARIANAS */}
        <section>
          <SectionHeader title="Vegetariana" icon="🍄" />
          <div className="grid gap-5 md:grid-cols-2">
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
          <div className="bg-white rounded-xl p-6 border border-[#E8DCC7] flex flex-wrap gap-3 justify-center">
            {extras.map(extra => (
              <span
                key={extra.id}
                className="inline-flex items-center px-4 py-2 rounded-full border border-[#E8DCC7] bg-white text-[#3B1F1A] text-sm font-semibold shadow-sm"
              >
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

//
// COMPONENTES
//

function FlavorCard({ flavor }: { flavor: V2Modifier }) {
  const isHabanero = flavor.name.toLowerCase().includes('habanero')
  const showExtreme = isHabanero && (flavor.price_intense ?? 0) > flavor.price

  return (
    <div className="bg-white p-3 rounded-xl border border-[#E8DCC7] text-center shadow-sm hover:shadow-md hover:border-[#C08A3E] transition-all">
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
  const variantsToShow = product.variants?.filter((v) => showVariants.includes(v.name)) || []
  if (variantsToShow.length === 0) return null

  const sortedVariants = variantsToShow.sort((a, b) => a.price - b.price)
  const minPrice = sortedVariants[0]?.price || 0

  const isSpecial = showVariants.includes('casa') || showVariants.includes('light')

  return (
    <div
      className={`
        bg-white rounded-2xl shadow-sm border p-4 sm:p-5 flex flex-col sm:flex-row gap-4
        transition-all border-[#E8DCC7] hover:border-[#C08A3E]
        ${isSpecial ? 'shadow-md' : ''}
      `}
    >
      {/* IMAGE */}
      <div className="w-full sm:w-28 h-28 rounded-xl overflow-hidden bg-gray-100 relative mx-auto sm:mx-0">
        {product.image_url ? (
          <Image src={product.image_url} alt={product.name} fill className="object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-3xl opacity-20">
            {showVariants.includes('light') ? '🥗' : '🍔'}
          </div>
        )}
      </div>

      {/* TEXT */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-xl sm:text-2xl text-[#3B1F1A] font-[Cinzel] leading-tight">
            {product.name}
            {showVariants.includes('casa') && (
              <span className="text-orange-600 text-sm ml-2">Especial</span>
            )}
          </h3>
          <span className="font-bold text-[#C08A3E] text-xl sm:text-2xl">${minPrice}</span>
        </div>

        <p className="text-gray-700 text-sm sm:text-base leading-snug mb-3 line-clamp-3">
          {descriptionOverride || product.description}
        </p>

        <div className="flex flex-wrap gap-2">
          {sortedVariants.map((v) => (
            <span
              key={v.name}
              className={`
                text-xs sm:text-sm font-bold px-4 py-2 rounded-md border
                ${v.name === 'casa' ? 'bg-orange-50 text-orange-800 border-orange-200' :
                  v.name === 'light' ? 'bg-green-50 text-green-800 border-green-200' :
                    'bg-gray-50 text-gray-700 border-gray-200'}
              `}
            >
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
    <div className="flex justify-between items-center p-4 bg-white rounded-xl border border-[#E8DCC7] shadow-sm hover:border-[#C08A3E] transition text-base sm:text-lg">
      <span className="font-bold text-[#3B1F1A]">{product.name}</span>
      <span className="font-bold text-[#C08A3E]">${product.variants?.[0]?.price}</span>
    </div>
  )
}

function SimpleCard({ product }: { product: V2Product }) {
  return (
    <div className="text-center p-4 bg-white rounded-xl border border-[#E8DCC7] shadow-sm hover:border-[#C08A3E] transition text-base sm:text-lg">
      <div className="font-bold text-[#3B1F1A] text-sm sm:text-base">{product.name}</div>
      <div className="text-gray-600 text-xs sm:text-sm mt-1">${product.variants?.[0]?.price}</div>
    </div>
  )
}

function SectionHeader({ title, icon, subtitle }: { title: string, icon: string, subtitle?: string }) {
  return (
    <div className="mb-6 flex flex-col md:flex-row md:items-end gap-2 border-b border-[#E8DCC7] pb-2">
      <h2 className="text-2xl sm:text-3xl font-black text-[#3B1F1A] uppercase flex items-center gap-2 font-[Cinzel]">
        <span>{icon}</span> {title}
      </h2>
      {subtitle && (
        <span className="text-[#6A1E1A] text-sm sm:text-base font-medium tracking-wide">
          {subtitle}
        </span>
      )}
    </div>
  )
}