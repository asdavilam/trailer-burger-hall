'use client'

import { useState, useMemo } from 'react'
import { submitDailyCount } from './actions'

export function CountForm({ items }: { items: any[] }) {
  // Estado local para guardar los números que escribe el usuario (solo si cambia)
  const [counts, setCounts] = useState<Record<string, number | null>>({})
  // Estado para guardar la unidad seleccionada por cada item
  const [units, setUnits] = useState<Record<string, string>>({})

  const [comments, setComments] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [validationError, setValidationError] = useState<{ message: string, items: string[] } | null>(null)

  // Inicializar unidades por defecto
  if (Object.keys(units).length === 0 && items.length > 0) {
    const initialUnits: Record<string, string> = {}
    items.forEach(item => {
      initialUnits[item.id] = item.unit
    })
    setUnits(initialUnits)
  }

  // Calcular días sin contar para cada item
  const getStaleInfo = (lastCountDate: string | null) => {
    if (!lastCountDate) return { isStale: true, daysSince: 999, label: 'Nunca contado' }
    const today = new Date()
    const lastDate = new Date(lastCountDate + 'T12:00:00') // Normalizar
    const diffTime = today.getTime() - lastDate.getTime()
    const daysSince = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return {
      isStale: daysSince >= 2,
      daysSince,
      label: daysSince === 0 ? 'Hoy' : daysSince === 1 ? 'Ayer' : `Hace ${daysSince} días`
    }
  }

  // Contar items pendientes
  const staleItems = useMemo(() => items.filter(item => getStaleInfo(item.last_count_date).isStale), [items])

  // Lógica de conversión
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
    if (value === '') {
      setCounts(prev => ({ ...prev, [id]: null }))
    } else {
      setCounts(prev => ({ ...prev, [id]: parseFloat(value) || 0 }))
    }
    // Limpiar error de validación si el usuario edita
    if (validationError && validationError.items.includes(id)) {
      setValidationError(null)
    }
  }

  const handleUnitChange = (id: string, newUnit: string) => {
    setUnits(prev => ({ ...prev, [id]: newUnit }))
  }

  const handleSubmit = async (e: React.FormEvent, force: boolean = false) => {
    e.preventDefault()

    // Validar: items pendientes (2+ días) deben tener valor
    const missingStale = staleItems.filter(item => counts[item.id] === null || counts[item.id] === undefined)
    if (missingStale.length > 0) {
      alert(`⚠️ Debes contar los siguientes insumos (llevan 2+ días sin actualizar):\n\n${missingStale.map(i => `• ${i.name}`).join('\n')}`)
      return
    }

    setIsSubmitting(true)
    setValidationError(null)

    // Preparar datos: usar nuevo valor si existe, o el stock actual como fallback
    const finalCounts: Record<string, number> = {}
    items.forEach(item => {
      const newValue = counts[item.id]
      const selectedUnit = units[item.id] || item.unit

      if (newValue !== null && newValue !== undefined) {
        // Usuario ingresó un nuevo valor
        finalCounts[item.id] = convertToStorageUnit(newValue, selectedUnit, item.unit)
      } else {
        // Fallback: mantener el stock actual
        finalCounts[item.id] = item.current_stock
      }
    })

    const localDate = new Date().toLocaleDateString('en-CA')
    const result = await submitDailyCount(finalCounts, comments, localDate, force)

    if (result.error) {
      if (result.discrepancies) {
        setValidationError({
          message: result.error,
          items: result.discrepancies
        })
        setIsSubmitting(false)
        return
      }
      alert(result.error)
      setIsSubmitting(false)
      return
    }

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
    <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
      {/* Alerta de pendientes */}
      {staleItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-amber-800 font-bold">
            <span className="text-xl">⚠️</span>
            <span>{staleItems.length} insumo(s) llevan 2+ días sin contar</span>
          </div>
          <p className="text-amber-700 text-sm mt-1">Estos están marcados en rojo y son obligatorios.</p>
        </div>
      )}

      {/* Alerta de Validación */}
      {validationError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 sticky top-4 z-10 shadow-lg animate-pulse">
          <div className="flex items-start gap-3">
            <span className="text-3xl">🛑</span>
            <div>
              <h3 className="text-lg font-bold text-red-800">Diferencias Detectadas</h3>
              <p className="text-red-700 mb-4">{validationError.message}</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const element = document.getElementById(validationError.items[0])
                    element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    element?.focus()
                  }}
                  className="bg-white text-red-700 px-4 py-2 rounded border border-red-200 font-bold hover:bg-red-50"
                >
                  Revisar Conteo
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e as any, true)}
                  className="bg-red-700 text-white px-4 py-2 rounded font-bold hover:bg-red-800"
                >
                  Confirmar Diferencia (Forzar)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border divide-y divide-gray-100">
        {items.map((item) => {
          const unitOptions = getUnitOptions(item.unit)
          const countingMode = item.counting_mode || 'integer'
          const capacity = item.quantity_per_package || 1
          const staleInfo = getStaleInfo(item.last_count_date)
          const isRequired = staleInfo.isStale
          const hasValue = counts[item.id] !== null && counts[item.id] !== undefined
          const isDiscrepant = validationError?.items.includes(item.id)

          // Logic for Fraction/Fuzzy calculation
          const handleQuickSet = (percentage: number) => {
            const calculatedValue = percentage * capacity
            handleInputChange(item.id, calculatedValue.toString())
          }

          return (
            <div
              key={item.id}
              id={item.id}
              className={`p-4 flex flex-col gap-3 transition-colors duration-300 ${isDiscrepant ? 'bg-red-100 border-l-4 border-red-500' : isRequired && !hasValue ? 'bg-red-50' : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="font-bold text-gray-900 text-lg flex items-center gap-2">
                    {item.name}
                    {isRequired && <span className="text-red-500 text-sm">*</span>}
                    {isDiscrepant && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-bounce">Revisar</span>}
                  </div>
                  <div className="text-xs text-gray-400 flex flex-wrap gap-x-3 gap-y-1 mt-1">
                    <span className={`${staleInfo.isStale ? 'text-red-500 font-bold' : 'text-green-600'}`}>
                      📅 {staleInfo.label}
                    </span>
                    {countingMode !== 'integer' && (
                      <span className="text-blue-500 font-bold">
                        ({countingMode === 'fraction' ? 'Fracción' : 'Ojímetro'})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  {/* Stock actual OCULTO (Blind Count) */}
                  {/* <div className="text-xs text-gray-500 flex items-center gap-1">
                    <span>Actual:</span>
                    <span className="font-bold bg-gray-100 px-2 py-0.5 rounded">{item.current_stock} {item.unit}</span>
                  </div> */}

                  {/* Input nuevo valor */}
                  <div className="flex items-center border rounded-lg overflow-hidden h-10 bg-white">
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      placeholder="?" // Blind count placeholder
                      value={counts[item.id] !== null && counts[item.id] !== undefined ? String(counts[item.id]) : ''}
                      className={`w-24 p-2 text-right text-lg font-bold outline-none border-r h-full ${isRequired && !hasValue ? 'bg-red-50' : 'text-gray-900'}`}
                      onChange={(e) => handleInputChange(item.id, e.target.value)}
                    />
                    <select
                      value={units[item.id] || item.unit}
                      onChange={(e) => handleUnitChange(item.id, e.target.value)}
                      className="bg-gray-50 text-xs font-bold text-gray-600 py-2 pl-1 pr-0.5 outline-none border-none cursor-pointer hover:bg-gray-100 h-full"
                    >
                      {unitOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Botones de Conteo Rápido */}
              {countingMode === 'fraction' && (
                <div className="space-y-2">
                  {/* Contador de contenedores completos */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 uppercase">Contenedores:</span>
                    <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => {
                          // En blind count, si es null asumimos 0 para empezar a contar
                          const currentValue = counts[item.id] ?? 0
                          const currentBase = Math.floor(currentValue / capacity)
                          const currentFraction = currentValue % capacity
                          if (currentBase > 0) {
                            handleInputChange(item.id, ((currentBase - 1) * capacity + currentFraction).toString())
                          }
                        }}
                        className="px-3 py-2 font-bold text-xl hover:bg-gray-200"
                      >
                        −
                      </button>
                      <span className="px-4 py-2 font-bold text-lg bg-white min-w-[40px] text-center">
                        {Math.floor((counts[item.id] ?? 0) / capacity)}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const currentValue = counts[item.id] ?? 0
                          const currentBase = Math.floor(currentValue / capacity)
                          const currentFraction = currentValue % capacity
                          handleInputChange(item.id, ((currentBase + 1) * capacity + currentFraction).toString())
                        }}
                        className="px-3 py-2 font-bold text-xl hover:bg-gray-200"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  {/* Selector de fracción adicional */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 uppercase">+ Fracción:</span>
                    <div className="flex gap-1 flex-1">
                      {[0, 0.25, 0.5, 0.75].map((frac) => {
                        const currentValue = counts[item.id] ?? 0
                        const currentBase = Math.floor(currentValue / capacity) * capacity
                        const currentFraction = currentValue % capacity
                        const isActive = Math.abs(currentFraction - (frac * capacity)) < 0.01
                        return (
                          <button
                            key={frac}
                            type="button"
                            onClick={() => {
                              handleInputChange(item.id, (currentBase + frac * capacity).toString())
                            }}
                            className={`flex-1 py-2 font-bold rounded border text-sm ${isActive ? 'bg-blue-600 text-white border-blue-600' : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'}`}
                          >
                            {frac === 0 ? '0' : frac === 0.5 ? '½' : frac === 0.25 ? '¼' : '¾'}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {countingMode === 'fuzzy' && (
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickSet(0)}
                    className="py-2 bg-gray-100 text-gray-700 font-bold rounded hover:bg-gray-200 border border-gray-300 text-sm"
                  >
                    Vacío
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickSet(0.25)}
                    className="py-2 bg-red-50 text-red-700 font-bold rounded hover:bg-red-100 border border-red-200 text-sm"
                  >
                    Poco
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickSet(0.5)}
                    className="py-2 bg-yellow-50 text-yellow-700 font-bold rounded hover:bg-yellow-100 border border-yellow-200 text-sm"
                  >
                    Medio
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickSet(1)}
                    className="py-2 bg-green-50 text-green-700 font-bold rounded hover:bg-green-100 border border-green-200 text-sm"
                  >
                    Lleno
                  </button>
                </div>
              )}
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