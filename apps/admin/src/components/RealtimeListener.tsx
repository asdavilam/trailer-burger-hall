'use client'

import { useEffect, useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

export function RealtimeListener() {
  const router = useRouter()
  const supabase = createClient()
  const [isPending, startTransition] = useTransition()
  const [showIndicator, setShowIndicator] = useState(false)

  useEffect(() => {
    // Show indicator immediately when pending starts
    if (isPending) {
      setShowIndicator(true)
    } else {
      // Hide with a small delay to make it readable if the update is too fast
      const timer = setTimeout(() => setShowIndicator(false), 500)
      return () => clearTimeout(timer)
    }
  }, [isPending])

  useEffect(() => {
    const channel = supabase
      .channel('db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
        },
        () => {
          // Debounce/Delay handling
          setTimeout(() => {
            startTransition(() => {
              router.refresh()
            })
          }, 1000)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, router])

  if (!showIndicator) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-[#3b1f1a] text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 border border-[#501614]">
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        <span className="text-xs font-bold tracking-wide uppercase">Actualizando...</span>
      </div>
    </div>
  )
}
