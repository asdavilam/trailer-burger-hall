'use client'
import { useState, useEffect, useTransition } from 'react'
import { getVariantIngredients, addIngredientToVariant, removeIngredientV2 } from '../actions'
import { getSupplies } from '@/app/supplies/actions' // Reusamos la action de Fase 2

type Props = {
  variant: { id: string, name: string }
  onClose: () => void
}

export function RecipeModal({ variant, onClose }: Props) {
  const [ingredients, setIngredients] = useState<any[]>([])
  const [supplies, setSupplies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  // Formulario local
  const [supplyId, setSupplyId] = useState('')
  const [qty, setQty] = useState('')

  // Cargar datos al abrir
  useEffect(() => {
    Promise.all([
      getVariantIngredients(variant.id),
      getSupplies()
    ]).then(([ing, sup]) => {
      setIngredients(ing)
      setSupplies(sup)
      setIsLoading(false)
    })
  }, [variant.id])

  // Refrescar lista
  const refresh = async () => {
    const data = await getVariantIngredients(variant.id)
    setIngredients(data)
  }

  const handleAdd = async () => {
    if (!supplyId || !qty) return
    startTransition(async () => {
      await addIngredientToVariant(variant.id, supplyId, parseFloat(qty))
      setSupplyId('')
      setQty('')
      await refresh()
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Quitar insumo?')) return
    startTransition(async () => {
      await removeIngredientV2(id)
      await refresh()
    })
  }

  // Calcular costo
  const totalCost = ingredients.reduce((sum, item) => sum + (item.supply?.cost_per_unit * item.quantity), 0)

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-purple-50 p-4 border-b border-purple-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-purple-900 text-lg capitalize">Receta: {variant.name}</h3>
            <p className="text-xs text-purple-600">Define los insumos de esta variante.</p>
          </div>
          <div className="text-right">
            <span className="block text-xs text-gray-500 font-bold uppercase">Costo</span>
            <span className="font-bold text-xl text-gray-900">${totalCost.toFixed(2)}</span>
          </div>
        </div>

        {/* Lista de Ingredientes */}
        <div className="flex-1 overflow-y-auto p-4 min-h-[200px]">
          {isLoading ? (
            <p className="text-center text-gray-400 mt-10">Cargando...</p>
          ) : ingredients.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
              <p className="text-gray-400">Sin ingredientes definidos.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 text-xs uppercase border-b">
                  <th className="pb-2">Insumo</th>
                  <th className="pb-2 text-right">Cant.</th>
                  <th className="pb-2 text-right">Costo</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {ingredients.map(ing => (
                  <tr key={ing.id}>
                    <td className="py-3 font-medium">{ing.supply?.name}</td>
                    <td className="py-3 text-right">{ing.quantity} <span className="text-xs text-gray-400">{ing.supply?.unit}</span></td>
                    <td className="py-3 text-right text-gray-600">${(ing.quantity * ing.supply?.cost_per_unit).toFixed(2)}</td>
                    <td className="py-3 text-right">
                      <button onClick={() => handleDelete(ing.id)} className="text-red-400 hover:text-red-600 font-bold px-2">×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer: Formulario Agregar */}
        <div className="p-4 bg-gray-50 border-t space-y-3">
          <div className="flex gap-2">
            <select 
              className="flex-1 p-2 border rounded text-sm"
              value={supplyId}
              onChange={e => setSupplyId(e.target.value)}
            >
              <option value="">+ Seleccionar Insumo...</option>
              {supplies.map(s => (
                <option key={s.id} value={s.id}>{s.name} (${s.cost_per_unit}/{s.unit})</option>
              ))}
            </select>
            <input 
              type="number" 
              placeholder="Cant." 
              className="w-20 p-2 border rounded text-sm"
              step="0.001"
              value={qty}
              onChange={e => setQty(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2 border rounded text-gray-600 font-bold hover:bg-gray-100">Cerrar</button>
            <button 
              onClick={handleAdd} 
              disabled={!supplyId || !qty || isPending}
              className="flex-1 py-2 bg-purple-600 text-white rounded font-bold hover:bg-purple-700 disabled:opacity-50"
            >
              {isPending ? 'Guardando...' : 'Agregar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}