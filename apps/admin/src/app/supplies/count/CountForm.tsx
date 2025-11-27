'use client'

import { useState } from 'react'
import { submitDailyCount } from './actions'

export function CountForm({ items }: { items: any[] }) {
  // Estado local para guardar los números que escribe el usuario
  const [counts, setCounts] = useState<Record<string, number>>({})
  // Estado para guardar la unidad seleccionada por cada item
  const [units, setUnits] = useState<Record<string, string>>({})

  const [comments, setComments] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDone, setIsDone] = useState(false)

  // Inicializar unidades por defecto
  if (Object.keys(units).length === 0 && items.length > 0) {
    const initialUnits: Record<string, string> = {}
    items.forEach(item => {
      initialUnits[item.id] = item.unit
    })
    setUnits(initialUnits)
  }

  // Lógica de conversión (Duplicada por simplicidad)
  const getUnitOptions = (baseUnit: string) => {
    switch (baseUnit) {
      case 'kg': return [{ value: 'kg', label: 'kg' }, { value: 'g', label: 'g' }]
      case 'lt': return [{ value: 'lt', label: 'lt' }, { value: 'ml', label: 'ml' }]
      case 'g': return [{ value: 'g', label: 'g' }, { value: 'kg', label: 'kg' }]
      case 'ml': return [{ value: 'ml', label: 'ml' }, { value: 'lt', label: 'lt' }]
      default: return [{ value: baseUnit, label: baseUnit }]
    }
  }

  const convertToStorageUnit = (quantity: number, fromUnit: string, toBaseUnit: string) => {
    if (fromUnit === toBaseUnit) return quantity
    if (fromUnit === 'g' && toBaseUnit === 'kg') return quantity / 1000
    if (fromUnit === 'ml' && toBaseUnit === 'lt') return quantity / 1000
    if (fromUnit === 'kg' && toBaseUnit === 'g') return quantity * 1000
    if (fromUnit === 'lt' && toBaseUnit === 'ml') return quantity * 1000
    return quantity
  }

  const handleInputChange = (id: string, value: string) => {
    setCounts(prev => ({
      ...prev,
      [id]: parseFloat(value) || 0
    }))
  }

  const handleUnitChange = (id: string, newUnit: string) => {
    setUnits(prev => ({
      ...prev,
      [id]: newUnit
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validación: ¿Contaste todo?
    if (Object.keys(counts).length < items.length) {
      if (!confirm('⚠️ No has ingresado valores para todos tus insumos. Los vacíos se guardarán como CERO. ¿Seguir?')) {
        return
      }
    }

    setIsSubmitting(true)

    // Preparar datos convertidos
    const finalCounts: Record<string, number> = {}
    items.forEach(item => {
      const rawCount = counts[item.id] || 0
      const selectedUnit = units[item.id] || item.unit
      finalCounts[item.id] = convertToStorageUnit(rawCount, selectedUnit, item.unit)
    })

    // Enviamos la fecha local para evitar desfases de zona horaria
    const localDate = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD local
    await submitDailyCount(finalCounts, comments, localDate)
    setIsSubmitting(false)
    setIsDone(true)
  }

  if (isDone) {
    return (
      <div className="p-8 text-center bg-green-50 border border-green-200 rounded-xl">
        <div className="text-4xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-green-800">¡Cierre Guardado!</h2>
        <p className="text-green-600 mb-6">El inventario se ha actualizado correctamente.</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-green-700 text-white px-6 py-2 rounded-lg font-bold"
        >
          Nuevo Conteo
        </button>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed">
        <p>🤷‍♂️ No tienes insumos asignados para contar.</p>
        <p className="text-xs mt-2">Pídele al administrador que te asigne responsabilidades.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border divide-y divide-gray-100">
        {items.map((item) => {
          const unitOptions = getUnitOptions(item.unit)
          return (
            <div key={item.id} className="p-4 flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="font-bold text-gray-900 text-lg">{item.name}</div>
                <div className="text-xs text-gray-400">
                  Sistema: {item.current_stock} {item.unit}
                </div>
              </div>

              <div className="flex items-center border rounded-lg overflow-hidden">
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="0"
                  className="w-24 p-3 text-right text-xl font-bold text-gray-900 outline-none border-r"
                  onChange={(e) => handleInputChange(item.id, e.target.value)}
                  required
                />
                <select
                  value={units[item.id] || item.unit}
                  onChange={(e) => handleUnitChange(item.id, e.target.value)}
                  className="bg-gray-50 text-sm font-bold text-gray-600 py-3 pl-2 pr-1 outline-none border-none cursor-pointer hover:bg-gray-100 h-full"
                >
                  {unitOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )
        })}
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Comentarios / Incidencias (Opcional)</label>
        <textarea
          rows={3}
          className="w-full p-3 border rounded-lg"
          placeholder="Ej: Se cayó un frasco de mayonesa..."
          value={comments}
          onChange={e => setComments(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold text-xl shadow-lg hover:bg-orange-700 transition active:scale-95 disabled:opacity-50"
      >
        {isSubmitting ? 'Guardando...' : 'Confirmar Cierre del Día 🔒'}
      </button>
    </form>
  )
}