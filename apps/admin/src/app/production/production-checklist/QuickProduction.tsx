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
    yieldQuantity,
    quantityPerPackage,
    purchaseUnit
}: {
    id: string,
    name: string,
    missingAmount: number,
    unit: string,
    yieldQuantity: number,
    quantityPerPackage?: number | null,
    purchaseUnit?: string | null
}) {
    // Determinar si usamos presentación o unidad base
    const hasPresentation = quantityPerPackage && purchaseUnit

    // Calcular cantidad inicial sugerida
    const calculateInitial = () => {
        if (hasPresentation) {
            // Sugerir en presentaciones (ej: botellas)
            return (missingAmount / quantityPerPackage!).toFixed(2)
        } else {
            // Sugerir en unidad base redondeado al lote más cercano
            const batches = Math.ceil(missingAmount / yieldQuantity)
            return (batches * yieldQuantity).toFixed(1)
        }
    }

    const [amount, setAmount] = useState<string>(calculateInitial())
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
        const val = parseFloat(amount)
        if (!val || val <= 0) return

        setLoading(true)

        // Convertir a unidad base si es presentación
        let finalQty = val
        if (hasPresentation) {
            finalQty = val * quantityPerPackage!
        }

        const res = await addStock(id, finalQty)
        setLoading(false)

        if (res?.error) {
            showToast('Error: ' + res.error, 'error')
        } else {
            const displayAmount = hasPresentation
                ? `${val} ${purchaseUnit}`
                : `${finalQty.toFixed(1)} ${unit}`
            showToast(`✅ ${name} producido: +${displayAmount}`, 'success')
        }
    }

    // Label a mostrar
    const label = hasPresentation ? purchaseUnit! : unit

    return (
        <div className="flex flex-row items-center gap-2 w-full">
            {/* Input Group */}
            <div className="flex-1 flex items-center border-2 border-purple-500 rounded-xl overflow-hidden bg-white shadow-sm h-[42px]">
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-3 py-2 text-base font-bold text-purple-900 focus:ring-0 outline-none text-center bg-transparent"
                    placeholder="0"
                    step="any"
                />
                <div className="bg-purple-50 text-xs font-bold text-purple-900 px-3 border-l border-purple-300 flex items-center h-full whitespace-nowrap justify-center min-w-[4rem]">
                    {hasPresentation && <span className="mr-1">📦</span>}
                    {label}
                </div>
            </div>

            {/* Action Button */}
            <Button
                onClick={handleProduction}
                disabled={loading}
                className="h-[42px] px-6 rounded-xl shadow-md flex-shrink-0 bg-purple-600 hover:bg-purple-700 text-white"
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
