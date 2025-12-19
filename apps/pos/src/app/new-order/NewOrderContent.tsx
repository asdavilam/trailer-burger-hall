'use client'

import React, { useState, useMemo } from 'react'
import type { V2Product, V2ProductVariant, V2Modifier } from '@trailer/shared'
import { ProductCatalog } from '@/components/ProductCatalog'
import { OrderCart } from '@/components/OrderCart'
import { FinalizeOrderDialog } from '@/components/FinalizeOrderDialog'

export interface CartItem {
    product: V2Product
    variant: V2ProductVariant
    quantity: number
    modifiers: Array<{ modifier: V2Modifier; quantity: number }>
    notes: string[]
}

interface NewOrderContentProps {
    products: V2Product[]
    modifiers: V2Modifier[]
}

export function NewOrderContent({ products, modifiers }: NewOrderContentProps) {
    const [cart, setCart] = useState<CartItem[]>([])
    const [showFinalizeDialog, setShowFinalizeDialog] = useState(false)

    const addToCart = (
        product: V2Product,
        variant: V2ProductVariant,
        selectedModifiers: Array<{ modifier: V2Modifier; quantity: number }>,
        notes: string[] = []
    ) => {
        setCart(prev => {
            // Check if identical item already exists
            const existingIndex = prev.findIndex(item => {
                if (item.product.id !== product.id || item.variant.id !== variant.id) return false

                if (item.modifiers.length !== selectedModifiers.length) return false

                // Notes must match too
                if (item.notes.length !== notes.length) return false
                const itemNotes = [...item.notes].sort().join(',')
                const newNotes = [...notes].sort().join(',')
                if (itemNotes !== newNotes) return false

                const itemModIds = item.modifiers.map(m => m.modifier.id).sort()
                const newModIds = selectedModifiers.map(m => m.modifier.id).sort()

                return itemModIds.every((id, i) => id === newModIds[i])
            })

            if (existingIndex >= 0) {
                const newCart = [...prev]
                newCart[existingIndex] = {
                    ...newCart[existingIndex],
                    quantity: newCart[existingIndex].quantity + 1
                }
                return newCart
            }

            // Add new item
            return [...prev, {
                product,
                variant,
                quantity: 1,
                modifiers: selectedModifiers,
                notes
            }]
        })
    }

    const updateQuantity = (index: number, quantity: number) => {
        if (quantity <= 0) {
            removeItem(index)
            return
        }

        setCart(prev => {
            const newCart = [...prev]
            newCart[index] = { ...newCart[index], quantity }
            return newCart
        })
    }

    const removeItem = (index: number) => {
        setCart(prev => prev.filter((_, i) => i !== index))
    }

    const clearCart = () => {
        setCart([])
    }

    const cartTotal = useMemo(() => {
        return cart.reduce((sum, item) => {
            const itemPrice = item.variant.price
            const modifiersPrice = item.modifiers.reduce((mSum, mod) => {
                return mSum + (mod.modifier.price * mod.quantity)
            }, 0)

            return sum + ((itemPrice + modifiersPrice) * item.quantity)
        }, 0)
    }, [cart])

    return (
        <>
            <main className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-80px)] overflow-hidden">
                {/* Product Catalog */}
                <div className="flex-1 p-4 lg:p-6 overflow-y-auto bg-marfil">
                    <ProductCatalog
                        products={products}
                        modifiers={modifiers}
                        onAddToCart={addToCart}
                    />
                </div>

                {/* Cart Sidebar */}
                <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-gray-200 bg-white shadow-xl z-20">
                    <OrderCart
                        items={cart}
                        total={cartTotal}
                        onUpdateQuantity={updateQuantity}
                        onRemoveItem={removeItem}
                        onClearCart={clearCart}
                        onFinalize={() => setShowFinalizeDialog(true)}
                    />
                </div>
            </main>

            {/* Finalize Dialog */}
            {showFinalizeDialog && (
                <FinalizeOrderDialog
                    items={cart}
                    total={cartTotal}
                    onClose={() => setShowFinalizeDialog(false)}
                    onSuccess={() => {
                        clearCart()
                        setShowFinalizeDialog(false)
                    }}
                />
            )}
        </>
    )
}
