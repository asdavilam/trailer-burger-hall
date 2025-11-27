// apps/admin/src/app/supplies/assignments/page.tsx
import { getAssignmentData } from './actions'
import { AssignmentManager } from '@/app/supplies/assignments/AssignmentManager' // 👇 Crearemos este wrapper cliente ahora

export default async function AssignmentsPage() {
  // Traemos los datos desde el servidor
  const data = await getAssignmentData()

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Asignación de Responsabilidades 🤝</h1>
        <p className="text-gray-500">Define qué insumos debe auditar cada miembro del equipo.</p>
      </div>

      {/* Pasamos los datos al componente cliente interactivo */}
      <AssignmentManager 
        users={data.users as any[]} 
        supplies={data.supplies as any[]} 
        assignments={data.assignments as any[]} 
      />
    </div>
  )
}