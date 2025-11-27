'use client'
import { useState } from 'react'
import { createSupply, updateSupply } from './actions'
import { Supply } from '@trailer/shared'

type Props = {
  supply?: Supply // Si viene, es edición. Si no, es crear.
  onClose: () => void
}

export function SupplyModal({ supply, onClose }: Props) {
  const [isSaving, setIsSaving] = useState(false)

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
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900">
          {supply ? 'Editar Insumo' : 'Nuevo Insumo'}
        </h2>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase">Nombre</label>
          <input name="name" defaultValue={supply?.name} required className="w-full p-2 border rounded" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase">Unidad</label>
            <select name="unit" defaultValue={supply?.unit || 'kg'} className="w-full p-2 border rounded">
              <option value="kg">Kilogramos (kg)</option>
              <option value="lt">Litros (lt)</option>
              <option value="pz">Piezas (pz)</option>
              <option value="gr">Gramos (gr)</option>
              <option value="ml">Mililitros (ml)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase">Costo Unitario ($)</label>
            <input name="cost" type="number" step="0.01" defaultValue={supply?.cost_per_unit} required className="w-full p-2 border rounded" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase">Stock Mínimo (Alerta)</label>
            <input name="min_stock" type="number" step="0.01" defaultValue={supply?.min_stock || 5} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase">Proveedor</label>
            <input name="provider" defaultValue={supply?.provider || ''} className="w-full p-2 border rounded" />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <button type="button" onClick={onClose} className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded font-bold">Cancelar</button>
          <button type="submit" disabled={isSaving} className="flex-1 py-2 bg-orange-600 text-white hover:bg-orange-700 rounded font-bold">
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  )
}