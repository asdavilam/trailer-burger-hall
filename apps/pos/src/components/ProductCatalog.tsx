'use client'

import { useState, useMemo } from 'react'
import type { V2Product, V2ProductVariant, V2Modifier } from '@trailer/shared'
import { groupByCategory, getCategoryName } from '@/lib/products'
import { formatCurrency } from '@/lib/currency'
import { ProductConfigDialog } from '@/components/ProductConfigDialog'

interface ProductCatalogProps {
    products: V2Product[]
    modifiers: V2Modifier[]
    onAddToCart: (
        product: V2Product,
        variant: V2ProductVariant,
        modifiers: Array<{ modifier: V2Modifier; quantity: number }>,
        notes: string[]
    ) => void
}

export function ProductCatalog({ products, modifiers, onAddToCart }: ProductCatalogProps) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [configuringProduct, setConfiguringProduct] = useState<V2Product | null>(null)

    const categorizedProducts = useMemo(() => groupByCategory(products), [products])
    const categories = useMemo(() => Array.from(categorizedProducts.keys()), [categorizedProducts])

    const filteredProducts = selectedCategory
        ? categorizedProducts.get(selectedCategory) || []
        : products

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-espresso mb-2">Catálogo</h1>
                <p className="text-gray-600">Selecciona productos para agregar a la orden</p>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${selectedCategory === null
                            ? 'bg-bronze text-white'
                            : 'bg-white text-espresso border-2 border-gray-200 hover:border-bronze'
                        }`}
                >
                    Todos
                </button>
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${selectedCategory === category
                                ? 'bg-bronze text-white'
                                : 'bg-white text-espresso border-2 border-gray-200 hover:border-bronze'
                            }`}
                    >
                        {getCategoryName(category)}
                    </button>
                ))}
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map(product => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onSelect={() => setConfiguringProduct(product)}
                    />
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-16">
                    <p className="text-gray-500 text-lg">No hay productos en esta categoría</p>
                </div>
            )}

            {/* Configuration Dialog */}
            {configuringProduct && (
                <ProductConfigDialog
                    product={configuringProduct}
                    modifiers={modifiers}
                    onClose={() => setConfiguringProduct(null)}
                    onConfirm={(variant, selectedModifiers, notes) => {
                        onAddToCart(configuringProduct, variant, selectedModifiers, notes)
                        setConfiguringProduct(null)
                    }}
                />
            )}
        </div>
    )
}

interface ProductCardProps {
    product: V2Product
    onSelect: () => void
}

function ProductCard({ product, onSelect }: ProductCardProps) {
    // Get default variant price for display
    const minPrice = product.variants && product.variants.length > 0
        ? Math.min(...product.variants.map(v => v.price))
        : 0

    return (
        <button
            onClick={onSelect}
            className="card hover:shadow-lg transition-all text-left group border-2 border-transparent hover:border-bronze flex flex-col h-full"
            disabled={!product.is_active}
        >
            {/* Product Image */}
            {product.image_url && (
                <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 overflow-hidden shrink-0">
                    <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                </div>
            )}

            {/* Product Info */}
            <h3 className="font-bold text-lg text-espresso group-hover:text-bronze transition-colors line-clamp-2 mb-1">
                {product.name}
            </h3>

            {product.description && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-2 flex-1">
                    {product.description}
                </p>
            )}

            {/* Price */}
            <div className="flex items-center justify-between mt-auto pt-2 w-full">
                <span className="text-xl font-bold text-bronze">
                    Desde {formatCurrency(minPrice)}
                </span>
                {!product.is_active && (
                    <span className="text-xs text-red-600 font-semibold">No disponible</span>
                )}
            </div>
        </button>
    )
}
