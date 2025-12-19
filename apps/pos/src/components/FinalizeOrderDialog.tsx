'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CartItem } from '@/app/new-order/NewOrderContent'
import type { ServiceType } from '@trailer/shared'
import { createAccountWithItems } from '@/app/new-order/actions'
import { formatCurrency } from '@/lib/currency'

interface FinalizeOrderDialogProps {
    items: CartItem[]
    total: number
    onClose: () => void
    onSuccess: () => void
}

export function FinalizeOrderDialog({ items, total, onClose, onSuccess }: FinalizeOrderDialogProps) {
    const router = useRouter()
    const [customerName, setCustomerName] = useState('')
    const [serviceType, setServiceType] = useState<ServiceType>('dine_in')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!customerName.trim()) {
            setError('El nombre del cliente es requerido')
            return
        }

        setLoading(true)
        setError('')

        // Prepare items for server
        const orderItems = items.map(item => ({
            product_id: item.product.id,
            variant_id: item.variant.id,
            quantity: item.quantity,
            unit_price: item.variant.price,
            modifiers: item.modifiers.map(m => ({
                modifier_id: m.modifier.id,
                quantity: m.quantity
            })),
            notes: item.notes.join(',') // Join notes as comma separated string
        }))

        const result = await createAccountWithItems(customerName.trim(), serviceType, orderItems)

        if (result.error) {
            setError(result.error)
            setLoading(false)
        } else {
            // Success - redirect to home
            onSuccess()
            router.push('/')
            router.refresh()
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
                <h2 className="text-2xl font-bold text-espresso mb-6">Finalizar Orden</h2>

                {/* Order Summary */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Artículos:</span>
                        <span className="font-semibold">{items.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total:</span>
                        <span className="text-2xl font-bold text-bronze">{formatCurrency(total)}</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Customer Name */}
                    <div>
                        <label htmlFor="customerName" className="block text-sm font-bold text-gray-700 mb-2">
                            Nombre del Cliente
                        </label>
                        <input
                            id="customerName"
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bronze focus:border-bronze text-lg"
                            placeholder="Juan Pérez"
                            autoFocus
                            disabled={loading}
                        />
                    </div>

                    {/* Service Type */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                            Tipo de Servicio
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setServiceType('dine_in')}
                                disabled={loading}
                                className={`btn-touch p-4 rounded-lg border-2 text-lg font-semibold transition-all ${serviceType === 'dine_in'
                                        ? 'bg-bronze text-white border-bronze'
                                        : 'bg-white text-espresso border-gray-300 hover:border-bronze'
                                    }`}
                            >
                                🍽️ Aquí
                            </button>
                            <button
                                type="button"
                                onClick={() => setServiceType('takeout')}
                                disabled={loading}
                                className={`btn-touch p-4 rounded-lg border-2 text-lg font-semibold transition-all ${serviceType === 'takeout'
                                        ? 'bg-bronze text-white border-bronze'
                                        : 'bg-white text-espresso border-gray-300 hover:border-bronze'
                                    }`}
                            >
                                📦 Para Llevar
                            </button>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 btn-touch btn-outline text-lg py-4"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !customerName.trim()}
                            className="flex-1 btn-touch btn-primary text-lg py-4 disabled:opacity-50"
                        >
                            {loading ? 'Creando...' : 'Crear Cuenta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
