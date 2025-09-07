// src/app/(auth)/actions.ts
'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { supabaseServer } from '@/lib/supabaseServer'

export async function logout() {
  const supabase = await supabaseServer()

  try {
    await supabase.auth.signOut()
  // eslint-disable-next-line no-empty
  } catch {}

  const jar = await cookies()
  for (const c of jar.getAll()) {
    if (c.name.startsWith('sb-')) {
      jar.delete(c.name)
    }
  }

  redirect('/admin/login')
}