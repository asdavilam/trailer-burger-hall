// apps/admin/src/app/supplies/history/page.tsx
import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getInventoryLogs } from './actions'
import { DateFilter } from './DateFilter'

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: { date?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const logs = await getInventoryLogs(searchParams.date)

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Historial de Movimientos 📉</h1>
          <p className="text-gray-500">Auditoría de cierres, mermas y ajustes diarios.</p>
        </div>
        <div className="flex gap-4">
          <DateFilter />
          <Link href="/supplies" className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-200">
            Volver
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Hora / Usuario</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Insumo</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Inicial</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Final (Conteo)</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Diferencia</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Comentarios</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  No hay registros para esta fecha.
                </td>
              </tr>
            ) : (
              logs.map((log: any) => {
                const diff = log.final_count - log.initial_stock
                const isLoss = diff < 0
                
                return (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">
                        {new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      <div className="text-xs text-gray-500">{log.user_profiles?.display_name || 'Desconocido'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{log.supplies?.name}</div>
                      <div className="text-xs text-gray-400">{log.supplies?.unit}</div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-gray-600">
                      {log.initial_stock}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-gray-900 bg-gray-50">
                      {log.final_count}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        diff === 0 
                          ? 'bg-gray-100 text-gray-600' 
                          : isLoss 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-green-100 text-green-700'
                      }`}>
                        {diff > 0 ? '+' : ''}{diff}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 italic max-w-xs truncate">
                      {log.comments || '-'}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}