import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import FlavorForm from '../FlavorForm'
import { createFlavor } from '../actions'
import ConfirmSubmit from '@/app/components/admin/ConfirmSubmit'

export default async function FlavorNewPage() {
  await requireAdmin()

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">Nuevo sabor</h1>
        <Link href="/admin/menu/flavors" className="underline">Volver</Link>
      </div>

      <form action={createFlavor} className="space-y-4">
        <FlavorForm mode="new" />
        <ConfirmSubmit
          label="Crear sabor"
          confirmMessage="¿Crear este sabor?"
          className="btn"
        />
      </form>
    </section>
  )
}