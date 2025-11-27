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
  const [selectedUnit, setSelectedUnit] = useState('')

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

  // Resetear unidad cuando cambia el insumo
  useEffect(() => {
    if (!supplyId) {
      setSelectedUnit('')
      return
    }
    const supply = supplies.find(s => s.id === supplyId)
    if (supply) {
      // Por defecto seleccionamos la unidad base del insumo
      setSelectedUnit(supply.unit)
    }
  }, [supplyId, supplies])

  // Refrescar lista
  const refresh = async () => {
    const data = await getVariantIngredients(variant.id)
    setIngredients(data)
  }

  // Lógica de conversión
  const getUnitOptions = (baseUnit: string) => {
    switch (baseUnit) {
      case 'kg': return [{ value: 'kg', label: 'Kilogramos (kg)' }, { value: 'g', label: 'Gramos (g)' }]
      case 'lt': return [{ value: 'lt', label: 'Litros (lt)' }, { value: 'ml', label: 'Mililitros (ml)' }]
      case 'g': return [{ value: 'g', label: 'Gramos (g)' }, { value: 'kg', label: 'Kilogramos (kg)' }]
      case 'ml': return [{ value: 'ml', label: 'Mililitros (ml)' }, { value: 'lt', label: 'Litros (lt)' }]
      default: return [{ value: baseUnit, label: baseUnit }]
    }
  }

  const convertToStorageUnit = (quantity: number, fromUnit: string, toBaseUnit: string) => {
    if (fromUnit === toBaseUnit) return quantity

    // De gramos a kilos
    if (fromUnit === 'g' && toBaseUnit === 'kg') return quantity / 1000
    // De mililitros a litros
    if (fromUnit === 'ml' && toBaseUnit === 'lt') return quantity / 1000

    // De kilos a gramos (raro pero posible)
    if (fromUnit === 'kg' && toBaseUnit === 'g') return quantity * 1000
    // De litros a mililitros
    if (fromUnit === 'lt' && toBaseUnit === 'ml') return quantity * 1000

    return quantity
  }

  const handleAdd = async () => {
    if (!supplyId || !qty || !selectedUnit) return

    const supply = supplies.find(s => s.id === supplyId)
    if (!supply) return

    const finalQty = convertToStorageUnit(parseFloat(qty), selectedUnit, supply.unit)

    startTransition(async () => {
      await addIngredientToVariant(variant.id, supplyId, finalQty)
      setSupplyId('')
      setQty('')
      // No reseteamos selectedUnit aquí para que no parpadee feo, se reseteará con el useEffect si cambia supplyId
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

  // Obtener opciones de unidad para el insumo seleccionado
  const currentSupply = supplies.find(s => s.id === supplyId)
  const unitOptions = currentSupply ? getUnitOptions(currentSupply.unit) : []

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
          </div>

          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Cant."
              className="w-24 p-2 border rounded text-sm"
              step="0.001"
              value={qty}
              onChange={e => setQty(e.target.value)}
            />

            {/* Selector de Unidad Inteligente */}
            <select
              className="w-32 p-2 border rounded text-sm bg-white disabled:bg-gray-100"
              value={selectedUnit}
              onChange={e => setSelectedUnit(e.target.value)}
              disabled={!supplyId}
            >
              {!supplyId && <option value="">Unidad</option>}
              {unitOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <button
              onClick={handleAdd}
              disabled={!supplyId || !qty || !selectedUnit || isPending}
              className="flex-1 py-2 bg-purple-600 text-white rounded font-bold hover:bg-purple-700 disabled:opacity-50"
            >
              {isPending ? '...' : 'Agregar'}
            </button>
          </div>

          <div className="flex justify-end">
            <button onClick={onClose} className="text-xs text-gray-500 hover:text-gray-700 underline">Cerrar Ventana</button>
          </div>
        </div>
      </div>
    </div>
  )
}