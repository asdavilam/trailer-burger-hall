'use client'
import { useState, useEffect } from 'react'
import { createSupply, updateSupply } from './actions'
import { Supply } from '@trailer/shared'

type Props = {
  supply?: Supply // Si viene, es edición. Si no, es crear.
  onClose: () => void
}

export function SupplyModal({ supply, onClose }: Props) {
  const [isSaving, setIsSaving] = useState(false)
  const [packageCost, setPackageCost] = useState(supply?.package_cost || 0)
  const [quantityPerPackage, setQuantityPerPackage] = useState(supply?.quantity_per_package || 1)
  const [calculatedUnitCost, setCalculatedUnitCost] = useState(0)

  // Calcular costo unitario cuando cambien los valores del paquete
  useEffect(() => {
    if (quantityPerPackage > 0) {
      setCalculatedUnitCost(packageCost / quantityPerPackage)
    } else {
      setCalculatedUnitCost(0)
    }
  }, [packageCost, quantityPerPackage])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    const formData = new FormData(e.currentTarget)

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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-900">
          {supply ? 'Editar Insumo' : 'Nuevo Insumo'}
        </h2>

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

        {/* Sección de Costos */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-bold text-gray-700 mb-3">💰 Información de Compra</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase">Presentación</label>
              <input
                name="purchase_unit"
                type="text"
                defaultValue={supply?.purchase_unit || ''}
                placeholder="Ej: Caja, Bulto, Botella"
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase">Costo del Paquete ($) *</label>
              <input
                name="package_cost"
                type="number"
                step="0.01"
                defaultValue={supply?.package_cost || 0}
                onChange={(e) => setPackageCost(parseFloat(e.target.value) || 0)}
                required
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase">Cantidad por Paquete *</label>
              <input
                name="quantity_per_package"
                type="number"
                step="0.01"
                defaultValue={supply?.quantity_per_package || 1}
                onChange={(e) => setQuantityPerPackage(parseFloat(e.target.value) || 1)}
                required
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          {/* Costo Unitario Calculado */}
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-xs text-blue-600 font-bold uppercase mb-1">Costo Unitario Calculado</p>
            <p className="text-2xl font-bold text-blue-700">
              ${calculatedUnitCost.toFixed(2)} <span className="text-sm text-blue-500">por unidad</span>
            </p>
          </div>
        </div>

        {/* Información Adicional */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-bold text-gray-700 mb-3">📋 Información Adicional</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase">Proveedor</label>
              <input name="provider" defaultValue={supply?.provider || ''} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase">Marca</label>
              <input name="brand" defaultValue={supply?.brand || ''} className="w-full p-2 border rounded" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase">Categoría</label>
              <input name="category" defaultValue={supply?.category || ''} placeholder="ej. Carnes, Vegetales, Lácteos" className="w-full p-2 border rounded" />
            </div>
          </div>
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