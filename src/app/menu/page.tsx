import { getMenuData } from '@/lib/data'

export const revalidate = 60 // ISR: revalida cada 60s (luego usamos revalidateTag)

export default async function MenuPage() {
  const { proteins, flavors, extras } = await getMenuData()

  return (
    <section className="space-y-10">
      <header>
        <h2 className="text-3xl font-bold">Nuestro Menú</h2>
        <p className="mt-2 text-gray-700">Elige primero la proteína y después explora los sabores y extras.</p>
      </header>

      {/* Proteínas */}
      <section aria-labelledby="proteins-heading">
        <h3 id="proteins-heading" className="text-xl font-semibold mb-3">Proteínas</h3>
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {proteins.map((p) => (
            <li key={p.id} className="rounded-lg border p-3 bg-white">
              <span className="font-medium">{p.name}</span>
            </li>
          ))}
          {proteins.length === 0 && <li className="text-gray-500">No hay proteínas disponibles por ahora.</li>}
        </ul>
      </section>

      {/* Sabores (independientes) */}
      <section aria-labelledby="flavors-heading">
        <h3 id="flavors-heading" className="text-xl font-semibold mb-3">Sabores</h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {flavors.map((f) => (
            <li key={f.id} className="rounded-lg border p-4 bg-white">
              <div className="flex items-start justify-between">
                <h4 className="font-semibold">{f.name}</h4>
                {typeof f.price_extra === 'number' && (
                  <span className="text-brand-700 font-medium">${f.price_extra.toFixed(2)}</span>
                )}
              </div>
              {f.description && <p className="mt-1 text-sm text-gray-600">{f.description}</p>}
              {Array.isArray(f.tags) && f.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {f.tags.map((t) => (
                    <span key={t} className="text-xs bg-brand-50 text-brand-700 border border-brand-100 px-2 py-0.5 rounded">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
              {!f.available && <p className="mt-2 text-xs text-gray-500">Agotado temporalmente</p>}
            </li>
          ))}
          {flavors.length === 0 && <li className="text-gray-500">Aún no hay sabores publicados.</li>}
        </ul>
      </section>

      {/* Extras */}
      <section aria-labelledby="extras-heading">
        <h3 id="extras-heading" className="text-xl font-semibold mb-3">Extras</h3>
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {extras.map((e) => (
            <li key={e.id} className="rounded-lg border p-3 bg-white flex items-center justify-between">
              <span className="font-medium">{e.name}</span>
              <span className="text-sm">${e.price.toFixed(2)}</span>
            </li>
          ))}
          {extras.length === 0 && <li className="text-gray-500">No hay extras por ahora.</li>}
        </ul>
      </section>
    </section>
  )
}