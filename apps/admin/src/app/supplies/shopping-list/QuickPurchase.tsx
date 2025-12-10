'use client'

import { useState } from 'react'
import { addStock } from '../actions'
import { Button } from '@/components/ui/Button'
import { Toast, ToastType } from '@/components/ui/Toast'

export function QuickPurchase({
    id,
    missingAmount,
    unit,
    packageSize,
    packageUnitDescription
}: {
    id: string,
    missingAmount: number,
    unit: string,
    packageSize?: number | null,
    packageUnitDescription?: string | null
}) {
    // Determine if we are in "Package Mode"
    const isPackageMode = (packageSize && packageSize > 1) || (packageSize === 1 && !!packageUnitDescription)

    // Initial calculation
    const calculateInitial = () => {
        if (!isPackageMode) return missingAmount
        const packagesNeeded = missingAmount / packageSize!
        return Math.ceil(packagesNeeded)
    }

    const [amount, setAmount] = useState<string>(calculateInitial().toString())
    const [loading, setLoading] = useState(false)
    const [toast, setToast] = useState<{ message: string, type: ToastType, isVisible: boolean }>({
        message: '',
        type: 'info',
        isVisible: false
    })

    const showToast = (message: string, type: ToastType = 'info') => {
        setToast({ message, type, isVisible: true })
    }

    // Label to show: "Bote", "Caja", or "lt", "kg"
    const label = isPackageMode ? (packageUnitDescription || 'Paquete(s)') : unit

    const handlePurchase = async () => {
        const val = parseFloat(amount)
        if (!val || val <= 0) return

        setLoading(true)

        let finalQty = val
        if (isPackageMode) {
            finalQty = val * packageSize!
        }

        const res = await addStock(id, finalQty)
        setLoading(false)

        if (res?.error) {
            showToast('Error: ' + res.error, 'error')
        } else {
            showToast('✅ Stock actualizado', 'success')
            // Opcional: Podríamos limpiar o reajustar, pero mantener el valor suele ser útil si se compra de nuevo
        }
    }

    return (
        <div className="flex flex-row items-center gap-2 w-full">
            {/* Input Group */}
            <div className="flex-1 flex items-center border-2 border-[#c08a3e] rounded-xl overflow-hidden bg-white shadow-sm h-[42px]">
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-3 py-2 text-base font-bold text-[#3b1f1a] focus:ring-0 outline-none text-center bg-transparent"
                    placeholder="0"
                    step="any"
                />
                <div className="bg-[#f6f1e7] text-xs font-bold text-[#3b1f1a] px-3 border-l border-[#c08a3e]/20 flex items-center h-full whitespace-nowrap justify-center min-w-[3rem]">
                    {isPackageMode && <span className="mr-1">📦</span>}
                    {label}
                </div>
            </div>

            {/* Action Button */}
            <Button
                onClick={handlePurchase}
                disabled={loading}
                variant="primary" // Bronze button
                className="h-[42px] px-6 rounded-xl shadow-md flex-shrink-0"
            >
                {loading ? '...' : '✅'}
            </Button>


            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
            />
        </div>
    )
}