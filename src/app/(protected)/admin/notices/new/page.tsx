import Link from 'next/link'
import NoticeForm from '../NoticeForm'
// import { requireAdmin } from '@/lib/auth'

export default async function NoticeNewPage() {
  // await requireAdmin('/admin/notices/new')
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">Nuevo aviso</h1>
        <Link href="/admin/notices" className="underline">Volver</Link>
      </div>
      <NoticeForm mode="create" />
    </section>
  )
}