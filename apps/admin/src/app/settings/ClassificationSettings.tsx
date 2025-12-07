'use client'

import { useState, useMemo } from 'react'
import { Supply } from '@trailer/shared'
import { updateBulkClassification } from '../supplies/actions'

type Props = {
    supplies: Supply[]
}

export function ClassificationSettings({ supplies }: Props) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [filter, setFilter] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    // Filtrar insumos
    const filteredSupplies = useMemo(() => {
        return supplies.filter(s =>
            s.name.toLowerCase().includes(filter.toLowerCase()) ||
            s.category?.toLowerCase().includes(filter.toLowerCase())
        )
    }, [supplies, filter])

    // Manejar selección
    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds)
        if (newSet.has(id)) newSet.delete(id)
        else newSet.add(id)
        setSelectedIds(newSet)
    }

    const toggleAll = () => {
        if (selectedIds.size === filteredSupplies.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(filteredSupplies.map(s => s.id)))
        }
    }

    // Aplicar cambios
    const handleApplyClassification = async (classification: 'A' | 'B' | 'C') => {
        if (selectedIds.size === 0) return
        if (!confirm(`¿Asignar clasificación "${classification}" a ${selectedIds.size} insumos?`)) return

        setIsSaving(true)
        const res = await updateBulkClassification(Array.from(selectedIds), classification)
        setIsSaving(false)

        if (res?.error) {
            alert(`Error: ${res.error}`)
        } else {
            alert('✅ Actualizado correctamente')
            setSelectedIds(new Set())
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
            <div className="p-4 border-b border-gray-100 bg-orange-50 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h3 className="font-bold text-orange-900">Clasificación ABC (Frecuencia de Conteo)</h3>
                    <p className="text-xs text-orange-700">Asigna la frecuencia de conteo para optimizar el tiempo del personal.</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => handleApplyClassification('A')}
                        disabled={selectedIds.size === 0 || isSaving}
                        className="px-3 py-1 bg-white border border-gray-300 rounded text-xs font-bold hover:bg-gray-50 disabled:opacity-50 text-gray-700"
                    >
                        🅰️ Diario
                    </button>
                    <button
                        onClick={() => handleApplyClassification('B')}
                        disabled={selectedIds.size === 0 || isSaving}
                        className="px-3 py-1 bg-white border border-gray-300 rounded text-xs font-bold hover:bg-gray-50 disabled:opacity-50 text-gray-700"
                    >
                        🅱️ Bi-semanal
                    </button>
                    <button
                        onClick={() => handleApplyClassification('C')}
                        disabled={selectedIds.size === 0 || isSaving}
                        className="px-3 py-1 bg-white border border-gray-300 rounded text-xs font-bold hover:bg-gray-50 disabled:opacity-50 text-gray-700"
                    >
                        ©️ Semanal
                    </button>
                </div>
            </div>

            <div className="p-4 border-b border-gray-100">
                <input
                    type="text"
                    placeholder="Buscar insumo..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                />
            </div>

            <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0">
                        <tr>
                            <th className="p-3 w-10">
                                <input
                                    type="checkbox"
                                    checked={filteredSupplies.length > 0 && selectedIds.size === filteredSupplies.length}
                                    onChange={toggleAll}
                                />
                            </th>
                            <th className="p-3">Nombre</th>
                            <th className="p-3">Categoría</th>
                            <th className="p-3">Clasificación Actual</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredSupplies.map(supply => (
                            <tr key={supply.id} className={`hover:bg-gray-50 ${selectedIds.has(supply.id) ? 'bg-orange-50' : ''}`}>
                                <td className="p-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.has(supply.id)}
                                        onChange={() => toggleSelection(supply.id)}
                                    />
                                </td>
                                <td className="p-3 font-medium text-gray-900">{supply.name}</td>
                                <td className="p-3 text-gray-500">{supply.category || '-'}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 rounded text-xs font-bold 
                    ${(supply.abc_classification === 'B') ? 'bg-blue-100 text-blue-800' :
                                            (supply.abc_classification === 'C') ? 'bg-green-100 text-green-800' :
                                                'bg-red-100 text-red-800'}`}>
                                        {supply.abc_classification || 'A'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {filteredSupplies.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-500">
                                    No se encontraron insumos.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="p-2 bg-gray-50 text-xs text-gray-500 text-right">
                {selectedIds.size} seleccionados
            </div>
        </div>
    )
}
