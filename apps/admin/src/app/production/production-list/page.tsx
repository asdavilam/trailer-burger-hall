import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { Supply } from '@trailer/shared'
import { getFinancialSettings } from '@/app/settings/actions'
import { ProductionListClient } from './ProductionListClient'

export default async function ProductionListPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // 1. Traemos TODOS los insumos
    const { data } = await supabase
        .from('supplies')
        .select('*')
        .order('name')

    const supplies = (data as Supply[]) || []

    // 1.5 Traemos settings para el multiplicador de buffer
    const settings = await getFinancialSettings()
    const bufferMultiplier = settings.stock_buffer_multiplier || 2.0

    return (
        <ProductionListClient supplies={supplies} bufferMultiplier={bufferMultiplier} />
    )
}
