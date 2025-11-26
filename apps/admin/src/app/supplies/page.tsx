// apps/admin/src/app/supplies/page.tsx
import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { getSupplies } from './actions'
import { SuppliesClient } from './SuppliesClient'

export default async function SuppliesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const supplies = await getSupplies()

  return <SuppliesClient supplies={supplies} />
}