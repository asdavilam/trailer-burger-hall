'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { z } from 'zod'

const formSchema = z.object({
  name: z.string().min(2, 'Escribe tu nombre'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  type: z.enum(['queja', 'sugerencia', 'otro']),
  order_ref: z.string().optional(),
  message: z.string().min(10, 'Cuéntanos con más detalle (mín. 10 caracteres)'),
})

type FormValues = z.infer<typeof formSchema>

export default function ContactForm() {
  const [values, setValues] = useState<FormValues>({
    name: '',
    email: '',
    phone: '',
    type: 'sugerencia',
    order_ref: '',
    message: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error' | 'ratelimited' | 'fast'>(
    'idle'
  )

  const startRef = useRef<number>(Date.now())
  // Honeypot
  const [website, setWebsite] = useState<string>('')

  useEffect(() => {
    startRef.current = Date.now()
  }, [])

  const canSubmit = useMemo(() => status === 'idle' || status === 'error' || status === 'ok', [status])

  function onChange<K extends keyof FormValues>(key: K, v: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: v }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    const parsed = formSchema.safeParse(values)
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      const flat = parsed.error.flatten().fieldErrors
      Object.keys(flat).forEach((k) => {
        const msg = flat[k as keyof typeof flat]?.[0]
        if (msg) fieldErrors[k] = msg
      })
      setErrors(fieldErrors)
      return
    }
    setErrors({})

    setStatus('sending')
    const elapsedMs = Date.now() - startRef.current
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...values,
          honeypot: website, // campo oculto
          elapsedMs,
        }),
      })

      if (res.status === 429) {
        const data = await res.json().catch(() => ({}))
        setStatus(data?.error === 'too_fast' ? 'fast' : 'ratelimited')
        return
      }
      if (!res.ok) {
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    const text = await res.text().catch(() => '');
    data = text ? { raw: text } : {};
  }
  console.error('[feedback] client error', res.status, data);
  setStatus(res.status === 429 ? 'ratelimited' : 'error');
  return;
}

      setStatus('ok')

      // GA4 opcional
      // @ts-ignore
      if (typeof window !== 'undefined' && window.gtag) {
        // @ts-ignore
        window.gtag('event', 'feedback_submitted', {
          feedback_type: values.type,
          has_order_ref: Boolean(values.order_ref),
        })
      }

      // Limpia formulario
      setValues({ name: '', email: '', phone: '', type: 'sugerencia', order_ref: '', message: '' })
      setWebsite('')
      startRef.current = Date.now()
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4">
      {/* Honeypot (no mostrar) */}
      <div className="hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="name">Nombre *</label>
          <input
            id="name"
            className="w-full rounded-xl border px-3 py-2"
            value={values.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="Tu nombre"
            required
          />
          {errors.name && <p className="text-sm text-[--danger] mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="email">Email *</label>
          <input
            id="email"
            type="email"
            className="w-full rounded-xl border px-3 py-2"
            value={values.email}
            onChange={(e) => onChange('email', e.target.value)}
            placeholder="tucorreo@ejemplo.com"
            required
          />
          {errors.email && <p className="text-sm text-[--danger] mt-1">{errors.email}</p>}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="phone">Teléfono</label>
          <input
            id="phone"
            className="w-full rounded-xl border px-3 py-2"
            value={values.phone ?? ''}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="Opcional"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="type">Tipo *</label>
          <select
            id="type"
            className="w-full rounded-xl border px-3 py-2"
            value={values.type}
            onChange={(e) => onChange('type', e.target.value as FormValues['type'])}
            required
          >
            <option value="sugerencia">Sugerencia</option>
            <option value="queja">Queja</option>
            <option value="otro">Otro</option>
          </select>
          {errors.type && <p className="text-sm text-[--danger] mt-1">{errors.type}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="order_ref">Referencia de pedido</label>
        <input
          id="order_ref"
          className="w-full rounded-xl border px-3 py-2"
          value={values.order_ref ?? ''}
          onChange={(e) => onChange('order_ref', e.target.value)}
          placeholder="Opcional"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="message">Mensaje *</label>
        <textarea
          id="message"
          className="w-full rounded-xl border px-3 py-2"
          rows={5}
          value={values.message}
          onChange={(e) => onChange('message', e.target.value)}
          placeholder="Cuéntanos qué pasó o tu idea de mejora…"
          required
        />
        {errors.message && <p className="text-sm text-[--danger] mt-1">{errors.message}</p>}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="btn-cta"
          disabled={status === 'sending'}
        >
          {status === 'sending' ? 'Enviando…' : 'Enviar'}
        </button>
        {status === 'ok' && <span className="text-green-700">¡Gracias! Te contactaremos pronto.</span>}
        {status === 'error' && <span className="text-[--danger]">Ocurrió un error. Intenta de nuevo.</span>}
        {status === 'fast' && <span className="text-[--danger]">Parece un envío muy rápido. Intenta de nuevo.</span>}
        {status === 'ratelimited' && <span className="text-[--danger]">Demasiados envíos. Espera un momento.</span>}
      </div>
    </form>
  )
}