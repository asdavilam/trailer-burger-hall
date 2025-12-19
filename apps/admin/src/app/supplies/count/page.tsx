import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { getMyAssignments, getTodayDateHeader } from './actions'
import { CountForm } from './CountForm'


export default async function CountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const myItems = await getMyAssignments()
  const dateHeader = await getTodayDateHeader()

  return (
    <div className="max-w-3xl mx-auto p-4 pb-20">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-6 gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Conteo Diario
          </h1>
          <p className="text-gray-500 text-sm">
            Ingresa la cantidad física real que ves en almacén.
          </p>
        </div>
        <div className="text-orange-600 font-bold bg-orange-50 px-4 py-2 rounded-lg border border-orange-100 text-sm capitalize">
          {dateHeader}
        </div>
      </div>

      <CountForm items={myItems} />
    </div>
  )
}