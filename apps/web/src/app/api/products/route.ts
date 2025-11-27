// src/app/api/products/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type')

        let query = supabase
            .from('products')
            .select(`
        id,
        name,
        description,
        type,
        available,
        image_url,
        prices:product_prices (
          price,
          variant
        )
      `)
            .order('name', { ascending: true })

        if (type) {
            query = query.eq('type', type)
        }

        const { data, error } = await query

        if (error) {
            console.error('[api/products] error', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        const res = NextResponse.json(data ?? [], { status: 200 })
        res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
        return res
    } catch (e: unknown) {
        const error = e instanceof Error ? e : new Error('Unknown error')
        console.error('[api/products] error', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
