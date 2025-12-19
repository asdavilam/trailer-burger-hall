'use client'

import { useState, useMemo, useEffect } from 'react'
import { submitDailyCount } from './actions'
import { Toast, ToastType } from '@/components/ui/Toast'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { useFormPersistence } from '@/hooks/useFormPersistence'
import { Search } from 'lucide-react'

const CATEGORY_ORDER = [
  'Abarrotes',
  'Aderezos',
  'Bebidas',
  'Congelados',
  'Proteínas',
  'Desechables',
  'Limpieza e Higiene',
  'Panadería',
  'Lácteos y Refrigerados',
  'Insumo',
  'Frescos'
]

export function CountForm({ items }: { items: any[] }) {
  // Estado local para guardar los números que escribe el usuario (solo si cambia)
  const [counts, setCounts] = useState<Record<string, number | null>>({})
  // Estado para guardar la unidad seleccionada por cada item
  const [units, setUnits] = useState<Record<string, string>>({})

  // Search State
  const [searchQuery, setSearchQuery] = useState('')

  const [comments, setComments] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [validationError, setValidationError] = useState<{ message: string, items: string[] } | null>(null)
  const [isRestored, setIsRestored] = useState(false)

  // Online status detection
  const isOnline = useOnlineStatus()

  // Toast State
  const [toast, setToast] = useState<{ message: string, type: ToastType, isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false
  })

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type, isVisible: true })
  }

  // Form persistence
  const formData = useMemo(() => ({ counts, units, comments }), [counts, units, comments])
  const { isSaving, lastSaved, showSaved, restore, clear } = useFormPersistence({
    key: 'count-form-data',
    data: formData,
    enabled: !isDone && Object.keys(counts).length > 0,
    debounceMs: 3000 // 3 segundos (similar a Google Docs)
  })

  // Restore saved data on mount
  useEffect(() => {
    if (!isRestored && items.length > 0) {
      const saved = restore()
      if (saved && saved.counts && Object.keys(saved.counts).length > 0) {
        setCounts(saved.counts)
        setUnits(saved.units || {})
        setComments(saved.comments || '')
        showToast('Datos restaurados desde la última sesión', 'info')
      }
      setIsRestored(true)
    }
  }, [items.length, isRestored, restore])



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
    if (!lastCountDate) return { isStale: true, daysSince: 999, label: 'Nunca' }
    const today = new Date()
    const lastDate = new Date(lastCountDate + 'T12:00:00') // Normalizar
    const diffTime = today.getTime() - lastDate.getTime()
    const daysSince = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return {
      isStale: daysSince >= 2,
      daysSince,
      label: daysSince === 0 ? 'Hoy' : daysSince === 1 ? 'Ayer' : `${daysSince} días`
    }
  }

  // Contar items pendientes
  const staleItems = useMemo(() => items.filter(item => getStaleInfo(item.last_count_date).isStale), [items])

  // Filter and Group Items
  const filteredItems = useMemo(() => {
    if (!searchQuery) return items
    return items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [items, searchQuery])

  const groupedItems = useMemo(() => {
    const groups: Record<string, typeof items> = {}

    filteredItems.forEach(item => {
      // Normalize category
      let category = item.category ? item.category.trim() : 'Otros'

      // Try to match canonical case
      const canonical = CATEGORY_ORDER.find(c => c.toLowerCase() === category.toLowerCase())
      if (canonical) {
        category = canonical
      } else if (!item.category) {
        category = 'Otros'
      }

      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(item)
    })

    return groups
  }, [filteredItems])

  const sortedCategories = useMemo(() => {

    return Object.keys(groupedItems).sort((a, b) => {
      const indexA = CATEGORY_ORDER.indexOf(a)
      const indexB = CATEGORY_ORDER.indexOf(b)

      // If both are in the list, sort by defined order
      if (indexA !== -1 && indexB !== -1) return indexA - indexB

      // If only A is in list, it comes first
      if (indexA !== -1) return -1
      // If only B is in list, it comes first
      if (indexB !== -1) return 1

      // Fallback: "Otros" goes last
      if (a === 'Otros') return 1
      if (b === 'Otros') return -1

      // Fallback: Alphabetical
      return a.localeCompare(b)
    })
  }, [groupedItems])

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
      showToast(`Faltan ${missingStale.length} insumos obligatorios por contar.`, 'error')
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
        if (selectedUnit === 'smart_weight') {
          // Smart Logic
          if (item.average_weight && item.average_weight > 0) {
            if (item.unit === 'pz') {
              // INPUT: Grams -> STORAGE: Pieces
              // newValue = Grams
              finalCounts[item.id] = Math.floor(newValue / item.average_weight)
            } else {
              // INPUT: Pieces -> STORAGE: Weight (Kg/Lt/g/ml)
              // newValue = Pieces
              const totalGrams = newValue * item.average_weight

              if (item.unit === 'kg' || item.unit === 'lt') {
                finalCounts[item.id] = totalGrams / 1000
              } else {
                finalCounts[item.id] = totalGrams
              }
            }
          } else {
            // Fallback (shouldn't happen)
            finalCounts[item.id] = newValue
          }
        } else {
          finalCounts[item.id] = convertToStorageUnit(newValue, selectedUnit, item.unit)
        }
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
        showToast('Hay diferencias importantes. Revisa los items marcados.', 'error')
        setIsSubmitting(false)
        return
      }
      showToast(result.error, 'error')
      setIsSubmitting(false)
      return
    }

    setIsSubmitting(false)
    setIsDone(true)
    clear() // Clear saved form data after successful submission
    showToast('Inventario guardado correctamente', 'success')
  }

  if (isDone) {
    return (
      <div className="p-12 text-center bg-[#f6f1e7] rounded-xl border border-[#e5e0d4] shadow-sm animate-in fade-in duration-500">
        <div className="text-6xl mb-6">✨</div>
        <h2 className="text-3xl font-display font-bold text-[#3b1f1a] mb-2">¡Cierre Exitoso!</h2>
        <p className="text-[#3b1f1a]/70 mb-8 font-sans">El inventario se ha actualizado correctamente.</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-[#c08a3e] text-white px-8 py-3 rounded-lg font-bold font-sans hover:bg-[#a67633] transition-colors shadow-lg shadow-[#c08a3e]/20"
        >
          Iniciar Nuevo Conteo
        </button>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="p-12 text-center text-[#3b1f1a]/50 bg-[#f6f1e7] rounded-xl border border-dashed border-[#e5e0d4]">
        <p className="font-display text-lg">No hay insumos asignados</p>
        <p className="text-xs mt-2 font-sans">Solicita asignaciones al administrador.</p>
      </div>
    )
  }

  return (
    <>
      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6 pb-20">
        {/* Online/Offline Status Banner */}
        {!isOnline && (
          <div className="bg-[#fff0f0] border-l-4 border-[#6a1e1a] rounded-r-lg p-4 shadow-sm sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#6a1e1a] animate-pulse" />
              <div className="flex-1">
                <p className="text-[#6a1e1a] font-bold">Sin Conexión</p>
                <p className="text-[#6a1e1a]/70 text-xs">Tus datos se están guardando localmente. Podrás enviarlos cuando se restablezca la conexión.</p>
              </div>
            </div>
          </div>
        )}

        {/* Auto-save Indicator */}
        {(isSaving || showSaved) && (
          <div className={`border-l-4 rounded-r-lg p-3 shadow-sm transition-all ${showSaved
            ? 'bg-[#f0fdf4] border-[#6b8e62]'
            : 'bg-[#fffbeb] border-[#f59e0b]'
            }`}>
            <div className="flex items-center gap-2">
              {isSaving ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-[#f59e0b] animate-pulse" />
                  <p className="text-[#f59e0b] text-xs font-bold">Guardando...</p>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-[#6b8e62]" />
                  <p className="text-[#6b8e62] text-xs font-bold">✓ Guardado</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Alerta de pendientes */}
        {staleItems.length > 0 && (
          <div className="bg-[#fff8f0] border-l-4 border-[#c08a3e] rounded-r-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-[#c08a3e] font-bold text-xl">⚠️</span>
              <div>
                <p className="text-[#3b1f1a] font-bold">Pendientes de Conteo</p>
                <p className="text-[#3b1f1a]/70 text-sm">{staleItems.length} insumo(s) requieren atención hoy.</p>
              </div>
            </div>
          </div>
        )}

        {/* Alerta de Validación */}
        {validationError && (
          <div className="bg-[#fff5f5] border border-[#6a1e1a]/20 rounded-xl p-6 sticky top-20 z-50 shadow-xl animate-pulse">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🧐</span>
                <div>
                  <h3 className="text-lg font-bold text-[#6a1e1a] font-display">Verificación Requerida</h3>
                  <p className="text-[#6a1e1a]/80 text-sm">{validationError.message}</p>
                </div>
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    const element = document.getElementById(validationError.items[0])
                    element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    element?.focus()
                  }}
                  className="flex-1 bg-white text-[#6a1e1a] px-4 py-3 rounded-lg border border-[#6a1e1a]/20 font-bold text-sm hover:bg-[#fff0f0] transition-colors"
                >
                  Corregir
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e as any, true)}
                  className="flex-1 bg-[#6a1e1a] text-white px-4 py-3 rounded-lg font-bold text-sm hover:bg-[#501614] transition-colors shadow-lg shadow-[#6a1e1a]/20"
                >
                  Confirmar (Forzar)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="sticky top-0 z-20 bg-[#f6f1e7] pt-2 pb-4 -mx-1 px-1">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3b1f1a]/40 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar insumo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#e5e0d4] bg-white text-[#3b1f1a] font-sans placeholder:text-[#3b1f1a]/30 focus:ring-2 focus:ring-[#c08a3e] outline-none shadow-sm"
            />
          </div>
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-10 text-[#3b1f1a]/50">
            <p>No se encontraron resultados para "{searchQuery}"</p>
          </div>
        )}

        <div className="space-y-8">
          {sortedCategories.map(category => (
            <div key={category} className="space-y-4">
              <h3 className="text-lg font-bold text-[#3b1f1a] flex items-center gap-2 uppercase tracking-wide opacity-80 pl-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c08a3e]"></span>
                {category}
              </h3>

              <div className="space-y-4">
                {groupedItems[category].map((item) => {
                  const unitOptions = getUnitOptions(item.unit)
                  const countingMode = item.counting_mode || 'integer'
                  const capacity = item.quantity_per_package || 1
                  const staleInfo = getStaleInfo(item.last_count_date)
                  const isRequired = staleInfo.isStale
                  const hasValue = counts[item.id] !== null && counts[item.id] !== undefined
                  const isDiscrepant = validationError?.items.includes(item.id)
                  const isSmartMode = units[item.id] === 'smart_weight'

                  const handleQuickSet = (percentage: number) => {
                    const calculatedValue = percentage * capacity
                    handleInputChange(item.id, calculatedValue.toString())
                  }

                  return (
                    <div
                      key={item.id}
                      id={item.id}
                      className={`
                        relative p-5 rounded-xl border transition-all duration-300
                        ${isDiscrepant
                          ? 'bg-[#fff5f5] border-[#6a1e1a] shadow-[0_0_15px_rgba(106,30,26,0.15)] z-10'
                          : 'bg-white border-transparent shadow-sm hover:shadow-md'
                        }
                      `}
                    >
                      <div className="flex flex-col gap-4">
                        {/* Header del Item */}
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className={`font-display font-bold text-lg leading-tight ${isDiscrepant ? 'text-[#6a1e1a]' : 'text-[#3b1f1a]'}`}>
                              {item.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-bold text-[#c08a3e] bg-[#f6f1e7] px-2 py-0.5 rounded-md uppercase tracking-wider">
                                {item.unit}
                              </span>
                              {/* Indicador de última vez */}
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${staleInfo.isStale ? 'bg-[#fff0f0] text-[#6a1e1a]' : 'bg-[#f0fdf4] text-[#15803d]'}`}>
                                {staleInfo.label}
                              </span>
                            </div>
                          </div>

                          {/* Toggle Smart Conversion (Elegante) */}
                          {item.average_weight && item.average_weight > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newMode = isSmartMode ? item.unit : 'smart_weight'
                                handleUnitChange(item.id, newMode)
                                handleInputChange(item.id, '')
                              }}
                              className={`
                                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all
                                ${isSmartMode
                                  ? 'bg-[#6b8e62] text-white shadow-md shadow-[#6b8e62]/30'
                                  : 'bg-[#f6f1e7] text-[#3b1f1a]/60 hover:bg-[#ebe6da]'
                                }
                              `}
                            >
                              {isSmartMode ? '✨ Smart On' : '⚖️ Smart Off'}
                            </button>
                          )}
                        </div>

                        {/* Área de Input Principal */}
                        <div className="flex items-stretch gap-3">
                          <div
                            className={`
                              flex-1 flex items-center bg-[#fcfbf9] border rounded-xl overflow-hidden transition-all focus-within:ring-2 focus-within:ring-[#c08a3e] focus-within:border-[#c08a3e]
                              ${isDiscrepant ? 'border-[#6a1e1a]' : isRequired && !hasValue ? 'border-[#c08a3e]/50' : 'border-[#e5e0d4]'}
                            `}
                          >
                            <input
                              type="number"
                              step={isSmartMode ? '1' : '0.001'}
                              min="0"
                              placeholder={isSmartMode ? (item.unit === 'pz' ? "Gramos" : "Piezas") : "0"}
                              value={counts[item.id] !== null && counts[item.id] !== undefined ? String(counts[item.id]) : ''}
                              onChange={(e) => handleInputChange(item.id, e.target.value)}
                              className="flex-1 h-14 px-4 text-2xl font-display font-bold text-[#3b1f1a] bg-transparent outline-none placeholder:text-gray-200"
                            />

                            {/* Unidad o Selector */}
                            <div className="bg-[#f6f1e7] h-full flex items-center px-3 border-l border-[#e5e0d4]">
                              {isSmartMode ? (
                                <div className="flex flex-col items-end justify-center min-w-[60px]">
                                  <span className="text-[10px] text-[#3b1f1a]/50 font-bold uppercase">Eq. a</span>
                                  <span className="text-sm font-bold text-[#6b8e62] leading-none">
                                    {counts[item.id] ? (
                                      item.unit === 'pz'
                                        ? `~${Math.floor(counts[item.id]! / item.average_weight)}`
                                        : `~${((counts[item.id]! * item.average_weight) / (item.unit === 'kg' || item.unit === 'lt' ? 1000 : 1)).toFixed(2)}`
                                    ) : '-'}
                                  </span>
                                  <span className="text-[9px] text-[#3b1f1a]/50 uppercase">{item.unit === 'pz' ? 'pzas' : item.unit}</span>
                                </div>
                              ) : (
                                <select
                                  value={units[item.id] || item.unit}
                                  onChange={(e) => handleUnitChange(item.id, e.target.value)}
                                  className="bg-transparent text-xs font-bold text-[#3b1f1a] outline-none cursor-pointer py-2 pr-1"
                                >
                                  {unitOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                  ))}
                                </select>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Controls for Counting Modes (Fraction / Fuzzy) */}
                        {(!isSmartMode && (countingMode === 'fraction' || countingMode === 'fuzzy')) && (
                          <div className="flex flex-col gap-3 mt-2 animate-in slide-in-from-top-1 fade-in">

                            {/* Integer / Full Package Stepper */}
                            <div className="flex items-center justify-between bg-[#f6f1e7] rounded-lg p-1.5 border border-[#e5e0d4]">
                              <button
                                type="button"
                                onClick={() => {
                                  const current = counts[item.id] || 0
                                  // Subtract 1 capacity unit, max at 0
                                  const newVal = Math.max(0, current - capacity)
                                  handleInputChange(item.id, newVal.toString())
                                }}
                                className="w-10 h-10 flex items-center justify-center bg-white rounded-md shadow-sm text-[#c08a3e] font-bold text-xl hover:bg-[#c08a3e] hover:text-white transition-colors active:scale-95"
                              >
                                -
                              </button>

                              <div className="text-center">
                                <span className="text-[10px] uppercase font-bold text-[#3b1f1a]/50 block">
                                  {item.unit === 'pz' || capacity === 1 ? 'Unidades' : 'Paquetes'}
                                </span>
                                <span className="font-display font-bold text-lg text-[#3b1f1a]">
                                  {Math.floor((counts[item.id] || 0) / capacity)}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  const current = counts[item.id] || 0
                                  // Add 1 capacity unit
                                  const newVal = current + capacity
                                  handleInputChange(item.id, newVal.toString())
                                }}
                                className="w-10 h-10 flex items-center justify-center bg-white rounded-md shadow-sm text-[#15803d] font-bold text-xl hover:bg-[#15803d] hover:text-white transition-colors active:scale-95"
                              >
                                +
                              </button>
                            </div>

                            {/* Partial / Remainder Controls */}
                            <div className="flex gap-2">
                              {countingMode === 'fraction' ? (
                                // FRACTION BUTTONS
                                [0.25, 0.5, 0.75].map((frac) => (
                                  <button
                                    key={frac}
                                    type="button"
                                    onClick={() => {
                                      const currentValue = counts[item.id] ?? 0
                                      // Base keeps the full packages
                                      const currentBase = Math.floor(currentValue / capacity) * capacity
                                      // Add the fraction of ONE package
                                      const remainder = frac * capacity
                                      handleInputChange(item.id, (currentBase + remainder).toString())
                                    }}
                                    className="flex-1 py-2 bg-[#f6f1e7] text-[#c08a3e] rounded-lg text-xs font-bold hover:bg-[#c08a3e] hover:text-white transition-colors border border-transparent hover:border-[#c08a3e]"
                                  >
                                    +{frac === 0.5 ? '½' : frac === 0.25 ? '¼' : '¾'}
                                  </button>
                                ))
                              ) : (
                                // FUZZY BUTTONS (Modified Percentages)
                                [
                                  { val: 0.20, label: 'Poco (20%)' },
                                  { val: 0.75, label: 'Medio (75%)' },
                                  { val: 1.0, label: 'Lleno (100%)' }
                                ].map((opt) => (
                                  <button
                                    key={opt.val}
                                    type="button"
                                    onClick={() => {
                                      const currentValue = counts[item.id] ?? 0
                                      const currentBase = Math.floor(currentValue / capacity) * capacity
                                      const remainder = opt.val * capacity
                                      handleInputChange(item.id, (currentBase + remainder).toString())
                                    }}
                                    className="flex-1 py-2 border border-[#e5e0d4] text-[#3b1f1a]/70 rounded-lg text-[10px] font-bold hover:bg-[#f6f1e7] hover:text-[#3b1f1a] transition-all flex flex-col items-center justify-center"
                                  >
                                    <span>{opt.label.split(' ')[0]}</span>
                                    <span className="text-[8px] opacity-60">{opt.label.split(' ')[1]}</span>
                                  </button>
                                ))
                              )}
                            </div>

                            <p className="text-center text-[10px] text-[#3b1f1a]/40 italic">
                              Usa +/- para paquetes completos. Botones para lo abierto.
                            </p>
                          </div>
                        )}

                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-6">
          <label className="block text-sm font-bold text-[#3b1f1a] mb-2 uppercase tracking-wide opacity-80">Comentarios</label>
          <textarea
            rows={3}
            className="w-full p-4 border border-[#e5e0d4] rounded-xl bg-white text-[#3b1f1a] focus:ring-2 focus:ring-[#c08a3e] focus:border-transparent outline-none transition-all resize-none shadow-sm"
            placeholder="Incidencias, roturas o notas..."
            value={comments}
            onChange={e => setComments(e.target.value)}
          />
        </div>

        <div className="sticky bottom-4 pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !isOnline}
            className="w-full bg-[#c08a3e] text-white py-4 rounded-xl font-display font-bold text-xl shadow-xl shadow-[#c08a3e]/30 hover:bg-[#a67633] transition-all active:scale-[0.98] disabled:opacity-70 disabled:grayscale"
          >
            {isSubmitting ? 'Guardando...' : !isOnline ? '⚠️ Sin Conexión - Datos Guardados' : 'Finalizar Conteo'}
          </button>
          {lastSaved && (
            <p className="text-center text-xs text-[#3b1f1a]/50 mt-2">
              💾 Último guardado: {lastSaved.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      </form>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </>
  )
}