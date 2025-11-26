'use client'
import { useState } from 'react'
import { Supply } from '@trailer/shared'
import { StockBadge } from './StockBadge'
import { SupplyModal } from './SupplyModal'

type Props = {
    supplies: Supply[]
}

export function SuppliesClient({ supplies }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Inventario de Insumos 📦</h1>
                    <p className="text-gray-500">Gestiona tus materias primas y costos.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-orange-700 transition"
                >
                    + Nuevo Insumo
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Insumo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo Unitario</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Actual</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {supplies.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                    <div className="text-xs text-gray-400">ID: {item.id.slice(0, 8)}...</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    ${item.cost_per_unit.toFixed(2)} <span className="text-gray-400">/ {item.unit}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <StockBadge supply={item} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {item.provider || '-'}
                                </td>
                            </tr>
                        ))}

                        {supplies.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                                    No hay insumos registrados aún.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <SupplyModal onClose={() => setIsModalOpen(false)} />
            )}
        </div>
    )
}
