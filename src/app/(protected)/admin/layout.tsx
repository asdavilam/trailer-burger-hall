import { ReactNode } from 'react'
import { requireAdmin } from '@/lib/auth'
import AdminNav from './ui/AdminNav'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin() // protege toda la sección admin

  return (
    <div className="min-h-screen flex">
      {/* Sidebar de navegación */}
      <aside className="w-60 bg-[--espresso] text-white p-4 flex flex-col">
        <AdminNav />
        <div className="mt-auto">
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-6 bg-gray-50">
        {children}
      </main>
    </div>
  )
}