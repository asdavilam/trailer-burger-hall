"use client"

import { useEffect } from "react"

export default function SWRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return
    if (!("serviceWorker" in navigator)) return

    const register = async () => {
      try {
        // espera al load para evitar carreras
        if (document.readyState === "complete") {
          await navigator.serviceWorker.register("/sw.js", { scope: "/" })
        } else {
          window.addEventListener("load", () => {
            navigator.serviceWorker.register("/sw.js", { scope: "/" })
          })
        }
      } catch (err) {
        console.error("[SW] register error:", err)
      }
    }
    register()
  }, [])

  return null
}