import { supabase } from '@/lib/supabaseClient'
import { unstable_cache as cache } from 'next/cache'

// Home: avisos + settings
export const getHomeData = cache(
  async () => {
    const [noticesRes, settingsRes] = await Promise.all([
      supabase.from('notice').select('id,title,body,priority,starts_at,ends_at')
        .order('priority', { ascending: false })
        .order('starts_at', { ascending: false }),
      supabase.from('settings').select('value').eq('key', 'general').single(),
    ])
    return { notices: noticesRes.data ?? [], settings: settingsRes.data?.value ?? null }
  },
  ['home-cache-key'],
  { tags: ['home', 'notices'] }
)

// Menú: proteínas, sabores, extras
export const getMenuData = cache(
  async () => {
    const [proteinsRes, flavorsRes, extrasRes] = await Promise.all([
      supabase.from('protein').select('*').eq('available', true).order('name', { ascending: true }),
      supabase.from('flavor').select('id,name,description,tags,price_extra,available,created_at').order('name', { ascending: true }),
      supabase.from('extra').select('id,name,price,available,created_at').order('price', { ascending: true }),
    ])
    return {
      proteins: proteinsRes.data ?? [],
      flavors: flavorsRes.data ?? [],
      extras: extrasRes.data ?? [],
    }
  },
  ['menu-cache-key'],
  { tags: ['menu'] }
)