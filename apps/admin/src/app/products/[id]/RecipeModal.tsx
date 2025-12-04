'use client'
import { useState, useEffect, useTransition } from 'react'
import { getVariantIngredients, addIngredientToVariant, removeIngredientV2 } from '../actions'
import { getSupplies } from '@/app/supplies/actions'
import { getFinancialSettings, FinancialSettings } from '@/app/settings/actions'

type Props = {
  variant: { id: string, name: string }
  onClose: () => void
}

export function RecipeModal({ variant, onClose }: Props) {
  const [ingredients, setIngredients] = useState<any[]>([])
  const [supplies, setSupplies] = useState<any[]>([])
  const [settings, setSettings] = useState<FinancialSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  // Formulario local
  const [supplyId, setSupplyId] = useState('')
  const [qty, setQty] = useState('')
  const [selectedUnit, setSelectedUnit] = useState('')

  // Calculadora de Precio
  const [salePrice, setSalePrice] = useState<string>('')
  const [desiredMargin, setDesiredMargin] = useState<string>('')

  // Cargar datos al abrir
  useEffect(() => {
    Promise.all([
      getVariantIngredients(variant.id),
      getSupplies(),
      getFinancialSettings()
    ]).then(([ing, sup, set]) => {
      setIngredients(ing)
      setSupplies(sup)
      setSettings(set)
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
      setSelectedUnit(supply.unit)
    }
  }, [supplyId, supplies])

  const refresh = async () => {
    const data = await getVariantIngredients(variant.id)
    setIngredients(data)
  }

  // Lógica de conversión (simplificada)
  const convertToStorageUnit = (quantity: number, fromUnit: string, toBaseUnit: string) => {
    if (fromUnit === toBaseUnit) return quantity
    if (fromUnit === 'g' && toBaseUnit === 'kg') return quantity / 1000
    if (fromUnit === 'ml' && toBaseUnit === 'lt') return quantity / 1000
    if (fromUnit === 'kg' && toBaseUnit === 'g') return quantity * 1000
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

  // --- CÁLCULOS FINANCIEROS ---
  const directCost = ingredients.reduce((sum, item) => sum + (item.supply?.cost_per_unit * item.quantity), 0)

  let fixedUnitCost = 0
  if (settings) {
    const totalFixedMonthly =
      settings.rent_cost +
      settings.salaries_cost +
      settings.water_cost +
      settings.electricity_cost +
      settings.marketing_cost +
      settings.taxes_cost +
      settings.other_costs

    const totalUnitsPerMonth = settings.work_days_per_month * settings.avg_sales_per_day

    if (totalUnitsPerMonth > 0) {
      fixedUnitCost = totalFixedMonthly / totalUnitsPerMonth
    }
  }

  const totalUnitCost = directCost + fixedUnitCost
  const price = parseFloat(salePrice) || 0
  const profit = price - totalUnitCost
  const margin = price > 0 ? (profit / price) * 100 : 0

  // Handlers para la calculadora
  const handlePriceChange = (val: string) => {
    setSalePrice(val)
    const p = parseFloat(val)
    if (p > 0 && totalUnitCost > 0) {
      const m = ((p - totalUnitCost) / p) * 100
      setDesiredMargin(m.toFixed(1))
    } else {
      setDesiredMargin('')
    }
  }

  const handleMarginChange = (val: string) => {
    setDesiredMargin(val)
    const m = parseFloat(val)
    if (!isNaN(m) && m < 100 && totalUnitCost > 0) {
      // Precio = Costo / (1 - Margen%)
      const p = totalUnitCost / (1 - (m / 100))
      setSalePrice(p.toFixed(2))
    } else {
      setSalePrice('')
    }
  }

  // Opciones de unidad
  const currentSupply = supplies.find(s => s.id === supplyId)
  const unitOptions = currentSupply ? getUnitOptions(currentSupply.unit) : []

  function getUnitOptions(baseUnit: string) {
    switch (baseUnit) {
      case 'kg': return [{ value: 'kg', label: 'kg' }, { value: 'g', label: 'g' }]
      case 'lt': return [{ value: 'lt', label: 'lt' }, { value: 'ml', label: 'ml' }]
      case 'g': return [{ value: 'g', label: 'g' }, { value: 'kg', label: 'kg' }]
      case 'ml': return [{ value: 'ml', label: 'ml' }, { value: 'lt', label: 'lt' }]
      default: return [{ value: baseUnit, label: baseUnit }]
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">

        {/* COLUMNA IZQUIERDA: INGREDIENTES */}
        <div className="flex-1 flex flex-col border-r border-gray-200 min-w-[300px]">
          <div className="bg-purple-50 p-4 border-b border-purple-100">
            <h3 className="font-bold text-purple-900 text-lg capitalize">Receta: {variant.name}</h3>
            <p className="text-xs text-purple-600">Insumos y cantidades.</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <p className="text-center text-gray-400 mt-10">Cargando...</p>
            ) : ingredients.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed rounded-lg">
                <p className="text-gray-400">Sin ingredientes.</p>
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

          {/* Formulario Agregar */}
          <div className="p-4 bg-gray-50 border-t space-y-3">
            <select
              className="w-full p-2 border rounded text-sm"
              value={supplyId}
              onChange={e => setSupplyId(e.target.value)}
            >
              <option value="">+ Agregar Insumo...</option>
              {supplies.map(s => (
                <option key={s.id} value={s.id}>{s.name} (${s.cost_per_unit}/{s.unit})</option>
              ))}
            </select>

            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Cant."
                className="w-20 p-2 border rounded text-sm"
                value={qty}
                onChange={e => setQty(e.target.value)}
              />
              <select
                className="flex-1 p-2 border rounded text-sm bg-white"
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
                className="px-4 py-2 bg-purple-600 text-white rounded font-bold hover:bg-purple-700 disabled:opacity-50"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: ANÁLISIS DE COSTOS */}
        <div className="w-full md:w-[400px] bg-gray-50 flex flex-col overflow-y-auto">
          <div className="p-6 space-y-6">
            <h3 className="font-bold text-gray-800 text-lg border-b pb-2">📊 Análisis de Costos</h3>

            {/* Resumen de Costos */}
            <div className="space-y-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Costo Directo (Insumos)</span>
                <span className="font-bold">${directCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 flex items-center gap-1">
                  Costo Fijo Unitario
                  <span className="text-[10px] bg-gray-200 px-1 rounded text-gray-500 cursor-help" title="Calculado en Configuración">?</span>
                </span>
                <span className="font-bold text-orange-600">+ ${fixedUnitCost.toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t flex justify-between items-center">
                <span className="font-bold text-gray-800">COSTO TOTAL UNITARIO</span>
                <span className="font-bold text-xl text-gray-900">${totalUnitCost.toFixed(2)}</span>
              </div>
            </div>

            {/* Calculadora de Ganancia */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Margen Deseado %</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={desiredMargin}
                      onChange={e => handleMarginChange(e.target.value)}
                      placeholder="30"
                      className="w-full p-2 border rounded-lg font-bold text-lg focus:ring-2 ring-purple-500 outline-none"
                    />
                    <span className="absolute right-3 top-2 text-gray-400">%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Precio Sugerido</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={salePrice}
                      onChange={e => handlePriceChange(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-7 p-2 border rounded-lg font-bold text-lg focus:ring-2 ring-purple-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {price > 0 && (
                <div className={`p-4 rounded-xl border ${profit > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium opacity-80">Ganancia Neta</span>
                    <span className={`font-bold text-lg ${profit > 0 ? 'text-green-700' : 'text-red-700'}`}>
                      ${profit.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                    <div
                      className={`h-2.5 rounded-full ${profit > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(Math.max(margin, 0), 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-xs font-bold opacity-60">
                    Margen Real: {margin.toFixed(1)}%
                  </div>
                </div>
              )}
            </div>

            {/* Breakdown Visual (Mini Gráfica) */}
            {totalUnitCost > 0 && (
              <div className="mt-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Distribución del Costo</h4>
                <div className="flex h-4 rounded-full overflow-hidden w-full">
                  <div
                    className="bg-blue-500 h-full"
                    style={{ width: `${(directCost / totalUnitCost) * 100}%` }}
                    title={`Insumos: $${directCost.toFixed(2)}`}
                  />
                  <div
                    className="bg-orange-400 h-full"
                    style={{ width: `${(fixedUnitCost / totalUnitCost) * 100}%` }}
                    title={`Fijos: $${fixedUnitCost.toFixed(2)}`}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                  <span className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500 rounded-full" /> Insumos</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 bg-orange-400 rounded-full" /> Fijos</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-auto p-4 border-t border-gray-200">
            <button onClick={onClose} className="w-full py-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 font-medium">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}