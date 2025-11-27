'use client'
import { useState } from 'react'
import { Supply } from '@trailer/shared'
import { StockBadge } from './StockBadge'
import { SupplyModal } from './SupplyModal'
import { deleteSupply } from './actions' // 👈 Importamos la acción de borrar

type Props = {
    supplies: Supply[]
}

export function SuppliesClient({ supplies }: Props) {
    // Ahora el estado guarda el objeto a editar (o undefined si es nuevo)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<Supply | undefined>(undefined)

    // Abrir modal para CREAR
    const handleCreate = () => {
        setEditingItem(undefined)
        setIsModalOpen(true)
    }

    // Abrir modal para EDITAR
    const handleEdit = (item: Supply) => {
        setEditingItem(item)
        setIsModalOpen(true)
    }

    // Manejar ELIMINACIÓN
    const handleDelete = async (id: string) => {
        const confirmed = window.confirm('¿Estás seguro de borrar este insumo?\nSi está en uso en alguna receta, no se podrá eliminar.')
        if (!confirmed) return

        const res = await deleteSupply(id)
        if (res?.error) {
            alert('❌ Error: ' + res.error)
        }
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Inventario de Insumos 📦</h1>
                    <p className="text-gray-500">Gestiona tus materias primas y costos.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-orange-700 transition flex items-center gap-2"
                >
                    <span>+</span> Nuevo Insumo
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Insumo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
                            {/* 👇 Nueva columna */}
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {supplies.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-bold text-gray-900">{item.name}</div>
                                    <div className="text-xs text-gray-400 font-mono">ID: {item.id.slice(0, 8)}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    ${item.cost_per_unit.toFixed(2)} <span className="text-gray-400 text-xs">/ {item.unit}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <StockBadge supply={item} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {item.provider || '-'}
                                </td>
                                {/* 👇 Botones de Acción */}
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => handleEdit(item)}
                                            className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition"
                                        >
                                            ✏️ Editar
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(item.id)}
                                            className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition"
                                        >
                                            🗑️ Borrar
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {supplies.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                    No hay insumos registrados aún.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <SupplyModal 
                    supply={editingItem} // Pasamos el item a editar (o undefined)
                    onClose={() => setIsModalOpen(false)} 
                />
            )}
        </div>
    )
}