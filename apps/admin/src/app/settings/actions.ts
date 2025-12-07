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
    abc_days_b: number[] // Días de la semana (0-6) para grupo B
    abc_days_c: number[] // Días de la semana (0-6) para grupo C
    default_margin_percent: number
    stock_buffer_multiplier: number
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
    card_commission_percent: 4.06,
    abc_days_b: [1, 4], // Lunes y Jueves
    abc_days_c: [0],    // Domingo
    default_margin_percent: 30, // Valor por defecto
    stock_buffer_multiplier: 2.0 // Valor por defecto (Doble del mínimo)
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
    console.log('--- Updating Settings ---')
    console.log('abc_days_b raw:', formData.get('abc_days_b'))
    console.log('abc_days_c raw:', formData.get('abc_days_c'))

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
        abc_days_b: JSON.parse(formData.get('abc_days_b') as string || '[1, 4]'),
        abc_days_c: JSON.parse(formData.get('abc_days_c') as string || '[0]'),
        default_margin_percent: parseFloat(formData.get('default_margin_percent') as string) || 30,
        stock_buffer_multiplier: parseFloat(formData.get('stock_buffer_multiplier') as string) || 2.0,
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
    revalidatePath('/supplies/shopping-list')
    return { success: true }
}
