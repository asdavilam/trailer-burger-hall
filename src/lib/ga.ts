// src/lib/ga.ts

declare global {
  interface Window {
    gtag?: (command: 'event', eventName: string, params?: Record<string, unknown>) => void
    dataLayer?: Array<Record<string, unknown>>
  }
}

/**
 * Envía un evento a GA4 (gtag) y opcionalmente a GTM (dataLayer) si están disponibles.
 * No lanza errores si no existen.
 */
export function gaEvent(eventName: string, params: Record<string, unknown> = {}): void {
  try {
    if (typeof window !== 'undefined') {
      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, params)
      }
      if (Array.isArray(window.dataLayer)) {
        window.dataLayer.push({ event: eventName, ...params })
      }
    }
  } catch (err) {
    // Evita romper la UI si GA/GTM no están disponibles
    console.warn('[GA] error sending event', err)
  }
}