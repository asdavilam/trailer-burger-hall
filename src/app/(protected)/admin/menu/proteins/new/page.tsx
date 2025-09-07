// src/app/admin/menu/proteins/new/page.tsx
import Link from 'next/link'
import ProteinForm from '../ProteinForm'
import { createProtein } from '../actions'
import { requireAdmin } from '@/lib/auth'
import ConfirmSubmit from '@/app/components/admin/ConfirmSubmit'

export default async function ProteinNewPage() {
  await requireAdmin()

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">Nueva proteína</h1>
        <Link href="/admin/menu/proteins" className="underline">Volver</Link>
      </div>

      <form action={createProtein} className="space-y-4">
        <ProteinForm mode="new" />
        <div className="mt-4">
          <ConfirmSubmit
            label="Crear proteína"
            confirmMessage="¿Crear esta proteína?"
            className="btn"
          />
        </div>
      </form>
    </section>
  )
}