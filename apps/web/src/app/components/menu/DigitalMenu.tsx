import type { MenuSection, MenuItem, MenuPrice } from '@/lib/menu-schema'

function mx(n: number) {
  return Number.isInteger(n) ? `$${n.toFixed(0)}` : `$${n.toFixed(2)}`
}

function PricePill({ price }: { price: MenuPrice }) {
  return (
    <span className="price-pill">
      {price.label ? `${price.label}: ` : ''}
      {mx(price.value)}
    </span>
  )
}

function ItemRow({ item }: { item: MenuItem }) {
  const available = item.available ?? true
  return (
    <article className="card card-hover flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <h3 className="font-semibold">{item.name}</h3>
        <div className="flex flex-wrap gap-2">
          {item.prices.map((p, i) => (
            <PricePill key={i} price={p} />
          ))}
        </div>
      </div>
      {item.description ? <p className="text-sm text-muted">{item.description}</p> : null}
      {Array.isArray(item.tags) && item.tags.length ? (
        <div className="mt-1 flex flex-wrap gap-2">
          {item.tags.map((t) => (
            <span key={t} className="chip">
              {t.replaceAll('_', ' ')}
            </span>
          ))}
        </div>
      ) : null}
      {!available ? <p className="mt-2 text-sm font-semibold text-[--danger]">Agotado</p> : null}
    </article>
  )
}

function SectionBlock({ section }: { section: MenuSection }) {
  const layout = section.layout ?? 'cards'
  const grid =
    layout === 'cards'
      ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3'
      : 'grid grid-cols-1 gap-3'

  return (
    <section className="mb-10">
      <header className="mb-3">
        <h2 className="font-display text-2xl tracking-wide">{section.title}</h2>
        {section.subtitle ? <p className="text-sm section-sub">{section.subtitle}</p> : null}
      </header>

      <div className={grid}>
        {section.items.map((item) => (
          <ItemRow key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}

export default function DigitalMenu({ sections }: { sections: MenuSection[] }) {
  return (
    <div className="space-y-8">
      {sections.map((s) => (
        <SectionBlock key={s.id} section={s} />
      ))}
      <footer className="card text-sm section-sub">
        Los precios incluyen IVA. Disponibilidad sujeta a cambios.
      </footer>
    </div>
  )
}
