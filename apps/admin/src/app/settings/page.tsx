import { getFinancialSettings } from './actions'
import SettingsPage from './SettingsPage'
import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'

export default async function Page() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Verificar si es admin (opcional, pero recomendado)
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        return (
            <div className="p-10 text-center">
                <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
                <p>Solo los administradores pueden acceder a la configuración.</p>
            </div>
        )
    }

    const settings = await getFinancialSettings()

    return <SettingsPage initialSettings={settings} />
}
