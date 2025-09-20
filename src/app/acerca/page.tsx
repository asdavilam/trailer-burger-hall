// src/app/acerca/page.tsx
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
    about?: { mission?: string; vision?: string; history?: string }
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

// Helpers horarios (simple, sin cruces de medianoche)
function hhmmToMinutes(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return null
  return h * 60 + m
}
function openStatusForToday(
  hours: Array<{ dayOfWeek: string; opens: string; closes: string }>,
  now = new Date(),
) {
  const names = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const todayEng = names[now.getDay()]
  const row = hours.find(h => h.dayOfWeek === todayEng)
  if (!row) return { open: false, label: '—' }

  const minsNow = now.getHours() * 60 + now.getMinutes()
  const o = hhmmToMinutes(row.opens)
  const c = hhmmToMinutes(row.closes)
  if (o == null || c == null) return { open: false, label: `${row.opens} – ${row.closes}` }

  const open = minsNow >= o && minsNow < c
  const closesAt = `${row.closes} h`
  const opensAt  = `${row.opens} h`
  return { open, label: open ? `Cierra ${closesAt}` : `Abre ${opensAt}` }
}

export default async function AboutPage() {
  const { settings } = await getHomeData()
  const s = (settings as SettingsRow['value'] | null) ?? {}
  const hours = s?.opening_hours ?? []

  // Contenido con fallback
  const mission =
    s?.about?.mission ??
    'Crear hamburguesas artesanales con ingredientes frescos, preparando cada pedido al momento para ofrecer un sabor auténtico y una atención cercana.'
  const vision =
    s?.about?.vision ??
    'Ser la referencia local de hamburguesas premium: una experiencia honesta, deliciosa y consistente, que haga a nuestros clientes volver.'
  const history =
    s?.about?.history ??
    'Nacimos de la pasión por la plancha y los sabores intensos. Empezamos con un tráiler y una idea: combinar proteína de calidad con salsas y toppings de casa, para que cada persona arme su mejor versión.'

  // Link “Cómo llegar” dinámico (address/geo)
  const mapsHref = s?.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address)}`
    : s?.geo
      ? `https://www.google.com/maps/search/?api=1&query=${s.geo.lat},${s.geo.lng}`
      : 'https://maps.google.com/?q=Trailer+Burger+Hall'

  // iFrame embebido fijo que compartiste (punto exacto)
  const iframeSrcFixed =
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3756.9310832762194!2d-99.01589732405928!3d19.672945381658486!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d1f27f865ea269%3A0x119b63daf9079e5f!2sTrailer%20Burger%20Hall!5e0!3m2!1ses-419!2smx!4v1758347599572!5m2!1ses-419!2smx'

  const status = openStatusForToday(hours)

  return (
    <main className={`${montserrat.className} max-w-6xl mx-auto px-4 py-10 space-y-10`}>
      {/* Encabezado */}
      <header className="text-center">
        <h1 className="font-display text-3xl md:text-4xl tracking-wide">Acerca de</h1>
        <p className="text-muted mt-2 max-w-2xl mx-auto">
          Conoce nuestra misión, visión e historia — y dónde encontrarnos.
        </p>
      </header>

      {/* Historia / Misión / Visión */}
      <section aria-labelledby="historia-heading" className="space-y-6">
        <h2 id="historia-heading" className="font-display text-xl tracking-wide">
          Nuestra historia
        </h2>

        <article className="rounded-2xl border border-[#C08A3E]/30 bg-white/80 shadow-sm p-5 md:p-6">
          <div className="flex items-start gap-3">
            <span className="inline-grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[--accent] bg-[#FFF6EB]">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#C08A3E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 5h13a5 5 0 0 1 5 5v9H8a5 5 0 0 1-5-5V5z" />
                <path d="M8 5v9" />
              </svg>
            </span>
            <p className="text-[15px] leading-relaxed text-gray-700">{history}</p>
          </div>
        </article>

        <div className="grid md:grid-cols-2 gap-4">
          <article className="group rounded-2xl border border-[#C08A3E]/30 bg-white/80 shadow-sm p-5 md:p-6 transition hover:shadow-md">
            <div className="flex items-start gap-3">
              <span className="inline-grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[--accent] bg-[#FFF6EB]">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#C08A3E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 2v8l5 3" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
              </span>
              <div>
                <h3 className="font-display text-lg tracking-wide mb-1">Nuestra misión</h3>
                <p className="text-[15px] text-gray-700 leading-relaxed">{mission}</p>
              </div>
            </div>
          </article>

          <article className="group rounded-2xl border border-[#C08A3E]/30 bg-white/80 shadow-sm p-5 md:p-6 transition hover:shadow-md">
            <div className="flex items-start gap-3">
              <span className="inline-grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[--accent] bg-[#FFF6EB]">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#C08A3E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </span>
              <div>
                <h3 className="font-display text-lg tracking-wide mb-1">Nuestra visión</h3>
                <p className="text-[15px] text-gray-700 leading-relaxed">{vision}</p>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Horarios compactos con estado */}
      <section aria-labelledby="horarios-heading" className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 id="horarios-heading" className="font-display text-xl tracking-wide">
            Horarios
          </h2>

          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm
              ${status.open
                ? 'border-green-300 bg-green-50 text-green-700'
                : 'border-amber-300 bg-amber-50 text-amber-700'}`}
            aria-live="polite"
          >
            <span className={`h-2.5 w-2.5 rounded-full ${status.open ? 'bg-green-500' : 'bg-amber-500'}`} />
            {status.open ? 'Abierto ahora' : 'Cerrado'}
            <span className="text-muted">• {status.label}</span>
          </span>
        </div>

        {hours.length === 0 ? (
          <p className="text-muted">Próximamente horarios.</p>
        ) : (
          <div className="rounded-2xl border bg-white/80 shadow-sm">
            <ul className="divide-y">
              {hours.map((h, i) => (
                <li key={i} className="flex items-center justify-between px-4 py-3">
                  <span className="font-medium">{diaES(h.dayOfWeek)}</span>
                  <span className="tabular-nums text-gray-700">{h.opens} – {h.closes}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Ubicación — solo mapa grande y CTAs debajo */}
      <section aria-labelledby="mapa-heading" className="space-y-4">
        <h2 id="mapa-heading" className="font-display text-xl tracking-wide">
          Ubicación
        </h2>

        <div className="rounded-2xl border bg-white/80 shadow-sm overflow-hidden">
          <div className="relative w-full h-80 md:h-[420px]">
            <iframe
              title="Mapa"
              className="absolute inset-0 w-full h-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={iframeSrcFixed}
              allowFullScreen
            />
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <Link href={mapsHref} target="_blank" rel="noreferrer" className="btn-cta">
            Cómo llegar
          </Link>
          {s?.phone && (
            <a href={`tel:${s.phone}`} className="btn">
              Llamar
            </a>
          )}
        </div>
      </section>
    </main>
  )
}