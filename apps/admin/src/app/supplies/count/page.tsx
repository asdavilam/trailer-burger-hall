import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { getMyAssignments } from './actions'
import { CountForm } from './CountForm'

export default async function CountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const myItems = await getMyAssignments()

  return (
    <div className="max-w-md mx-auto p-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Conteo Diario 📝</h1>
      <p className="text-gray-500 mb-6 text-sm">
        Ingresa la cantidad física real que ves en almacén.
      </p>

      <CountForm items={myItems} />
    </div>
  )
}