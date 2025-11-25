import { createClient } from '@trailer/shared'

export function supabaseBrowser() {
  // 1. La Web lee SUS propias variables
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // 2. Validación local rápida (para que sepas si el .env falla aquí)
  if (!url || !key) {
    throw new Error('🚨 Faltan variables de entorno en apps/web/.env.local')
  }

  // 3. Se las pasamos al cerebro compartido
  return createClient(url, key)
}