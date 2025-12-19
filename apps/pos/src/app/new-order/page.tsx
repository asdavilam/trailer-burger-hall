import { POSHeader } from '@/components/POSHeader'
import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { NewOrderContent } from './NewOrderContent'
import type { V2Product, V2Modifier } from '@trailer/shared'

async function getProducts(): Promise<V2Product[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('v2_products')
        .select(`
      *,
      variants:v2_product_variants(*),
      allowed_modifiers:v2_product_modifiers_link(
        is_default,
        is_included_free,
        modifier:v2_modifiers(*)
      )
    `)
        .eq('is_active', true)
        .order('category')
        .order('name')

    if (error) {
        console.error('Error fetching products:', error)
        return []
    }

    return data as V2Product[]
}

async function getModifiers(): Promise<V2Modifier[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('v2_modifiers')
        .select('*')
        .eq('is_active', true)
        .order('type')
        .order('name')

    if (error) {
        console.error('Error fetching modifiers:', error)
        return []
    }

    return data as V2Modifier[]
}

export default async function NewOrderPage() {
    // Check authentication
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Get user profile
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('display_name, role')
        .eq('id', user.id)
        .single()

    // Get products and modifiers
    const [products, modifiers] = await Promise.all([
        getProducts(),
        getModifiers()
    ])

    return (
        <div className="min-h-screen flex flex-col bg-marfil">
            <POSHeader
                userEmail={user.email}
                userName={profile?.display_name}
            />

            <NewOrderContent products={products} modifiers={modifiers} />
        </div>
    )
}
