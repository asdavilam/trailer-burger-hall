'use client'
import React from 'react'
import useSWR from 'swr'
import type { MenuSection } from '@trailer/shared'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

/**
 * Componente cliente para revalidar/actualizar menu en cliente sin convertir
 * toda la página en client component. Recibe un fallback inicial.
 */
export default function MenuClientUpdater({ fallback, onUpdate } : {
  fallback: MenuSection[]
  onUpdate?: (data: MenuSection[]) => void
}) {
  const { data } = useSWR<MenuSection[]>('/api/menu', fetcher, { fallbackData: fallback })
  React.useEffect(() => { if (data && onUpdate) onUpdate(data) }, [data, onUpdate])
  return null // no renderiza nada; solo notifica al padre si quieres manejar la actualización
}