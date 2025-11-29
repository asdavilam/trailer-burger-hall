'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { deleteProduct } from './actions'

export function DeleteProductButton({ productId, productName }: { productId: string; productName: string }) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!confirm(`¿Estás seguro de eliminar "${productName}"? Esta acción no se puede deshacer.`)) {
            return
        }

        setIsDeleting(true)
        const result = await deleteProduct(productId)

        if (result.error) {
            alert(`Error: ${result.error}`)
            setIsDeleting(false)
        } else {
            // La página se recargará automáticamente por revalidatePath
            window.location.reload()
        }
    }

    return (
        <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs bg-white border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            onClick={handleDelete}
            disabled={isDeleting}
        >
            {isDeleting ? '...' : '🗑️'}
        </Button>
    )
}
