'use client'
import { useState } from 'react'
import { updateVariantPrice } from '../actions'
import { RecipeModal } from './RecipeModal' // 👇 Importamos el modal

export function VariantsTable({ variants }: { variants: any[] }) {
  // Estado para saber qué variante estamos editando
  const [editingVariant, setEditingVariant] = useState<any>(null)

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden mb-6">
        <div className="p-4 bg-gray-50 border-b font-bold text-gray-700">Variantes y Precios 🏷️</div>
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3">Variante</th>
              <th className="px-6 py-3">Precio de Venta</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {variants.sort((a,b) => a.price - b.price).map(v => (
              <tr key={v.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-bold capitalize text-lg">{v.name}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span>$</span>
                    <input 
                      type="number" 
                      defaultValue={v.price}
                      onBlur={(e) => updateVariantPrice(v.id, parseFloat(e.target.value))}
                      className="w-24 p-1 border rounded font-bold text-gray-900"
                    />
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  {/* 👇 Botón Activo */}
                  <button 
                    onClick={() => setEditingVariant(v)}
                    className="text-purple-600 hover:text-purple-800 font-bold text-xs bg-purple-50 px-3 py-1 rounded border border-purple-100 hover:bg-purple-100 transition"
                  >
                    ⚡ Editar Receta
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 👇 Renderizamos el Modal si hay una variante seleccionada */}
      {editingVariant && (
        <RecipeModal 
          variant={editingVariant} 
          onClose={() => setEditingVariant(null)} 
        />
      )}
    </>
  )
}