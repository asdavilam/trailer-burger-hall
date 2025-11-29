'use client'
import { updateProductBasic } from '../actions'
import { useState } from 'react'

export function BasicInfoForm({ product }: { product: any }) {
  const [isSaving, setIsSaving] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(product.image_url)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  return (
    <form
      action={async (fd) => {
        setIsSaving(true)
        await updateProductBasic(product.id, fd)
        setIsSaving(false)
      }}
      className="bg-white p-6 rounded-xl shadow-sm border mb-6 space-y-4"
    >
      <div className="flex gap-4 items-start">
        {/* Image Upload */}
        <div className="w-32 flex-shrink-0">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Imagen</label>
          <div className="relative w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50 hover:bg-gray-100 transition-colors">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-xs text-center p-2">
                Subir Imagen
              </div>
            )}
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre del Producto</label>
              <input name="name" defaultValue={product.name} className="w-full p-2 border rounded font-bold text-lg" />
            </div>
            <div className="w-48">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Categoría</label>
              <select name="category" defaultValue={product.category} className="w-full p-2 border rounded">
                <option value="protein_base">Proteína (Burger)</option>
                <option value="special">Especial (Torre)</option>
                <option value="side">Acompañamiento</option>
                <option value="drink">Bebida</option>
                <option value="extra">Extra</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción</label>
            <textarea
              name="description"
              defaultValue={product.description || ''}
              className="w-full p-2 border rounded text-sm min-h-[80px]"
              placeholder="Descripción del producto..."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button disabled={isSaving} className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700 transition-colors">
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  )
}