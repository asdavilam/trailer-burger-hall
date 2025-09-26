// src/app/api/menu/route.ts
import { NextResponse } from 'next/server'
import { fetchMenuSectionsFromDb } from '@/lib/menu-dal'

export async function GET() {
  try {
    const sections = await fetchMenuSectionsFromDb()
    const res = NextResponse.json(sections, { status: 200 })
    res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    return res
  } catch (e: any) {
    console.error('[api/menu] error', e)
    return NextResponse.json({ error: e?.message ?? 'menu error' }, { status: 500 })
  }
}