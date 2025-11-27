import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'

export async function POST(req: Request) {
  try {
    const { secret, tags } = await req.json()

    if (!secret || secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    if (!Array.isArray(tags) || tags.length === 0) {
      return NextResponse.json({ ok: false, error: 'Missing tags[]' }, { status: 400 })
    }

    for (const t of tags) revalidateTag(String(t))

    return NextResponse.json({ ok: true, revalidated: tags })
  } catch {
    return NextResponse.json({ ok: false, error: 'Bad payload' }, { status: 400 })
  }
}
