'use client'

import { useEffect, useRef, useState } from 'react'
import { gaEvent } from '@/lib/ga'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export default function PWAInstallPrompt() {
  const [show, setShow] = useState(false)
  const deferredRef = useRef<BeforeInstallPromptEvent | null>(null)
  const shownMetric = useRef(false)

  useEffect(() => {
    const onBIP = (e: BeforeInstallPromptEvent) => {
      // Intercepta el prompt nativo para mostrar el nuestro
      e.preventDefault()
      deferredRef.current = e
      setShow(true)

      // Métrica GA4: se mostró el prompt (solo una vez)
      if (!shownMetric.current) {
        gaEvent('install_prompt_shown', { source: 'pwa', page: location.pathname })
        shownMetric.current = true
      }
    }

    const onInstalled = () => {
      gaEvent('pwa_installed', { page: location.pathname })
      setShow(false)
      deferredRef.current = null
    }

    // Registrar listeners sin usar "any"
    const bipListener = (ev: Event) => onBIP(ev as BeforeInstallPromptEvent)
    window.addEventListener('beforeinstallprompt', bipListener)
    window.addEventListener('appinstalled', onInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', bipListener)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (!show) return null

  const handleInstall = async () => {
    const ev = deferredRef.current
    if (!ev) return
    try {
      await ev.prompt()
      const choice = await ev.userChoice
      if (choice?.outcome === 'accepted') {
        gaEvent('pwa_installed', { via: 'prompt', page: location.pathname })
        setShow(false)
        deferredRef.current = null
      } else {
        gaEvent('install_prompt_dismissed', { page: location.pathname })
      }
    } catch (err) {
      // No interrumpir la UI si ocurre algún error al invocar el prompt
      console.warn('[PWA] install prompt failed', err)
    }
  }

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Instalar aplicación"
      className="fixed inset-x-0 bottom-0 z-50"
    >
      <div className="mx-auto mb-4 max-w-xl rounded-2xl border bg-white p-4 shadow-lg ring-1 ring-black/5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center sm:text-left">
            <p className="text-[#3B1F1A] font-semibold">Instala Trailer Burger Hall</p>
            <p className="text-sm text-gray-600">
              Acceso rápido desde tu pantalla de inicio, incluso sin conexión.
            </p>
          </div>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => {
                gaEvent('install_prompt_closed', { page: location.pathname })
                setShow(false)
              }}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C08A3E] focus-visible:ring-offset-2"
            >
              Ahora no
            </button>
            <button
              onClick={handleInstall}
              className="rounded-lg bg-[#6B8E62] px-4 py-2 text-sm font-semibold text-white hover:bg-[#C08A3E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C08A3E] focus-visible:ring-offset-2"
            >
              Instalar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}