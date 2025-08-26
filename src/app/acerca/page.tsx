import { getHomeData } from '@/lib/data'
import { Montserrat } from 'next/font/google'
import Link from 'next/link'

const montserrat = Montserrat({ subsets: ['latin'], weight: ['400'], display: 'swap' })

export const revalidate = 600 // ISR (10 min)

type SettingsRow = {
  value: {
    restaurant_name?: string
    phone?: string
    whatsapp?: string
    email?: string
    address?: string
    geo?: { lat: number; lng: number }
    opening_hours?: Array<{ dayOfWeek: string; opens: string; closes: string }>
    about?: {
      mission?: string
      vision?: string
      history?: string
    }
    social?: Record<string, string>
  }
}

function diaES(eng: string) {
  const map: Record<string, string> = {
    Monday: 'Lunes',
    Tuesday: 'Martes',
    Wednesday: 'Miércoles',
    Thursday: 'Jueves',
    Friday: 'Viernes',
    Saturday: 'Sábado',
    Sunday: 'Domingo',
  }
  return map[eng] ?? eng
}

export default async function AboutPage() {
  const { settings } = await getHomeData()
  const s = (settings as SettingsRow['value'] | null) ?? {}
  const hours = s?.opening_hours ?? []

  // Contenidos con fallback (puedes moverlos a settings.value.about.* cuando quieras)
  const mission =
    s?.about?.mission ??
    'Crear hamburguesas artesanales con ingredientes frescos, preparando cada pedido al momento para ofrecer un sabor auténtico y una atención cercana.'
  const vision =
    s?.about?.vision ??
    'Ser la referencia local de hamburguesas premium: una experiencia honesta, deliciosa y consistente, que haga a nuestros clientes volver.'
  const history =
    s?.about?.history ??
    'Nacimos de la pasión por la plancha y los sabores intensos. Empezamos con un tráiler y una idea: combinar proteína de calidad con salsas y toppings de casa, para que cada persona arme su mejor versión.'

  // Link de mapa
  const mapsHref = s?.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address)}`
    : s?.geo
      ? `https://www.google.com/maps/search/?api=1&query=${s.geo.lat},${s.geo.lng}`
      : 'https://maps.google.com/?q=Trailer+Burger+Hall'

  const iframeSrc = s?.address
    ? `https://www.google.com/maps?q=${encodeURIComponent(s.address)}&output=embed`
    : s?.geo
      ? `https://www.google.com/maps?q=${s.geo.lat},${s.geo.lng}&output=embed`
      : 'https://www.google.com/maps?q=Trailer+Burger+Hall&output=embed'

  return (
    <main className={`${montserrat.className} max-w-6xl mx-auto px-4 py-10 space-y-10`}>
      {/* Encabezado */}
      <header className="text-center">
        <h1 className="font-display text-3xl md:text-4xl tracking-wide">Acerca de</h1>
        <p className="text-muted mt-2 max-w-2xl mx-auto">
          Conoce nuestra misión, visión e historia — y dónde encontrarnos.
        </p>
      </header>

      {/* Misión / Visión */}
      <section aria-labelledby="mv-heading" className="grid md:grid-cols-2 gap-4">
        <h2 id="mv-heading" className="sr-only">
          Misión y Visión
        </h2>

        <article className="card">
          <h3 className="font-display text-lg tracking-wide mb-2">Nuestra misión</h3>
          <p className="text-sm text-muted">{mission}</p>
        </article>

        <article className="card">
          <h3 className="font-display text-lg tracking-wide mb-2">Nuestra visión</h3>
          <p className="text-sm text-muted">{vision}</p>
        </article>
      </section>

      {/* Historia */}
      <section aria-labelledby="historia-heading">
        <h2 id="historia-heading" className="font-display text-xl tracking-wide mb-3">
          Nuestra historia
        </h2>
        <article className="card">
          <p className="text-sm text-muted">{history}</p>
        </article>
      </section>

      {/* Horarios */}
      <section aria-labelledby="horarios-heading">
        <h2 id="horarios-heading" className="font-display text-xl tracking-wide mb-3">
          Horarios
        </h2>

        {hours.length === 0 ? (
          <p className="text-muted">Próximamente horarios.</p>
        ) : (
          <table className="w-full border-separate border-spacing-y-2">
            <tbody>
              {hours.map((h, i) => (
                <tr key={i} className="bg-white rounded-xl border">
                  <td className="p-3 font-medium w-1/3">{diaES(h.dayOfWeek)}</td>
                  <td className="p-3 text-gray-700">
                    {h.opens} – {h.closes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Ubicación / Mapa */}
      <section aria-labelledby="mapa-heading">
        <h2 id="mapa-heading" className="font-display text-xl tracking-wide mb-3">
          Ubicación
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <article className="card">
            <p className="text-sm text-muted">{s?.address ?? 'Dirección próximamente.'}</p>
            <div className="mt-3 flex gap-3">
              <Link href={mapsHref} target="_blank" rel="noreferrer" className="btn-cta">
                Cómo llegar
              </Link>
              {s?.phone && (
                <a href={`tel:${s.phone}`} className="btn">
                  Llamar
                </a>
              )}
            </div>
          </article>

          <article className="card">
            <div className="relative w-full h-64 overflow-hidden rounded-lg">
              <iframe
                title="Mapa"
                className="absolute inset-0 w-full h-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={iframeSrc}
              />
            </div>
          </article>
        </div>
      </section>
    </main>
  )
}
