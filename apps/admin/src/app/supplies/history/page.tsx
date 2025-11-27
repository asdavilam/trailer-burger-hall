// apps/admin/src/app/supplies/history/page.tsx
import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getInventoryLogs } from './actions'
import { DateFilter } from './DateFilter'
import { HistoryClient } from './HistoryClient'

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { date } = await searchParams
  const logs = await getInventoryLogs(date)

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Historial de Movimientos 📉</h1>
          <p className="text-gray-500">Auditoría de cierres agrupados por sesión.</p>
        </div>
        <div className="flex gap-4">
          <DateFilter />
          <Link href="/supplies" className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-200">
            Volver
          </Link>
        </div>
      </div>

      <HistoryClient logs={logs} />
    </div>
  )
}