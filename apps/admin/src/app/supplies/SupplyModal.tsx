'use client'
import { useState, useEffect } from 'react'
import { createSupply, updateSupply } from './actions'
import { getUsers } from '../team/user-actions'
import { Supply, SupplyType, CountingMode, UserProfile } from '@trailer/shared'

type Props = {
  supply?: Supply // Si viene, es edición. Si no, es crear.
  onClose: () => void
}

export function SupplyModal({ supply, onClose }: Props) {
  const [isSaving, setIsSaving] = useState(false)
  // Hardcoded to purchase
  const supplyType: SupplyType = 'purchase'
  const [countingMode, setCountingMode] = useState<CountingMode>(supply?.counting_mode || 'integer')

  const [users, setUsers] = useState<Pick<UserProfile, 'id' | 'display_name' | 'role'>[]>([])

  useEffect(() => {
    getUsers().then(data => setUsers(data as any))
  }, [])

  // Purchase Mode State
  const [packageCost, setPackageCost] = useState(supply?.package_cost || 0)
  const [quantityPerPackage, setQuantityPerPackage] = useState(supply?.quantity_per_package || 1)
  const [shrinkagePercent, setShrinkagePercent] = useState(supply?.shrinkage_percent || 0)
  const [minStock, setMinStock] = useState(supply?.min_stock || 5)
  const [calculatedUnitCost, setCalculatedUnitCost] = useState(0)
  const [supplyUnitLabel, setSupplyUnitLabel] = useState<string>(supply?.unit || 'kg')

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
    // Asegurar que el tipo se envíe como purchase
    formData.set('supply_type', 'purchase')

    // Usa el costo unitario calculado de compra
    formData.set('cost_per_unit', calculatedUnitCost.toFixed(2))
    formData.set('shrinkage_percent', shrinkagePercent.toString())

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
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {supply ? 'Editar Insumo de Compra' : 'Nuevo Insumo de Compra'}
          </h2>
          <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-bold rounded-full">
            🛒 Compra a Proveedor
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase">Nombre *</label>
            <input name="name" defaultValue={supply?.name} required className="w-full p-2 border rounded" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase">Unidad *</label>
            <select
              name="unit"
              defaultValue={supply?.unit || 'kg'}
              className="w-full p-2 border rounded"
              onChange={(e) => setSupplyUnitLabel(e.target.value)}
            >
              <option value="kg">Kilogramos (kg)</option>
              <option value="lt">Litros (lt)</option>
              <option value="pz">Piezas (pz)</option>
              <option value="gr">Gramos (gr)</option>
              <option value="ml">Mililitros (ml)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase">Stock Mínimo (Alerta)</label>
            <input
              name="min_stock"
              type="number"
              step="0.01"
              value={minStock}
              onChange={(e) => setMinStock(parseFloat(e.target.value) || 0)}
              className="w-full p-2 border rounded"
            />
            <p className="text-[10px] text-gray-500 mt-1">
              Alerta cuando queden menos de <strong>{minStock} {supplyUnitLabel}</strong>
            </p>
          </div>

          <div className="bg-purple-50 p-3 rounded border border-purple-100">
            <label className="block text-xs font-bold text-purple-800 uppercase mb-1">
              ⚖️ Smart Conversion (Opcional)
            </label>
            <label className="block text-[10px] text-purple-600 mb-2">
              Si vendes por pieza pero cuentas en gramos, define cuánto pesa 1 unidad.
            </label>
            <div className="flex items-center gap-2">
              <input
                name="average_weight"
                type="number"
                step="0.01"
                min="0"
                defaultValue={supply?.average_weight || ''}
                placeholder="Ej. 20 (gramos)"
                className="w-full p-2 border rounded border-purple-200"
              />
              <span className="text-xs font-bold text-purple-700">g/pz</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Modo de Conteo *</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setCountingMode('integer')}
              className={`p-2 border rounded text-sm text-center transition-all ${countingMode === 'integer' ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold ring-1 ring-blue-500' : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'}`}
            >
              🔢 Enteros
              <span className="block text-[10px] font-normal text-gray-400 mt-1">Piezas exactas</span>
            </button>
            <button
              type="button"
              onClick={() => setCountingMode('fraction')}
              className={`p-2 border rounded text-sm text-center transition-all ${countingMode === 'fraction' ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold ring-1 ring-blue-500' : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'}`}
            >
              💧 Fracción
              <span className="block text-[10px] font-normal text-gray-400 mt-1">1/4, 1/2, 3/4</span>
            </button>
            <button
              type="button"
              onClick={() => setCountingMode('fuzzy')}
              className={`p-2 border rounded text-sm text-center transition-all ${countingMode === 'fuzzy' ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold ring-1 ring-blue-500' : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'}`}
            >
              👁️ Ojímetro
              <span className="block text-[10px] font-normal text-gray-400 mt-1">Poco, Mucho</span>
            </button>
          </div>
          <input type="hidden" name="counting_mode" value={countingMode} />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Clasificación ABC *</label>
          <div className="grid grid-cols-3 gap-2">
            {['A', 'B', 'C'].map((cls) => (
              <label key={cls} className={`flex flex-col items-center justify-center p-2 border rounded cursor-pointer transition-all ${(supply?.abc_classification || 'A') === cls
                ? 'bg-orange-50 border-orange-500 text-orange-700 font-bold ring-1 ring-orange-500'
                : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'
                }`}>
                <input
                  type="radio"
                  name="abc_classification"
                  value={cls}
                  defaultChecked={(supply?.abc_classification || 'A') === cls}
                  className="sr-only"
                />
                <span className="text-lg">{cls}</span>
                <span className="text-[10px] font-normal text-gray-400 mt-1 text-center">
                  {cls === 'A' ? 'Diario' : cls === 'B' ? 'Lun/Jue' : 'Semanal'}
                </span>
              </label>
            ))}
          </div>
        </div>


        {/* Sección de Costos - SIEMPRE VISIBLE PARA COMPRAS */}
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
                step="0.001"
                defaultValue={supply?.quantity_per_package || 1}
                onChange={(e) => setQuantityPerPackage(parseFloat(e.target.value) || 1)}
                required
                className="w-full p-2 border rounded bg-white"
              />
              <p className="text-[10px] text-gray-500 mt-1">
                Esto significa: <strong>{quantityPerPackage} {supplyUnitLabel}</strong>
                {quantityPerPackage >= 100 && (supplyUnitLabel === 'kg' || supplyUnitLabel === 'lt') && (
                  <span className="block text-orange-600 font-bold">
                    ⚠️ ¿Son {supplyUnitLabel} o gramos/ml?
                  </span>
                )}
              </p>
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

          <div className="md:col-span-2 mt-4 bg-orange-50 p-3 rounded border border-orange-100">
            <label className="block text-xs font-bold text-orange-800 uppercase mb-2">
              👤 Responsable de Compra (Opcional)
            </label>
            <select
              name="assigned_user_id"
              defaultValue={supply?.assigned_user_id || ''}
              className="w-full p-2 border rounded bg-white"
            >
              <option value="">-- General / Proveedor --</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.display_name} ({u.role})</option>
              ))}
            </select>
            <p className="text-[10px] text-orange-600 mt-1">
              Si seleccionas a alguien, este insumo aparecerá predeterminadamente en SU lista de compras.
            </p>
          </div>
        </div>

        {/* Categoría (Común) */}
        <div className="pt-4">
          <label className="block text-xs font-bold text-gray-500 uppercase">Categoría</label>
          <select
            name="category"
            defaultValue={supply?.category || 'Abarrotes'}
            className="w-full p-2 border rounded bg-white"
          >
            {[
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
            ].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <button type="button" onClick={onClose} className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded font-bold">Cancelar</button>
          <button type="submit" disabled={isSaving} className="flex-1 py-2 bg-orange-600 text-white hover:bg-orange-700 rounded font-bold disabled:opacity-50">
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form >
    </div >
  )
}