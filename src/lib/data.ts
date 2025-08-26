import { supabase } from '@/lib/supabaseClient'
import { unstable_cache as cache } from 'next/cache'

/**
 * Home: avisos + settings
 * - Usa tablas en plural: notices, settings
 * - Devuelve notices ordenados por prioridad DESC y starts_at ASC
 * - Incluye campos usados por la UI: image_url, is_active
 * - Cachea con tags para revalidación selectiva desde el admin
 */
export const getHomeData = cache(
  async () => {
    const [noticesRes, settingsRes] = await Promise.all([
      supabase
        .from('notices')
        .select('id,title,body,image_url,priority,starts_at,ends_at,is_active')
        .order('priority', { ascending: false })
        .order('starts_at', { ascending: true }),
      supabase.from('settings').select('value').eq('key', 'general').single(),
    ])

    return {
      notices: noticesRes.data ?? [],
      settings: settingsRes.data?.value ?? null,
    }
  },
  ['home-cache-key'],
  { tags: ['home', 'notices'] },
)

/**
 * Menú: proteínas, sabores, extras
 * - Tablas en plural: proteins, flavors, extras
 * - Solo items disponibles para UI pública
 * - Orden alfabético o por precio (según corresponda)
 */
export const getMenuData = cache(
  async () => {
    const [proteinsRes, flavorsRes, extrasRes] = await Promise.all([
      supabase
        .from('proteins')
        .select('*')
        .eq('available', true)
        .order('name', { ascending: true }),

      supabase
        .from('flavors')
        .select('id,name,description,tags,price_extra,available,created_at')
        .eq('available', true)
        .order('name', { ascending: true }),

      supabase
        .from('extras')
        .select('id,name,price,available,created_at')
        .eq('available', true)
        .order('price', { ascending: true }),
    ])

    return {
      proteins: proteinsRes.data ?? [],
      flavors: flavorsRes.data ?? [],
      extras: extrasRes.data ?? [],
    }
  },
  ['menu-cache-key'],
  { tags: ['menu'] },
)
