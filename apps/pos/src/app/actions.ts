'use server'

import { createClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { POSAccountWithItems, ServiceType } from '@trailer/shared'

/**
 * Get all open accounts with calculated pending balance
 */
export async function getOpenAccounts(): Promise<POSAccountWithItems[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('pos_accounts')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching open accounts:', error)
        return []
    }

    // Calculate pending balance for each account
    return (data || []).map(account => ({
        ...account,
        pending_balance: account.total_amount - account.paid_amount
    }))
}

/**
 * Create a new account
 */
export async function createAccount(customerName: string, serviceType: ServiceType) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'No autorizado' }
    }

    const { data, error } = await supabase
        .from('pos_accounts')
        .insert({
            customer_name: customerName,
            service_type: serviceType,
            status: 'open',
            total_amount: 0,
            paid_amount: 0,
            created_by: user.id
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating account:', error)
        return { error: 'Error al crear la cuenta' }
    }

    revalidatePath('/')
    return { success: true, account: data }
}

/**
 * Get account details with items
 */
export async function getAccountDetails(accountId: string): Promise<POSAccountWithItems | null> {
    const supabase = await createClient()

    const { data: account, error: accountError } = await supabase
        .from('pos_accounts')
        .select('*')
        .eq('id', accountId)
        .single()

    if (accountError || !account) {
        console.error('Error fetching account:', accountError)
        return null
    }

    const { data: items, error: itemsError } = await supabase
        .from('pos_account_items')
        .select('*')
        .eq('account_id', accountId)
        .order('created_at', { ascending: true })

    if (itemsError) {
        console.error('Error fetching account items:', itemsError)
    }

    return {
        ...account,
        items: items || [],
        pending_balance: account.total_amount - account.paid_amount
    }
}
