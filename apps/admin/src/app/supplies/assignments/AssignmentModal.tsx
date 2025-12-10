import { useState, useMemo } from 'react'
import { Supply } from '@trailer/shared'
import { saveUserAssignments } from './actions'
import { Badge } from '@/components/ui/Badge'

type Props = {
  user: { id: string, display_name: string }
  allSupplies: Supply[]
  initialAssignedIds: string[]
  allAssignments?: any[]
  users?: any[]
  onClose: () => void
}

export function AssignmentModal({ user, allSupplies, initialAssignedIds, allAssignments = [], users = [], onClose }: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialAssignedIds))
  const [search, setSearch] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Map supply_id -> user_display_name
  const assignmentMap = useMemo(() => {
    const map = new Map<string, string>()
    if (!allAssignments) return map

    allAssignments.forEach((a: any) => {
      // Skip current user's assignments
      if (a.user_id === user.id) return

      const owner = users.find((u: any) => u.id === a.user_id)
      if (owner) {
        map.set(a.supply_id, owner.display_name)
      }
    })
    return map
  }, [allAssignments, users, user.id])

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
        <div className="p-4 border-b space-y-3">
          <div>
            <h3 className="font-bold text-lg text-[#3b1f1a]">Asignar a: {user.display_name}</h3>
            <p className="text-xs text-[#3b1f1a]/60">Selecciona los insumos que debe contar.</p>
          </div>
          <input
            type="text"
            placeholder="🔍 Buscar insumo..."
            className="w-full p-2 border border-[#e5e0d4] rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#c08a3e] outline-none transition-all placeholder:text-[#3b1f1a]/30"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {allSupplies
            .filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
            .map(supply => {
              const assignedTo = assignmentMap.get(supply.id)
              const isAssignedToOther = !!assignedTo

              return (
                <label key={supply.id} className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer border transition-all ${selectedIds.has(supply.id)
                    ? 'bg-[#fff9f2] border-[#c08a3e] shadow-sm'
                    : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'
                  }`}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(supply.id)}
                    onChange={() => toggle(supply.id)}
                    className="mt-1 w-5 h-5 text-[#c08a3e] rounded focus:ring-[#c08a3e] border-gray-300"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <span className={`text-sm font-bold ${selectedIds.has(supply.id) ? 'text-[#3b1f1a]' : 'text-gray-700'}`}>
                        {supply.name}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{supply.unit}</div>

                    {isAssignedToOther && (
                      <div className="mt-2 flex items-center gap-1">
                        <span className="text-[10px] uppercase font-bold text-[#c08a3e]">Asignado a:</span>
                        <Badge variant="warning" className="text-[10px] px-1.5 py-0 h-auto">
                          {assignedTo}
                        </Badge>
                      </div>
                    )}
                  </div>
                </label>
              )
            })}
          {allSupplies.filter(s => s.name.toLowerCase().includes(search.toLowerCase())).length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">
              No se encontraron insumos.
            </div>
          )}
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