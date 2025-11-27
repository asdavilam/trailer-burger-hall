// src/app/components/OpeningHours.tsx
'use client'

type HourRow = {
  dayOfWeek: string // ej: "Monday" | "Tuesday" ...
  opens: string     // "16:00"
  closes: string    // "22:30"
}

function ClockIcon() {
  return (
    <span className="mx-0 inline-flex w-10 h-10 items-center justify-center rounded-full border border-[--accent] bg-[#FFF6EB]">
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        className="text-[--espresso]"
        fill="none"
        stroke="#C08A3E"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7v5l3 2" />
      </svg>
    </span>
  )
}

function TodayTag() {
  return (
    <span
      className="ml-3 inline-flex items-center gap-1 rounded-full border border-[--accent] bg-[#FFF6EB] px-2.5 py-0.5 text-xs font-medium text-[--espresso]"
      aria-label="Hoy"
      title="Hoy"
    >
      <svg
        viewBox="0 0 24 24"
        width="12"
        height="12"
        className="text-[--espresso]"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="5" />
      </svg>
      Hoy
    </span>
  )
}

function esLabel(eng: string) {
  const map: Record<string, string> = {
    Monday: 'Lunes',
    Tuesday: 'Martes',
    Wednesday: 'Miércoles',
    Thursday: 'Jueves',
    Friday: 'Viernes',
    Saturday: 'Sábado',
    Sunday: 'Domingo',
  }
  // si alguien guardó en español, respétalo
  return map[eng] ?? eng
}

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`
}

function hhmmToMinutes(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return null
  return h * 60 + m
}

function isToday(engDay: string, now = new Date()) {
  const idx = now.getDay() // 0=Dom … 6=Sáb
  const names = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  return names[idx] === engDay
}

function formatHHMM(hhmm: string) {
  const [h, m] = hhmm.split(':').map((x) => Number(x))
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm
  return `${pad(h)}:${pad(m)}`
}

function openStatusForToday(hours: HourRow[], now = new Date()) {
  const names = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const todayEng = names[now.getDay()]
  const row = hours.find(h => h.dayOfWeek === todayEng)
  if (!row) return { open: false, label: '—' }

  const minsNow = now.getHours() * 60 + now.getMinutes()
  const o = hhmmToMinutes(row.opens)
  const c = hhmmToMinutes(row.closes)
  if (o == null || c == null) return { open: false, label: `${formatHHMM(row.opens)} – ${formatHHMM(row.closes)}` }

  const open = minsNow >= o && minsNow < c
  const closesAt = `${formatHHMM(row.closes)} h`
  const opensAt  = `${formatHHMM(row.opens)}  h`
  return {
    open,
    label: open ? `Cierra ${closesAt}` : `Abre ${opensAt}`,
  }
}

export default function OpeningHours({ hours }: { hours: HourRow[] }) {
  if (!hours || hours.length === 0) return null

  const now = new Date()
  const status = openStatusForToday(hours, now)

  return (
    <section aria-labelledby="horarios-heading" className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 id="horarios-heading" className="font-display text-xl tracking-wide">
          Horarios
        </h2>

        <span
          className={
            `inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm
             ${status.open
                ? 'border-green-300 bg-green-50 text-green-700'
                : 'border-amber-300 bg-amber-50 text-amber-700'}`
          }
          aria-live="polite"
        >
          <span
            className={`h-2.5 w-2.5 rounded-full ${status.open ? 'bg-green-500' : 'bg-amber-500'}`}
          />
          {status.open ? 'Abierto ahora' : 'Cerrado'}
          <span className="text-muted">• {status.label}</span>
        </span>
      </div>

      {/* Lista (no tabla) para verse más “app-like” y consistente con tu estilo */}
      <ul className="grid gap-2 md:grid-cols-2">
        {hours.map((h, i) => {
          const today = isToday(h.dayOfWeek, now)
          return (
            <li
              key={`${h.dayOfWeek}-${i}`}
              className={
                `flex items-center justify-between rounded-xl border bg-white px-4 py-3
                 ${today ? 'border-[--accent] ring-1 ring-[--accent]/30' : 'border-gray-200'}`
              }
            >
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 grid place-content-center rounded-full
                                 ${today ? 'bg-[--accent] text-black' : 'bg-[#FFF6EB] text-[--primary]'}
                                `}>
                  {/* pequeño ícono de reloj */}
                  <ClockIcon />
                </div>
                <div className="font-medium">
                  {esLabel(h.dayOfWeek)}
                  {today && <TodayTag />}
                </div>
              </div>

              <div className="tabular-nums text-[15px] text-gray-800">
                {formatHHMM(h.opens)} – {formatHHMM(h.closes)}
              </div>
            </li>
          )
        })}
      </ul>

      {/* Nota pequeña (opcional) */}
      <p className="text-xs text-muted">
        * Horarios sujetos a cambios por clima o disponibilidad.
      </p>
    </section>
  )
}