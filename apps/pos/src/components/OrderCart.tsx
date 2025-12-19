'use client'

import type { CartItem } from '@/app/new-order/NewOrderContent'
import { formatCurrency } from '@/lib/currency'
import { Trash2, Plus, Minus, ShoppingCart, StickyNote } from 'lucide-react'

interface OrderCartProps {
    items: CartItem[]
    total: number
    onUpdateQuantity: (index: number, quantity: number) => void
    onRemoveItem: (index: number) => void
    onClearCart: () => void
    onFinalize: () => void
}

export function OrderCart({
    items,
    total,
    onUpdateQuantity,
    onRemoveItem,
    onClearCart,
    onFinalize
}: OrderCartProps) {
    if (items.length === 0) {
        return (
            <div className="h-full flex flex-col p-6">
                <h2 className="text-2xl font-bold text-espresso mb-4">Orden Actual</h2>
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
                    <p className="text-gray-500">Agrega productos para comenzar</p>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-espresso">Orden Actual</h2>
                    <p className="text-sm text-gray-600">{items.length} {items.length === 1 ? 'artículo' : 'artículos'}</p>
                </div>
                <button
                    onClick={onClearCart}
                    className="text-sm text-red-600 hover:text-red-700 font-semibold"
                >
                    Limpiar
                </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {items.map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        {/* Product Name */}
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                                <h3 className="font-semibold text-espresso">{item.product.name}</h3>
                                <p className="text-sm text-gray-600">{item.variant.name}</p>

                                {/* Modifiers */}
                                {item.modifiers.length > 0 && (
                                    <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                                        {item.modifiers.map((m, i) => (
                                            <div key={i} className="flex justify-between w-full pr-2">
                                                <span>+ {m.modifier.name}</span>
                                                <span>{formatCurrency(m.modifier.price * m.quantity)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Notes */}
                                {item.notes && item.notes.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {item.notes.map((note, i) => (
                                            <span key={i} className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded text-[10px] font-semibold flex items-center gap-1">
                                                <StickyNote className="w-3 h-3" />
                                                {note}
                                            </span>
                                        ))}
                                    </div>
                                )}

                            </div>
                            <button
                                onClick={() => onRemoveItem(index)}
                                className="text-red-500 hover:text-red-700 p-1"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Quantity Controls & Price */}
                        <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                                    className="w-8 h-8 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-8 text-center font-semibold">{item.quantity}</span>
                                <button
                                    onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                                    className="w-8 h-8 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <span className="font-bold text-espresso">
                                {formatCurrency((item.variant.price + item.modifiers.reduce((sum, m) => sum + (m.modifier.price * m.quantity), 0)) * item.quantity)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 space-y-4 bg-gray-50">
                <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-700">Total</span>
                    <span className="text-2xl font-bold text-espresso">{formatCurrency(total)}</span>
                </div>
                <button
                    onClick={onFinalize}
                    className="btn-touch btn-primary w-full py-4 text-lg font-bold"
                >
                    Finalizar Orden
                </button>
            </div>
        </div>
    )
}
