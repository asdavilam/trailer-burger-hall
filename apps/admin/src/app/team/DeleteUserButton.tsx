'use client'

import { useState } from 'react'
import { deleteUser } from './actions'

type Props = {
    userId: string
    userName: string
}

export function DeleteUserButton({ userId, userName }: Props) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!confirm(`¿Estás seguro de que quieres eliminar a ${userName}? Esta acción no se puede deshacer.`)) {
            return
        }

        setIsDeleting(true)
        const res = await deleteUser(userId)

        if (res.error) {
            alert(res.error)
            setIsDeleting(false)
        }
        // Si es exitoso, revalidatePath en el server recargará la página
    }

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-colors"
            title="Eliminar usuario"
        >
            {isDeleting ? '...' : '🗑️'}
        </button>
    )
}
