'use client'
import { useState } from 'react'
import { updateVariantPrice } from '../actions'
import { RecipeModal } from './RecipeModal'
import { VariantDetailsModal } from './VariantDetailsModal' // 👇 Importamos el nuevo modal

export function VariantsTable({ variants }: { variants: any[] }) {
  // Estado para saber qué variante estamos editando
  const [editingRecipe, setEditingRecipe] = useState<any>(null)
  const [editingDetails, setEditingDetails] = useState<any>(null)

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
            {variants.sort((a, b) => a.price - b.price).map(v => (
              <tr key={v.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {v.image_url && (
                      <img src={v.image_url} alt="" className="w-8 h-8 rounded-full object-cover border" />
                    )}
                    <span className="font-bold capitalize text-lg">{v.name}</span>
                  </div>
                </td>
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
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => setEditingDetails(v)}
                    className="text-blue-600 hover:text-blue-800 font-bold text-xs bg-blue-50 px-3 py-1 rounded border border-blue-100 hover:bg-blue-100 transition"
                  >
                    📷 Detalles
                  </button>
                  <button
                    onClick={() => setEditingRecipe(v)}
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

      {/* Modals */}
      {editingRecipe && (
        <RecipeModal
          variant={editingRecipe}
          onClose={() => setEditingRecipe(null)}
        />
      )}

      {editingDetails && (
        <VariantDetailsModal
          variant={editingDetails}
          onClose={() => setEditingDetails(null)}
        />
      )}
    </>
  )
}