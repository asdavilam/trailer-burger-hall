'use server'

import { createClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { ServiceType } from '@trailer/shared'

interface OrderItem {
    product_id: string
    variant_id: string
    quantity: number
    unit_price: number
    modifiers: Array<{ modifier_id: string; quantity: number }>
    notes?: string // optional notes
}

/**
 * Create account with items in a single transaction
 */
export async function createAccountWithItems(
    customerName: string,
    serviceType: ServiceType,
    items: OrderItem[]
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'No autorizado' }
    }

    if (!items || items.length === 0) {
        return { error: 'La orden debe tener al menos un producto' }
    }

    // Calculate total
    const totalAmount = items.reduce((sum, item) => {
        return sum + (item.unit_price * item.quantity)
    }, 0)

    // Create account
    const { data: account, error: accountError } = await supabase
        .from('pos_accounts')
        .insert({
            customer_name: customerName,
            service_type: serviceType,
            status: 'open',
            total_amount: totalAmount,
            paid_amount: 0,
            created_by: user.id
        })
        .select()
        .single()

    if (accountError || !account) {
        console.error('Error creating account:', accountError)
        return { error: 'Error al crear la cuenta' }
    }

    // Create account items
    const itemsToInsert = items.map(item => ({
        account_id: account.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.unit_price * item.quantity,
        modifiers: item.modifiers,
        notes: item.notes
    }))

    const { error: itemsError } = await supabase
        .from('pos_account_items')
        .insert(itemsToInsert)

    if (itemsError) {
        console.error('Error creating account items:', itemsError)
        // Rollback: delete the account
        await supabase.from('pos_accounts').delete().eq('id', account.id)
        return { error: 'Error al agregar productos a la cuenta' }
    }

    revalidatePath('/')
    return { success: true, accountId: account.id }
}
