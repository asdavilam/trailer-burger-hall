'use client'
import { useState } from 'react'
import { updateVariantDetails } from '../actions'

export function VariantDetailsModal({ variant, onClose }: { variant: any, onClose: () => void }) {
    const [isSaving, setIsSaving] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(variant.image_url)

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-lg">Detalles: {variant.name}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                <form
                    action={async (fd) => {
                        setIsSaving(true)
                        await updateVariantDetails(variant.id, fd)
                        setIsSaving(false)
                        onClose()
                    }}
                    className="p-6 space-y-4"
                >
                    {/* Image Upload */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Imagen de la Variante</label>
                        <div className="flex justify-center">
                            <div className="relative w-full h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50 hover:bg-gray-100 transition-colors group">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                        <span className="text-2xl mb-2">📷</span>
                                        <span className="text-sm">Click para subir imagen</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    name="image"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción Específica</label>
                        <textarea
                            name="description"
                            defaultValue={variant.description || ''}
                            className="w-full p-3 border rounded-lg text-sm min-h-[100px] focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Ej: Doble carne con extra queso..."
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg"
                        >
                            Cancelar
                        </button>
                        <button
                            disabled={isSaving}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {isSaving ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
