'use client'

import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'

export function NewOrderButton() {
    const router = useRouter()

    return (
        <button
            onClick={() => router.push('/new-order')}
            className="btn-touch btn-primary flex items-center justify-center gap-3 px-8 py-6 text-xl font-bold shadow-lg hover:shadow-xl w-full sm:w-auto"
        >
            <Plus className="w-8 h-8" strokeWidth={3} />
            Nueva Orden
        </button>
    )
}
