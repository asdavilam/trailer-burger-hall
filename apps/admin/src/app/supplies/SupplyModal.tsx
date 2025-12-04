'use client'
import { useState, useEffect } from 'react'
import { createSupply, updateSupply, getSupplyIngredients, addSupplyIngredient, removeSupplyIngredient, getSupplies } from './actions'
import { Supply, SupplyType, SupplyIngredient } from '@trailer/shared'

type Props = {
  supply?: Supply // Si viene, es edición. Si no, es crear.
  onClose: () => void
}

export function SupplyModal({ supply, onClose }: Props) {
  const [isSaving, setIsSaving] = useState(false)
  const [supplyType, setSupplyType] = useState<SupplyType>(supply?.supply_type || 'purchase')

  // Purchase Mode State
  const [packageCost, setPackageCost] = useState(supply?.package_cost || 0)
  const [quantityPerPackage, setQuantityPerPackage] = useState(supply?.quantity_per_package || 1)
  const [shrinkagePercent, setShrinkagePercent] = useState(supply?.shrinkage_percent || 0)
  const [calculatedUnitCost, setCalculatedUnitCost] = useState(0)

  // Production Mode State
  const [manualCost, setManualCost] = useState(supply?.cost_per_unit || 0)
  const [yieldQuantity, setYieldQuantity] = useState<number | string>(supply?.yield_quantity || 1)
  const [ingredients, setIngredients] = useState<SupplyIngredient[]>([])
  const [availableSupplies, setAvailableSupplies] = useState<Supply[]>([])
  const [showIngredientSelector, setShowIngredientSelector] = useState(false)

  // Yield Calculator State
  const [showYieldCalc, setShowYieldCalc] = useState(false)
  const [unitWeight, setUnitWeight] = useState(0) // Peso de la unidad final (ej. 115g)

  // Cargar ingredientes si es edición y es producción
  useEffect(() => {
    if (supply && supplyType === 'production') {
      loadIngredients()
    }
  }, [supply, supplyType])

  // Cargar lista de insumos disponibles para el selector
  useEffect(() => {
    if (supplyType === 'production') {
      getSupplies().then(setAvailableSupplies)
    }
  }, [supplyType])

  const loadIngredients = async () => {
    if (!supply) return
    const data = await getSupplyIngredients(supply.id)
    setIngredients(data)
  }

  // Calcular costo unitario cuando cambien los valores del paquete (solo en modo compra)
  useEffect(() => {
    if (quantityPerPackage > 0) {
      setCalculatedUnitCost(packageCost / quantityPerPackage)
    } else {
      setCalculatedUnitCost(0)
    }
  }, [packageCost, quantityPerPackage])

  // Calcular costo total de ingredientes
  const totalIngredientsCost = ingredients.reduce((sum, ing) => {
    const cost = ing.child_supply?.cost_per_unit || 0
    return sum + (cost * ing.quantity)
  }, 0)

  const yieldVal = Number(yieldQuantity) || 0
  const calculatedProductionCost = yieldVal > 0 ? totalIngredientsCost / yieldVal : 0

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    const formData = new FormData(e.currentTarget)
    // Asegurar que el tipo se envíe
    formData.set('supply_type', supplyType)

    // Si es producción y tiene ingredientes, el costo unitario es calculado
    if (supplyType === 'production' && ingredients.length > 0) {
      formData.set('cost_per_unit', calculatedProductionCost.toFixed(2))
    } else if (supplyType === 'production') {
      // Si es producción pero no tiene ingredientes, usa el costo manual
      formData.set('cost_per_unit', manualCost.toFixed(2))
    } else {
      // Si es compra, usa el costo unitario calculado de compra
      formData.set('cost_per_unit', calculatedUnitCost.toFixed(2))
      formData.set('shrinkage_percent', shrinkagePercent.toString())
    }

    let res
    if (supply) {
      res = await updateSupply(supply.id, formData)
    } else {
      res = await createSupply(formData)
    }

    setIsSaving(false)
    if (res?.error) alert(res.error)
    else onClose()
  }

  const handleAddIngredient = async (childId: string) => {
    if (!supply) return

    try {
      // Default quantity 1
      const res = await addSupplyIngredient(supply.id, childId, 1)
      if (res?.error) {
        alert(`Error al agregar ingrediente: ${res.error}`)
        return
      }
      await loadIngredients()
      setShowIngredientSelector(false)
    } catch (error) {
      console.error(error)
      alert('Error inesperado al agregar ingrediente')
    }
  }

  const handleRemoveIngredient = async (ingredientId: string) => {
    if (!supply) return
    await removeSupplyIngredient(ingredientId, supply.id)
    await loadIngredients()
  }

  // Lógica de Cálculo Automático de Rendimiento
  const calculateYield = () => {
    // 1. Sumar peso efectivo de ingredientes (Peso - Merma)
    let totalEffectiveWeight = 0

    ingredients.forEach(ing => {
      const qty = ing.quantity
      const shrinkage = (ing.child_supply?.shrinkage_percent || 0) / 100

      // Conversión simple (Mejorar en el futuro con tabla de conversiones real)
      let weightInGrams = 0
      if (ing.child_supply?.unit === 'kg') weightInGrams = qty * 1000
      else if (ing.child_supply?.unit === 'lt') weightInGrams = qty * 1000 // Aprox agua
      else if (ing.child_supply?.unit === 'gr' || ing.child_supply?.unit === 'ml') weightInGrams = qty
      else weightInGrams = qty * 0 // Piezas u otros no suman peso automáticamente sin saber cuánto pesan

      const effectiveWeight = weightInGrams * (1 - shrinkage)
      totalEffectiveWeight += effectiveWeight
    })

    if (unitWeight > 0) {
      const calculatedYield = totalEffectiveWeight / unitWeight
      setYieldQuantity(parseFloat(calculatedYield.toFixed(2)))
      setShowYieldCalc(false)
    } else {
      alert('Ingresa el peso por unidad final (ej. 115g para una carne)')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {supply ? 'Editar Insumo' : 'Nuevo Insumo'}
          </h2>
          {/* Switcher de Tipo */}
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setSupplyType('purchase')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${supplyType === 'purchase' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              🛒 Compra
            </button>
            <button
              type="button"
              onClick={() => setSupplyType('production')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${supplyType === 'production' ? 'bg-white shadow text-purple-700' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              👩‍🍳 Producción
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase">Nombre *</label>
            <input name="name" defaultValue={supply?.name} required className="w-full p-2 border rounded" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase">Unidad *</label>
            <select name="unit" defaultValue={supply?.unit || 'kg'} className="w-full p-2 border rounded">
              <option value="kg">Kilogramos (kg)</option>
              <option value="lt">Litros (lt)</option>
              <option value="pz">Piezas (pz)</option>
              <option value="gr">Gramos (gr)</option>
              <option value="ml">Mililitros (ml)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase">Stock Mínimo (Alerta)</label>
            <input name="min_stock" type="number" step="0.01" defaultValue={supply?.min_stock || 5} className="w-full p-2 border rounded" />
          </div>
        </div>

        {/* Sección de Costos - CONDICIONAL */}
        {supplyType === 'purchase' ? (
          <div className="border-t pt-4 bg-gray-50 -mx-6 px-6 pb-4">
            <h3 className="text-sm font-bold text-gray-700 mb-3">💰 Información de Compra</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase">Presentación</label>
                <input
                  name="purchase_unit"
                  type="text"
                  defaultValue={supply?.purchase_unit || ''}
                  placeholder="Ej: Caja, Bulto"
                  className="w-full p-2 border rounded bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase">Costo Paquete ($) *</label>
                <input
                  name="package_cost"
                  type="number"
                  step="0.01"
                  defaultValue={supply?.package_cost || 0}
                  onChange={(e) => setPackageCost(parseFloat(e.target.value) || 0)}
                  required
                  className="w-full p-2 border rounded bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase">Cant. por Paquete *</label>
                <input
                  name="quantity_per_package"
                  type="number"
                  step="0.01"
                  defaultValue={supply?.quantity_per_package || 1}
                  onChange={(e) => setQuantityPerPackage(parseFloat(e.target.value) || 1)}
                  required
                  className="w-full p-2 border rounded bg-white"
                />
              </div>
            </div>

            {/* Merma Input */}
            <div className="mt-4">
              <label className="block text-xs font-bold text-red-500 uppercase">Merma Estimada (%)</label>
              <div className="flex items-center gap-2">
                <input
                  name="shrinkage_percent"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  defaultValue={shrinkagePercent}
                  onChange={(e) => setShrinkagePercent(parseFloat(e.target.value) || 0)}
                  className="w-24 p-2 border rounded bg-white border-red-200"
                />
                <span className="text-sm text-gray-500">% se pierde al limpiar/procesar.</span>
              </div>
            </div>

            {/* Costo Unitario Calculado */}
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded flex justify-between items-center">
              <div>
                <p className="text-xs text-blue-600 font-bold uppercase mb-1">Costo Unitario (Calculado)</p>
                <p className="text-2xl font-bold text-blue-700">
                  ${calculatedUnitCost.toFixed(2)} <span className="text-sm text-blue-500">por unidad</span>
                </p>
              </div>
              {shrinkagePercent > 0 && (
                <div className="text-right">
                  <p className="text-xs text-red-500 font-bold uppercase mb-1">Costo Real (con Merma)</p>
                  <p className="text-lg font-bold text-red-600">
                    ${(calculatedUnitCost / (1 - (shrinkagePercent / 100))).toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            {/* Info Adicional solo para compras */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 border-t border-gray-200 pt-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase">Proveedor</label>
                <input name="provider" defaultValue={supply?.provider || ''} className="w-full p-2 border rounded bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase">Marca</label>
                <input name="brand" defaultValue={supply?.brand || ''} className="w-full p-2 border rounded bg-white" />
              </div>
            </div>
          </div>
        ) : (
          <div className="border-t pt-4 bg-purple-50 -mx-6 px-6 pb-4">
            <h3 className="text-sm font-bold text-purple-900 mb-3">👩‍🍳 Receta de Producción</h3>
            <p className="text-xs text-purple-700 mb-4">
              Define los ingredientes y el rendimiento para calcular el costo automáticamente.
            </p>

            {/* Rendimiento con Calculadora */}
            <div className="mb-4 bg-white p-3 rounded border border-purple-100">
              <div className="flex justify-between items-end mb-2">
                <label className="block text-xs font-bold text-purple-800 uppercase">Rendimiento (Unidades Resultantes) *</label>
                <button
                  type="button"
                  onClick={() => setShowYieldCalc(!showYieldCalc)}
                  className="text-xs text-blue-600 hover:underline font-bold"
                >
                  ⚡ Calcular Automáticamente
                </button>
              </div>

              {showYieldCalc && (
                <div className="mb-3 p-3 bg-blue-50 rounded border border-blue-100 text-sm">
                  <p className="font-bold text-blue-800 mb-2">Calculadora de Rendimiento</p>
                  <p className="text-xs text-blue-600 mb-2">
                    Suma el peso de los ingredientes (menos merma) y divide entre el peso de tu unidad final.
                  </p>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-500">Peso por Unidad Final (gramos)</label>
                      <input
                        type="number"
                        value={unitWeight || ''}
                        onChange={(e) => setUnitWeight(parseFloat(e.target.value))}
                        placeholder="Ej. 115 (para carne)"
                        className="w-full p-1 border rounded"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={calculateYield}
                      className="bg-blue-600 text-white px-3 py-1 rounded font-bold hover:bg-blue-700"
                    >
                      Aplicar
                    </button>
                  </div>
                </div>
              )}

              <input
                name="yield_quantity"
                type="number"
                step="0.01"
                value={yieldQuantity}
                onChange={(e) => setYieldQuantity(e.target.value === '' ? '' : parseFloat(e.target.value))}
                required
                className="w-full p-2 border rounded bg-white border-purple-200 font-bold text-lg"
              />
            </div>

            {/* Lista de Ingredientes (Solo si ya existe el insumo) */}
            {supply ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-purple-800 uppercase">Ingredientes</label>
                  <button
                    type="button"
                    onClick={() => setShowIngredientSelector(!showIngredientSelector)}
                    className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded hover:bg-purple-300 font-bold"
                  >
                    + Agregar Ingrediente
                  </button>
                </div>

                {showIngredientSelector && (
                  <div className="p-2 bg-white border border-purple-200 rounded shadow-sm mb-2">
                    <p className="text-xs font-bold text-gray-500 mb-2">Selecciona un insumo:</p>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {availableSupplies
                        .filter(s => s.id !== supply.id) // Evitar auto-referencia
                        .map(s => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => handleAddIngredient(s.id)}
                            className="block w-full text-left text-sm px-2 py-1 hover:bg-purple-50 rounded flex justify-between"
                          >
                            <span>{s.name}</span>
                            <span className="text-gray-400 text-xs">
                              {s.shrinkage_percent && s.shrinkage_percent > 0 ? `Merma: ${s.shrinkage_percent}%` : ''}
                            </span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {ingredients.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No hay ingredientes agregados.</p>
                ) : (
                  <div className="space-y-2">
                    {ingredients.map(ing => (
                      <div key={ing.id} className="flex justify-between items-center bg-white p-2 rounded border border-purple-100">
                        <div>
                          <p className="text-sm font-bold text-gray-800">{ing.child_supply?.name}</p>
                          <p className="text-xs text-gray-500">
                            {ing.quantity} {ing.child_supply?.unit} x ${ing.child_supply?.cost_per_unit.toFixed(2)}
                            {ing.child_supply?.shrinkage_percent ? <span className="text-red-500 ml-1">(Merma {ing.child_supply.shrinkage_percent}%)</span> : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-700">
                            ${((ing.child_supply?.cost_per_unit || 0) * ing.quantity).toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveIngredient(ing.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Resumen de Costos */}
                <div className="mt-4 p-3 bg-white border border-purple-200 rounded shadow-sm">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Costo Total Ingredientes:</span>
                    <span className="font-bold">${totalIngredientsCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1 border-b border-gray-100 pb-1">
                    <span className="text-gray-600">Rendimiento:</span>
                    <span className="font-bold">{yieldQuantity} unidades</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-purple-700 pt-1">
                    <span>Costo Unitario:</span>
                    <span>${calculatedProductionCost.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 text-yellow-800 text-sm rounded border border-yellow-200">
                ℹ️ Guarda el insumo primero para agregar ingredientes.
                <input type="hidden" name="manual_cost" value="0" />
              </div>
            )}
          </div>
        )}

        {/* Categoría (Común) */}
        <div className="pt-4">
          <label className="block text-xs font-bold text-gray-500 uppercase">Categoría</label>
          <input name="category" defaultValue={supply?.category || ''} placeholder="ej. Carnes, Vegetales, Salsas" className="w-full p-2 border rounded" />
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <button type="button" onClick={onClose} className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded font-bold">Cancelar</button>
          <button type="submit" disabled={isSaving} className="flex-1 py-2 bg-orange-600 text-white hover:bg-orange-700 rounded font-bold disabled:opacity-50">
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  )
}