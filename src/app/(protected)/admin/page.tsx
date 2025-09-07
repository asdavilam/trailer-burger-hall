import { supabaseServer } from '@/lib/supabaseServer'
import { requireAdmin } from '@/lib/auth'

export default async function AdminHome() {
  await requireAdmin()
  const supabase = await supabaseServer()

  const [{ count: notices }, { count: proteins }, { count: flavors }, { count: extras }, { count: feedback }] =
    await Promise.all([
      supabase.from('notices').select('*', { count: 'exact', head: true }),
      supabase.from('proteins').select('*', { count: 'exact', head: true }),
      supabase.from('flavors').select('*', { count: 'exact', head: true }),
      supabase.from('extras').select('*', { count: 'exact', head: true }),
      supabase.from('feedback').select('*', { count: 'exact', head: true }),
    ])

  const cards = [
    { label: 'Avisos', value: notices ?? 0 },
    { label: 'Proteínas', value: proteins ?? 0 },
    { label: 'Sabores', value: flavors ?? 0 },
    { label: 'Extras', value: extras ?? 0 },
    { label: 'Feedback', value: feedback ?? 0 },
  ]

  return (
    <section className="space-y-4">
      <h1 className="font-display text-2xl">Dashboard</h1>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map((c) => (
          <article key={c.label} className="card p-4">
            <p className="text-sm text-muted">{c.label}</p>
            <p className="text-2xl font-semibold">{c.value}</p>
          </article>
        ))}
      </div>
    </section>
  )
}