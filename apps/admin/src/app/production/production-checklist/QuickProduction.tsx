'use client'

import { useState } from 'react'
import { addStock } from '../../supplies/actions'
import { Button } from '@/components/ui/Button'
import { Toast, ToastType } from '@/components/ui/Toast'

export function QuickProduction({
    id,
    name,
    missingAmount,
    unit,
    yieldQuantity
}: {
    id: string,
    name: string,
    missingAmount: number,
    unit: string,
    yieldQuantity: number
}) {
    // Suggest producing in batches of the yield quantity
    const calculateInitial = () => {
        const batchesNeeded = missingAmount / yieldQuantity
        return Math.ceil(batchesNeeded)
    }

    const [batches, setBatches] = useState<string>(calculateInitial().toString())
    const [loading, setLoading] = useState(false)
    const [toast, setToast] = useState<{ message: string, type: ToastType, isVisible: boolean }>({
        message: '',
        type: 'info',
        isVisible: false
    })

    const showToast = (message: string, type: ToastType = 'info') => {
        setToast({ message, type, isVisible: true })
    }

    const handleProduction = async () => {
        const val = parseFloat(batches)
        if (!val || val <= 0) return

        setLoading(true)

        // Final quantity is batches * yield per batch
        const finalQty = val * yieldQuantity

        const res = await addStock(id, finalQty)
        setLoading(false)

        if (res?.error) {
            showToast('Error: ' + res.error, 'error')
        } else {
            showToast(`✅ ${name} producido: +${finalQty.toFixed(1)} ${unit}`, 'success')
        }
    }

    const totalUnits = (parseFloat(batches) || 0) * yieldQuantity

    return (
        <div className="flex flex-col gap-2 w-full">
            {/* Info helper */}
            <div className="text-xs text-purple-700 bg-purple-50 p-2 rounded border border-purple-200">
                <strong>Cada lote rinde:</strong> {yieldQuantity} {unit}
            </div>

            <div className="flex flex-row items-center gap-2 w-full">
                {/* Input Group */}
                <div className="flex-1 flex items-center border-2 border-purple-500 rounded-xl overflow-hidden bg-white shadow-sm h-[42px]">
                    <input
                        type="number"
                        value={batches}
                        onChange={(e) => setBatches(e.target.value)}
                        className="w-full pl-3 py-2 text-base font-bold text-purple-900 focus:ring-0 outline-none text-center bg-transparent"
                        placeholder="0"
                        step="1"
                    />
                    <div className="bg-purple-50 text-xs font-bold text-purple-900 px-3 border-l border-purple-300 flex items-center h-full whitespace-nowrap justify-center min-w-[5rem]">
                        <span className="mr-1">🍳</span>
                        Lotes
                    </div>
                </div>

                {/* Action Button */}
                <Button
                    onClick={handleProduction}
                    disabled={loading}
                    className="h-[42px] px-6 rounded-xl shadow-md flex-shrink-0 bg-purple-600 hover:bg-purple-700 text-white"
                >
                    {loading ? '...' : '✅ Producir'}
                </Button>
            </div>

            {/* Total preview */}
            {parseFloat(batches) > 0 && (
                <div className="text-xs text-center text-purple-700 font-bold">
                    = {totalUnits.toFixed(1)} {unit} total
                </div>
            )}

            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
            />
        </div>
    )
}
