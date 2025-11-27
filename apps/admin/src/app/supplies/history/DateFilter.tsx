'use client'
import { useRouter, useSearchParams } from 'next/navigation'

export function DateFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get('date') || new Date().toLocaleDateString('en-CA')

  return (
    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm">
      <span className="text-sm font-bold text-gray-500">Viendo fecha:</span>
      <input
        type="date"
        value={current}
        max={new Date().toISOString().split('T')[0]}
        onChange={(e) => router.push(`?date=${e.target.value}`)}
        className="font-bold text-gray-900 border-none focus:ring-0 outline-none cursor-pointer"
      />
    </div>
  )
}