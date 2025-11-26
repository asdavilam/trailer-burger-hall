'use client'
import { useState } from 'react'
import { AssignmentModal } from '@/app/supplies/assignments/AssignmentModal'

export function AssignmentManager({ users, supplies, assignments }: any) {
  const [editingUser, setEditingUser] = useState<any>(null)

  // Helper para saber qué IDs tiene asignados un usuario actualmente
  const getAssignedIds = (userId: string) => {
    return assignments
      .filter((a: any) => a.user_id === userId)
      .map((a: any) => a.supply_id)
  }

  // Helper para mostrar nombres de insumos en la tarjeta
  const getAssignedNames = (userId: string) => {
    const ids = getAssignedIds(userId)
    const names = supplies
      .filter((s: any) => ids.includes(s.id))
      .map((s: any) => s.name)
    
    if (names.length === 0) return <span className="text-gray-400 italic">Nada asignado aún</span>
    if (names.length > 3) return <span>{names.slice(0, 3).join(', ')} <span className="text-gray-400">+{names.length - 3} más</span></span>
    return names.join(', ')
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user: any) => (
          <div key={user.id} className="bg-white border rounded-xl shadow-sm hover:shadow-md transition p-6 flex flex-col">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl">
                {user.email[0].toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{user.display_name || 'Sin nombre'}</h3>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 uppercase font-bold">{user.role}</span>
              </div>
            </div>

            <div className="flex-1 mb-4">
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">Responsable de:</p>
              <div className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                {getAssignedNames(user.id)}
              </div>
            </div>

            <button 
              onClick={() => setEditingUser(user)}
              className="w-full py-2 border-2 border-orange-100 text-orange-700 font-bold rounded-lg hover:bg-orange-50 hover:border-orange-200 transition"
            >
              Editar Asignación ✏️
            </button>
          </div>
        ))}
      </div>

      {editingUser && (
        <AssignmentModal
          user={editingUser}
          allSupplies={supplies}
          initialAssignedIds={getAssignedIds(editingUser.id)}
          onClose={() => setEditingUser(null)}
        />
      )}
    </>
  )
}