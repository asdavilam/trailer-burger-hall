'use server'

import { createClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

export type FinancialSettings = {
    rent_cost: number
    salaries_cost: number
    water_cost: number
    electricity_cost: number
    marketing_cost: number
    taxes_cost: number
    other_costs: number
    work_days_per_month: number
    avg_sales_per_day: number
    default_min_stock: number
    card_commission_percent: number
}

const DEFAULT_SETTINGS: FinancialSettings = {
    rent_cost: 0,
    salaries_cost: 0,
    water_cost: 0,
    electricity_cost: 0,
    marketing_cost: 0,
    taxes_cost: 0,
    other_costs: 0,
    work_days_per_month: 20,
    avg_sales_per_day: 60,
    default_min_stock: 5,
    card_commission_percent: 4.06
}

export async function getFinancialSettings() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'financial_settings')
        .single()

    if (error || !data) {
        return DEFAULT_SETTINGS
    }

    return { ...DEFAULT_SETTINGS, ...data.value } as FinancialSettings
}

export async function updateFinancialSettings(formData: FormData) {
    const settings: FinancialSettings = {
        rent_cost: parseFloat(formData.get('rent_cost') as string) || 0,
        salaries_cost: parseFloat(formData.get('salaries_cost') as string) || 0,
        water_cost: parseFloat(formData.get('water_cost') as string) || 0,
        electricity_cost: parseFloat(formData.get('electricity_cost') as string) || 0,
        marketing_cost: parseFloat(formData.get('marketing_cost') as string) || 0,
        taxes_cost: parseFloat(formData.get('taxes_cost') as string) || 0,
        other_costs: parseFloat(formData.get('other_costs') as string) || 0,
        work_days_per_month: parseFloat(formData.get('work_days_per_month') as string) || 20,
        avg_sales_per_day: parseFloat(formData.get('avg_sales_per_day') as string) || 60,
        default_min_stock: parseFloat(formData.get('default_min_stock') as string) || 5,
        card_commission_percent: parseFloat(formData.get('card_commission_percent') as string) || 4.06,
    }

    const { error } = await supabaseAdmin
        .from('settings')
        .upsert({
            key: 'financial_settings',
            value: settings,
            updated_at: new Date().toISOString()
        }, { onConflict: 'key' })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/settings')
    return { success: true }
}
