'use client'
import { updateProductBasic } from '../actions'
import { useState } from 'react'

export function BasicInfoForm({ product }: { product: any }) {
  const [isSaving, setIsSaving] = useState(false)

  return (
    <form 
      action={async (fd) => {
        setIsSaving(true)
        await updateProductBasic(product.id, fd)
        setIsSaving(false)
      }}
      className="bg-white p-6 rounded-xl shadow-sm border mb-6 flex gap-4 items-end"
    >
      <div className="flex-1">
        <label className="text-xs font-bold text-gray-500 uppercase">Nombre del Producto</label>
        <input name="name" defaultValue={product.name} className="w-full p-2 border rounded font-bold text-lg" />
      </div>
      <div className="w-48">
        <label className="text-xs font-bold text-gray-500 uppercase">Categoría</label>
        <select name="category" defaultValue={product.category} className="w-full p-2 border rounded">
          <option value="protein_base">Proteína (Burger)</option>
          <option value="special">Especial (Torre)</option>
          <option value="side">Acompañamiento</option>
          <option value="drink">Bebida</option>
        </select>
      </div>
      <button disabled={isSaving} className="bg-blue-600 text-white px-4 py-2 rounded font-bold">
        {isSaving ? '...' : 'Guardar'}
      </button>
    </form>
  )
}