import { createBrowserClient } from '@supabase/ssr'
import { SupabaseClient } from '@supabase/supabase-js'

// AHORA: Recibimos url y key como argumentos.
// El paquete compartido ya no intenta adivinar de dónde vienen.
export const createClient = (supabaseUrl: string, supabaseAnonKey: string): SupabaseClient => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Error fatal: Intentando inicializar Supabase sin URL o Key');
  }
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Exportamos tipo por si acaso
export type { SupabaseClient }