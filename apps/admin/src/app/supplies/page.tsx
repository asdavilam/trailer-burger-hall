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

  // Filtrar para mostrar SOLO insumos de compra (purchase)
  // Los de producción se gestionan en /supplies/production-list
  const purchaseSupplies = supplies.filter(s => s.supply_type === 'purchase')

  return <SuppliesClient supplies={purchaseSupplies} />
}