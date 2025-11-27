'use client'

import { useState } from 'react'
import { addStock } from '../actions'

export function QuickPurchase({
    id,
    missingAmount,
    unit
}: {
    id: string,
    missingAmount: number,
    unit: string
}) {
    const [amount, setAmount] = useState<string>(missingAmount.toString())
    const [selectedUnit, setSelectedUnit] = useState<string>(unit)
    const [loading, setLoading] = useState(false)

    // Lógica de conversión (Duplicada por simplicidad, idealmente shared)
    const getUnitOptions = (baseUnit: string) => {
        switch (baseUnit) {
            case 'kg': return [{ value: 'kg', label: 'kg' }, { value: 'g', label: 'g' }]
            case 'lt': return [{ value: 'lt', label: 'lt' }, { value: 'ml', label: 'ml' }]
            case 'g': return [{ value: 'g', label: 'g' }, { value: 'kg', label: 'kg' }]
            case 'ml': return [{ value: 'ml', label: 'ml' }, { value: 'lt', label: 'lt' }]
            default: return [{ value: baseUnit, label: baseUnit }]
        }
    }

    const convertToStorageUnit = (quantity: number, fromUnit: string, toBaseUnit: string) => {
        if (fromUnit === toBaseUnit) return quantity
        if (fromUnit === 'g' && toBaseUnit === 'kg') return quantity / 1000
        if (fromUnit === 'ml' && toBaseUnit === 'lt') return quantity / 1000
        if (fromUnit === 'kg' && toBaseUnit === 'g') return quantity * 1000
        if (fromUnit === 'lt' && toBaseUnit === 'ml') return quantity * 1000
        return quantity
    }

    const handlePurchase = async () => {
        const val = parseFloat(amount)
        if (!val || val <= 0) return

        setLoading(true)
        const finalQty = convertToStorageUnit(val, selectedUnit, unit)
        const res = await addStock(id, finalQty)
        setLoading(false)

        if (res?.error) {
            alert('Error al actualizar: ' + res.error)
        }
    }

    const unitOptions = getUnitOptions(unit)

    return (
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <div className="flex items-center border rounded-lg overflow-hidden bg-white">
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-20 pl-3 py-2 text-sm font-bold text-gray-900 focus:ring-0 outline-none border-r"
                    placeholder="Cant."
                />
                <select
                    value={selectedUnit}
                    onChange={(e) => setSelectedUnit(e.target.value)}
                    className="bg-gray-50 text-xs font-medium text-gray-600 py-2 pl-2 pr-1 outline-none border-none cursor-pointer hover:bg-gray-100"
                >
                    {unitOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>
            <button
                onClick={handlePurchase}
                disabled={loading}
                className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-green-700 disabled:opacity-50 transition shadow-sm flex items-center gap-1 whitespace-nowrap"
            >
                {loading ? '...' : '✅'}
            </button>
        </div>
    )
}