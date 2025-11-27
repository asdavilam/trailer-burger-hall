// src/app/api/extras/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('extras')
            .select('id, name, description, price, available')
            .order('name', { ascending: true })

        if (error) {
            console.error('[api/extras] error', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        const res = NextResponse.json(data ?? [], { status: 200 })
        res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
        return res
    } catch (e: unknown) {
        const error = e instanceof Error ? e : new Error('Unknown error')
        console.error('[api/extras] error', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
