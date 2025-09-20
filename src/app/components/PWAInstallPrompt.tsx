'use client'

import { useEffect, useRef, useState } from 'react'
import { gaEvent } from '@/lib/ga'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

// === Configurable ===
const COOLDOWN_DAYS = 7
const COOLDOWN_MS = COOLDOWN_DAYS * 24 * 60 * 60 * 1000
const LS_DISMISSED_AT = 'pwaPromptDismissedAt'
const SS_SHOWN_THIS_VISIT = 'pwaPromptShownThisVisit'
const LS_INSTALLED = 'pwaInstalled'

function isStandalone(): boolean {
  // iOS (Safari): navigator.standalone
  // Otras plataformas: media query
  // @ts-expect-error - standalone no existe en todos los navegadores
  if (typeof navigator !== 'undefined' && navigator.standalone) return true
  if (typeof window !== 'undefined' && window.matchMedia) {
    if (window.matchMedia('(display-mode: standalone)').matches) return true
    if (window.matchMedia('(display-mode: fullscreen)').matches) return true
    if (window.matchMedia('(display-mode: minimal-ui)').matches) return true
  }
  return false
}

function canShowPromptNow(): boolean {
  if (isStandalone()) return false
  if (localStorage.getItem(LS_INSTALLED) === '1') return false
  if (sessionStorage.getItem(SS_SHOWN_THIS_VISIT) === '1') return false
  const dismissedAt = Number(localStorage.getItem(LS_DISMISSED_AT) || 0)
  if (dismissedAt && Date.now() - dismissedAt < COOLDOWN_MS) return false
  return true
}

export default function PWAInstallPrompt() {
  const [show, setShow] = useState(false)
  const deferredRef = useRef<BeforeInstallPromptEvent | null>(null)
  const shownMetric = useRef(false)

  useEffect(() => {
    // Si no podemos mostrar, ni siquiera nos suscribimos
    if (!canShowPromptNow()) return

    const onBIP = (e: BeforeInstallPromptEvent) => {
      // Evitar duplicados si navegamos entre páginas
      if (deferredRef.current || !canShowPromptNow()) return
      e.preventDefault()
      deferredRef.current = e
      setShow(true)
      sessionStorage.setItem(SS_SHOWN_THIS_VISIT, '1')

      if (!shownMetric.current) {
        gaEvent('install_prompt_shown', { source: 'pwa', page: location.pathname })
        shownMetric.current = true
      }
    }

    const onInstalled = () => {
      gaEvent('pwa_installed', { page: location.pathname })
      localStorage.setItem(LS_INSTALLED, '1')
      setShow(false)
      deferredRef.current = null
    }

    const bipListener = (ev: Event) => onBIP(ev as BeforeInstallPromptEvent)
    window.addEventListener('beforeinstallprompt', bipListener, { passive: false })
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
        localStorage.setItem(LS_INSTALLED, '1')
        setShow(false)
        deferredRef.current = null
      } else {
        gaEvent('install_prompt_dismissed', { page: location.pathname })
        // Aplica cooldown al descartar desde el prompt nativo
        localStorage.setItem(LS_DISMISSED_AT, String(Date.now()))
        setShow(false)
        deferredRef.current = null
      }
    } catch (err) {
      console.warn('[PWA] install prompt failed', err)
    }
  }

  const handleNotNow = () => {
    gaEvent('install_prompt_closed', { page: location.pathname })
    localStorage.setItem(LS_DISMISSED_AT, String(Date.now())) // cooldown
    setShow(false)
    // Mantén el deferred para esta navegación en null
    deferredRef.current = null
  }

  return (
    <div role="dialog" aria-live="polite" aria-label="Instalar aplicación" className="fixed inset-x-0 bottom-0 z-50">
      <div className="mx-auto mb-4 max-w-xl rounded-2xl border bg-white p-4 shadow-lg ring-1 ring-black/5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center sm:text-left">
            <p className="text-[#3B1F1A] font-semibold">Instala Trailer Burger Hall</p>
            <p className="text-sm text-gray-600">Acceso rápido desde tu pantalla de inicio, incluso sin conexión.</p>
          </div>
          <div className="flex justify-center gap-2">
            <button
              onClick={handleNotNow}
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