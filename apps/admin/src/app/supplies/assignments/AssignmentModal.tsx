'use client'
import { useState } from 'react'
import { Supply } from '@trailer/shared'
import { saveUserAssignments } from './actions'

type Props = {
  user: { id: string, display_name: string }
  allSupplies: Supply[]
  initialAssignedIds: string[]
  onClose: () => void
}

export function AssignmentModal({ user, allSupplies, initialAssignedIds, onClose }: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialAssignedIds))
  const [isSaving, setIsSaving] = useState(false)

  const toggle = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const handleSave = async () => {
    setIsSaving(true)
    await saveUserAssignments(user.id, Array.from(selectedIds))
    setIsSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-bold text-lg">Asignar a: {user.display_name}</h3>
          <p className="text-xs text-gray-500">Selecciona los insumos que debe contar.</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {allSupplies.map(supply => (
            <label key={supply.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer border border-transparent hover:border-gray-200">
              <input 
                type="checkbox" 
                checked={selectedIds.has(supply.id)}
                onChange={() => toggle(supply.id)}
                className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
              />
              <div>
                <div className="font-medium text-gray-900">{supply.name}</div>
                <div className="text-xs text-gray-400">{supply.unit}</div>
              </div>
            </label>
          ))}
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end gap-2 rounded-b-xl">
          <button onClick={onClose} disabled={isSaving} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-bold">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-orange-600 text-white hover:bg-orange-700 rounded-lg text-sm font-bold">
            {isSaving ? 'Guardando...' : 'Confirmar Asignación'}
          </button>
        </div>
      </div>
    </div>
  )
}