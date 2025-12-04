'use client'

import { useState, useRef } from 'react'
import { Supply } from '@trailer/shared'
import { StockBadge } from './StockBadge'
import { adjustStock } from './actions'

type Props = {
    supply: Supply
}

export function EditableStock({ supply }: Props) {
    const [isEditing, setIsEditing] = useState(false)
    const [newStock, setNewStock] = useState(supply.current_stock.toString())
    const [isSaving, setIsSaving] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const isSubmittingRef = useRef(false)

    const handleSave = async () => {
        if (isSubmittingRef.current) return

        const numericStock = parseFloat(newStock) || 0

        if (numericStock === supply.current_stock) {
            setIsEditing(false)
            return
        }

        isSubmittingRef.current = true

        // Pequeño timeout para permitir que el UI se actualice si fue disparado por evento
        await new Promise(resolve => setTimeout(resolve, 0))

        const reason = prompt('Razón del ajuste (opcional):')

        // Si el usuario cancela el prompt (null), cancelamos la edición
        if (reason === null) {
            setNewStock(supply.current_stock.toString())
            setIsEditing(false)
            isSubmittingRef.current = false
            return
        }

        const finalReason = reason || 'Ajuste manual'

        setIsSaving(true)
        const result = await adjustStock(supply.id, numericStock, finalReason)
        setIsSaving(false)

        if (result?.error) {
            alert(`Error: ${result.error}`)
            setNewStock(supply.current_stock.toString()) // Revertir
        } else {
            // Mostrar feedback de éxito
            setShowSuccess(true)
            setTimeout(() => setShowSuccess(false), 2000)
        }

        setIsEditing(false)
        isSubmittingRef.current = false
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave()
        } else if (e.key === 'Escape') {
            setNewStock(supply.current_stock.toString())
            setIsEditing(false)
        }
    }

    if (isEditing) {
        return (
            <div className="flex items-center gap-2">
                <input
                    type="number"
                    step="0.01"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    disabled={isSaving}
                    className="w-20 p-1 border-2 border-blue-500 rounded text-sm"
                />
                <span className="text-xs text-gray-500">{supply.unit}</span>
            </div>
        )
    }

    return (
        <div
            onClick={() => {
                setIsEditing(true)
                setNewStock(supply.current_stock.toString())
            }}
            className={`cursor-pointer transition-all ${showSuccess ? 'ring-2 ring-green-500 rounded' : ''}`}
            title="Click para editar stock"
        >
            <StockBadge supply={{ ...supply, current_stock: parseFloat(newStock) || 0 }} />
        </div>
    )
}
