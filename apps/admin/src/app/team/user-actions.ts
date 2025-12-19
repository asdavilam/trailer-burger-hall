'use server'

import { createClient } from '@/lib/supabase'

export async function getUsers() {
    const supabase = await createClient()
    const { data } = await supabase
        .from('user_profiles')
        .select('id, display_name, email, role')
        .eq('is_active', true)
        .order('display_name')

    return data || []
}
