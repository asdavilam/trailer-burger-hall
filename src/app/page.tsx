import { getHomeData } from '@/lib/data'
import { Montserrat } from 'next/font/google'
import Reviews from './components/Reviews'
import Script from 'next/script'
import Hero from './components/Hero'
import Link from 'next/link'
import Image from 'next/image'
import { Clock } from 'lucide-react'
import OpeningHours from './components/OpeningHours'

const montserrat = Montserrat({ subsets: ['latin'], weight: ['400'], display: 'swap' })

export const revalidate = 60 // ISR básico; luego usaremos revalidateTag desde el admin

type Notice = {
  id: string
  title: string
  body: string | null
  image_url?: string | null
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
{activeNotices.length > 0 && (
  <section aria-labelledby="avisos-heading">
    <h2 id="avisos-heading" className="font-display text-xl tracking-wide mb-3">
      Avisos
    </h2>

    {(() => {
      const noticesWithImage = activeNotices.filter((n) => !!n.image_url)
      const useCarousel = noticesWithImage.length >= 2

      if (useCarousel) {
        // Carrusel sin JS con scroll-snap
        return (
          <div className="overflow-x-auto pb-2 -mx-4 px-4">
            <div className="flex gap-4 snap-x snap-mandatory">
              {noticesWithImage.map((n) => (
                <article
                  key={n.id}
                  className="min-w-[280px] md:min-w-[360px] snap-start rounded-xl border bg-white p-3 shadow-sm"
                >
                  <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden mb-3">
                    <Image
                      src={n.image_url as string}
                      alt={n.title}
                      fill
                      sizes="(max-width: 768px) 280px, 360px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold leading-snug line-clamp-2">{n.title}</h3>
                    {typeof n.priority === 'number' && (
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs border border-[--accent] text-[--espresso]/80">
                        Prioridad {n.priority}
                      </span>
                    )}
                  </div>
                  {n.body && <p className="text-sm text-muted mt-1 line-clamp-3">{n.body}</p>}
                </article>
              ))}
            </div>
          </div>
        )
      }

      // Lista de tarjetas (1 sola imagen o solo texto)
      return (
        <ul className="grid gap-4 md:grid-cols-2">
          {activeNotices.map((n) => (
            <li key={n.id} className="rounded-xl border bg-white p-4 shadow-sm">
              {n.image_url ? (
                <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden mb-3">
                  <Image
                    src={n.image_url}
                    alt={n.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : null}
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold leading-snug">{n.title}</h3>
                {typeof n.priority === 'number' && (
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs border border-[--accent] text-[--espresso]/80">
                    Prioridad {n.priority}
                  </span>
                )}
              </div>
              {n.body && <p className="text-sm text-muted mt-1">{n.body}</p>}
            </li>
          ))}
        </ul>
      )
    })()}
  </section>
)}

      {/* Por qué elegirnos */}
      <section aria-labelledby="why-heading">
        <h2 id="why-heading" className="font-display text-xl tracking-wide mb-3">
          ¿Por qué elegirnos?
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <article className="card text-center">
            <span className="mx-auto mb-3 inline-flex w-14 h-14 items-center justify-center rounded-full border border-[--accent] bg-[#FFF6EB]">
              <svg
                viewBox="0 0 24 24"
                width="28"
                height="28"
                className="text-[--primary]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 2c-4 0-7 3-7 7 0 5 7 11 7 11s7-6 7-11c0-4-3-7-7-7z"></path>
                <path d="M12 3v8"></path>
              </svg>
            </span>
            <h3 className="font-semibold">Ingredientes frescos</h3>
            <p className="text-sm text-muted mt-1">
              Producto del día, pan fresco y salsas propias para un sabor auténtico.
            </p>
          </article>

          <article className="card text-center">
            <span className="mx-auto mb-3 inline-flex w-14 h-14 items-center justify-center rounded-full border border-[--accent] bg-[#FFF6EB]">
              <svg
                viewBox="0 0 24 24"
                width="28"
                height="28"
                className="text-[--primary]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 3c2 3 6 4.5 6 9a6 6 0 1 1-12 0c0-4.5 4-6 6-9z"></path>
              </svg>
            </span>
            <h3 className="font-semibold">Preparación artesanal</h3>
            <p className="text-sm text-muted mt-1">
              A la plancha y al momento, con sabores personalizables: picante, dulce o salado.
            </p>
          </article>

          <article className="card text-center">
            <span className="mx-auto mb-3 inline-flex w-14 h-14 items-center justify-center rounded-full border border-[--accent] bg-[#FFF6EB]">
              <svg
                viewBox="0 0 24 24"
                width="28"
                height="28"
                className="text-[--primary]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="8" r="3.2"></circle>
                <path d="M4 20c0-4.4 4-7 8-7s8 2.6 8 7"></path>
              </svg>
            </span>
            <h3 className="font-semibold">Experiencia única</h3>
            <p className="text-sm text-muted mt-1">
              Servicio cercano y ambiente casual que hacen cada visita especial.
            </p>
          </article>
        </div>
      </section>

      <OpeningHours hours= {hours} />
      
      <Reviews />

      {/* CTA final */}
      <section aria-labelledby="cta-heading" className="cta-banner text-center py-16 px-6">
        <h2
          id="cta-heading"
          className="font-display text-3xl md:text-4xl tracking-wide mb-4 text-white"
        >
          ¿Listo para probar nuestras hamburguesas?
        </h2>
        <p className="cta-sub text-white/90 mb-6 max-w-xl mx-auto">
          Ven y descubre por qué somos la experiencia premium de hamburguesas artesanales en la
          ciudad.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/menu" className="btn-cta btn-lg">
            Ver menú
          </Link>
          <Link
            href="/acerca"
            className="btn btn-lg border-white text-white hover:bg-white hover:text-[--espresso]"
          >
            Cómo llegar
          </Link>
        </div>
      </section>

      {/* JSON-LD para SEO (Restaurant + Reviews) */}
      <Script
        id="ld-json-restaurant"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Restaurant',
            name: 'Trailer Burger Hall',
            url: siteUrl,
            image: siteUrl + '/images/hero-burger.jpg',
            telephone: settingsValue?.phone || '+52 5614971795',
            servesCuisine: ['Hamburguesas', 'Comida rápida'],
            priceRange: '$$',
            address:
              settingsValue?.address ||
              'Av. Ejemplo 123, Col. Centro, Ciudad de México, CDMX, 06000, MX',
            geo: settingsValue?.geo
              ? {
                  '@type': 'GeoCoordinates',
                  latitude: settingsValue.geo.lat,
                  longitude: settingsValue.geo.lng,
                }
              : { '@type': 'GeoCoordinates', latitude: 19.4326, longitude: -99.1332 },
            sameAs: sameAs,
            menu: siteUrl + '/menu',
            openingHoursSpecification: openingHoursSpecification,
          }),
        }}
      />
    </section>
  )
}
