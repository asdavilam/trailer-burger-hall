import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { getFullRecipesReport } from '../actions'
import { getFinancialSettings } from '@/app/settings/actions'
import RecipesClientPage from './RecipesClientPage'

export default async function RecipesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [products, settings] = await Promise.all([
    getFullRecipesReport(),
    getFinancialSettings()
  ])

  return <RecipesClientPage products={products} settings={settings} />
}