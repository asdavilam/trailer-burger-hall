import { getHomeData } from '@/lib/data'
import { Montserrat } from 'next/font/google'
import Reviews from './components/Reviews'
import Script from 'next/script'
import Hero from './components/Hero'

const montserrat = Montserrat({ subsets: ['latin'], weight: ['400'], display: 'swap' })

export const revalidate = 60 // ISR básico; luego usaremos revalidateTag desde el admin

type Notice = {
  id: string
  title: string
  body: string | null
  priority: number | null
  starts_at: string // date
  ends_at: string | null // date
}

type SettingsRow = {
  value: {
    restaurant_name?: string
    phone?: string
    whatsapp?: string
    email?: string
    address?: string
    geo?: { lat: number; lng: number }
    opening_hours?: Array<{ dayOfWeek: string; opens: string; closes: string }>
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

export default async function HomePage() {
  const { notices, settings } = await getHomeData()

  const noticesList = (notices ?? []) as Notice[]
  const now = new Date()
  const activeNotices = noticesList.filter((n) => {
    const start = new Date(n.starts_at)
    const end = n.ends_at ? new Date(n.ends_at) : null
    return start <= now && (!end || end >= now)
  })

  const settingsValue = (settings as SettingsRow['value'] | null) ?? null
  const hours = settingsValue?.opening_hours ?? []

  const siteUrl = process.env.SITE_URL || 'https://trailer-burger-hall.vercel.app'
  const openingHoursSpecification = hours.map((h) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: h.dayOfWeek,
    opens: h.opens,
    closes: h.closes,
  }))
  const sameAs = settingsValue?.social ? Object.values(settingsValue.social) : []

  return (
    <section className={`${montserrat.className} space-y-10`}>
      {/* Héroe */}
      <Hero />

      {/* Avisos vigentes */}
      <section aria-labelledby="avisos-heading">
        <h2 id="avisos-heading" className="text-2xl font-semibold mb-3">
          Avisos
        </h2>

        {activeNotices.length === 0 ? (
          <p className="text-gray-600">No hay avisos por el momento.</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {activeNotices.map((n) => (
              <li key={n.id} className="rounded-xl border bg-white p-4">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold">{n.title}</h3>
                  {typeof n.priority === 'number' && (
                    <span className="ml-3 rounded bg-brand-50 px-2 py-0.5 text-xs text-brand-700 border border-brand-100">
                      Prioridad {n.priority}
                    </span>
                  )}
                </div>
                {n.body && <p className="mt-1 text-gray-700">{n.body}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Horarios (settings) */}
      <section aria-labelledby="horarios-heading">
        <h2 id="horarios-heading" className="text-2xl font-semibold mb-3">
          Horarios
        </h2>

        {hours.length === 0 ? (
          <p className="text-gray-600">Próximamente horarios.</p>
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
      <Reviews />
      {/* JSON-LD para SEO (Restaurant + Reviews) */}
      <Script
  id="ld-json-restaurant"
  type="application/ld+json"
  strategy="afterInteractive"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify(
      {
        "@context": "https://schema.org",
        "@type": "Restaurant",
        "name": "Trailer Burger Hall",
        "url": siteUrl,
        "image": siteUrl + "/images/hero-burger.jpg",
        "telephone": settingsValue?.phone || "+52 5614971795",
        "servesCuisine": ["Hamburguesas", "Comida rápida"],
        "priceRange": "$$",
        "address": settingsValue?.address || "Av. Ejemplo 123, Col. Centro, Ciudad de México, CDMX, 06000, MX",
        "geo": settingsValue?.geo
          ? { "@type": "GeoCoordinates", "latitude": settingsValue.geo.lat, "longitude": settingsValue.geo.lng }
          : { "@type": "GeoCoordinates", "latitude": 19.4326, "longitude": -99.1332 },
        "sameAs": sameAs,
        "menu": siteUrl + "/menu",
        "openingHoursSpecification": openingHoursSpecification
      }
),
  }}
/>
    </section>
  )
}