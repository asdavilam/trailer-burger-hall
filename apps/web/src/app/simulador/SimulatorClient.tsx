// apps/web/src/app/simulador/SimulatorClient.tsx V2
'use client'

import { useState, useMemo, useEffect } from 'react'
import { V2Product, V2Modifier, V2ProductVariant } from '@trailer/shared'

type OrderItem = {
  product: V2Product
  variant: V2ProductVariant
  selectedModifiers: { modifier: V2Modifier; quantity: number }[]
  quantity: number
}

export default function SimulatorClient({
  products,
  modifiers
}: {
  products: V2Product[]
  modifiers: V2Modifier[]
}) {
  // Estado del formulario
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id ?? '')
  const [selectedVariantId, setSelectedVariantId] = useState<string>('')
  const [selectedModifierIds, setSelectedModifierIds] = useState<string[]>([])
  const [cart, setCart] = useState<OrderItem[]>([])

  // Datos derivados
  const selectedProduct = useMemo(
    () => products.find(p => p.id === selectedProductId),
    [products, selectedProductId]
  )

  const selectedVariant = useMemo(
    () => selectedProduct?.variants?.find(v => v.id === selectedVariantId),
    [selectedProduct, selectedVariantId]
  )

  // Modifiers grouped by type
  const flavorModifiers = useMemo(() => modifiers.filter(m => m.type === 'flavor'), [modifiers])
  const extraModifiers = useMemo(() => modifiers.filter(m => m.type === 'extra'), [modifiers])

  // For burger products: ALL flavors are available, extras need to be configured
  // For other products: use configured allowed_modifiers
  const availableFlavors = useMemo(() => {
    if (!selectedProduct) return []

    // For burgers (protein_base or special), show ALL flavors
    if (selectedProduct.category === 'protein_base' || selectedProduct.category === 'special') {
      return flavorModifiers
    }

    // For other products, only show configured flavors
    const allowedIds = selectedProduct.allowed_modifiers?.map(link => link.modifier_id) ?? []
    return flavorModifiers.filter(m => allowedIds.includes(m.id))
  }, [selectedProduct, flavorModifiers])

  const availableExtras = useMemo(() => {
    if (!selectedProduct) return []
    const allowedIds = selectedProduct.allowed_modifiers?.map(link => link.modifier_id) ?? []
    return extraModifiers.filter(m => allowedIds.includes(m.id))
  }, [selectedProduct, extraModifiers])

  // Get default/included modifiers based on product name and variant
  const defaultModifierIds = useMemo(() => {
    if (!selectedProduct || !selectedVariant) return []

    const productName = selectedProduct.name.toLowerCase()
    const variantName = selectedVariant.name.toLowerCase()

    // Helper to find modifier IDs by name
    const findModifiersByNames = (names: string[]) => {
      return names
        .map(name => modifiers.find(m => m.name.toLowerCase().includes(name.toLowerCase()))?.id)
        .filter(Boolean) as string[]
    }

    let defaultFlavors: string[] = []

    // CASA variant has special rules
    if (variantName === 'casa') {
      const isSea = productName.includes('camarón') || productName.includes('camaron') ||
        productName.includes('salmón') || productName.includes('salmon')
      const isResPollo = productName.includes('res') || productName.includes('pollo')

      if (isSea) {
        // Casa de Mar: Mojo + Diabla + Chimi
        defaultFlavors = findModifiersByNames(['Mojo', 'Diabla', 'Chimi'])
      } else if (isResPollo) {
        // Casa de Res/Pollo: Habanero + Chimi + Mojo
        defaultFlavors = findModifiersByNames(['Habanero', 'Chimi', 'Mojo'])
      } else if (productName.includes('portobello')) {
        // Casa Portobello: Chimi + Mojo
        defaultFlavors = findModifiersByNames(['Chimi', 'Mojo'])
      }
    } else {
      // Normal/Doble/Light variants
      const isSea = productName.includes('camarón') || productName.includes('camaron') ||
        productName.includes('salmón') || productName.includes('salmon')
      const isPortobello = productName.includes('portobello')

      if (isSea) {
        // Camarón/Salmón: Mojo + Diabla
        defaultFlavors = findModifiersByNames(['Mojo', 'Diabla'])
      } else if (isPortobello) {
        // Portobello: Chimi + Mojo
        defaultFlavors = findModifiersByNames(['Chimi', 'Mojo'])
      }
      // Res y Pollo no tienen defaults en variantes normales
    }

    return defaultFlavors
  }, [selectedProduct, selectedVariant, modifiers])

  // Auto-select default modifiers when product or variant changes
  useEffect(() => {
    if (defaultModifierIds.length > 0) {
      setSelectedModifierIds(defaultModifierIds)
    } else {
      setSelectedModifierIds([])
    }
  }, [defaultModifierIds])

  // Calculate pricing
  const currentItemCost = useMemo(() => {
    if (!selectedVariant) return 0

    let total = selectedVariant.price

    // Add modifier costs (flavors/extras not included)
    selectedModifierIds.forEach(modId => {
      const modifier = modifiers.find(m => m.id === modId)
      if (!modifier) return

      // Check if it's a default modifier (included for free)
      const isDefault = defaultModifierIds.includes(modId)

      if (!isDefault) {
        total += modifier.price
      }
    })

    return total
  }, [selectedVariant, selectedModifierIds, modifiers, defaultModifierIds])

  // Calculate cart total
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      let itemTotal = item.variant.price
      item.selectedModifiers.forEach(({ modifier, quantity }) => {
        itemTotal += modifier.price * quantity
      })
      return sum + (itemTotal * item.quantity)
    }, 0)
  }, [cart])

  // Handlers
  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId)
    const product = products.find(p => p.id === productId)
    setSelectedVariantId(product?.variants?.[0]?.id ?? '')
    setSelectedModifierIds([])
  }

  const handleVariantChange = (variantId: string) => {
    setSelectedVariantId(variantId)
  }

  const toggleModifier = (modifierId: string) => {
    setSelectedModifierIds(prev =>
      prev.includes(modifierId)
        ? prev.filter(id => id !== modifierId)
        : [...prev, modifierId]
    )
  }

  const addToCart = () => {
    if (!selectedProduct || !selectedVariant) return

    const selectedMods = selectedModifierIds.map(modId => ({
      modifier: modifiers.find(m => m.id === modId)!,
      quantity: 1
    })).filter(item => item.modifier)

    setCart(prev => [...prev, {
      product: selectedProduct,
      variant: selectedVariant,
      selectedModifiers: selectedMods,
      quantity: 1
    }])

    // Reset selections
    setSelectedModifierIds([])
  }

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index))
  }

  // Categorize products for display
  const burgers = products.filter(p => p.category === 'protein_base' || p.category === 'special')
  const sides = products.filter(p => p.category === 'side')
  const drinks = products.filter(p => p.category === 'drink')

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* LEFT COLUMN: Product Selection */}
      <div className="lg:col-span-2 space-y-6">

        {/* 1. Product Selection */}
        <section className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="text-xl font-bold text-[#3B1F1A] mb-4">1. Selecciona tu Producto</h2>

          <div className="space-y-4">
            {burgers.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Hamburguesas</h3>
                <div className="grid grid-cols-2 gap-3">
                  {burgers.map(product => (
                    <button
                      key={product.id}
                      onClick={() => handleProductChange(product.id)}
                      className={`p-3 rounded-lg border-2 text-left transition ${selectedProductId === product.id
                        ? 'border-[#C08A3E] bg-amber-50'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="font-semibold text-sm">{product.name}</div>
                      <div className="text-xs text-gray-500">
                        Desde ${Math.min(...(product.variants?.map(v => v.price) ?? [0]))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {sides.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Acompañamientos</h3>
                <div className="grid grid-cols-2 gap-3">
                  {sides.map(product => (
                    <button
                      key={product.id}
                      onClick={() => handleProductChange(product.id)}
                      className={`p-3 rounded-lg border-2 text-left transition ${selectedProductId === product.id
                        ? 'border-[#C08A3E] bg-amber-50'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="font-semibold text-sm">{product.name}</div>
                      <div className="text-xs text-gray-500">
                        ${product.variants?.[0]?.price ?? 0}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {drinks.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Bebidas</h3>
                <div className="grid grid-cols-3 gap-3">
                  {drinks.map(product => (
                    <button
                      key={product.id}
                      onClick={() => handleProductChange(product.id)}
                      className={`p-2 rounded-lg border-2 text-center transition ${selectedProductId === product.id
                        ? 'border-[#C08A3E] bg-amber-50'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="font-semibold text-xs">{product.name}</div>
                      <div className="text-xs text-gray-500">
                        ${product.variants?.[0]?.price ?? 0}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 2. Variant Selection */}
        {selectedProduct && selectedProduct.variants && selectedProduct.variants.length > 0 && (
          <section className="bg-white rounded-xl p-6 shadow-sm border">
            <h2 className="text-xl font-bold text-[#3B1F1A] mb-4">2. Elige Tamaño/Variante</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {selectedProduct.variants.map(variant => (
                <button
                  key={variant.id}
                  onClick={() => handleVariantChange(variant.id)}
                  className={`p-4 rounded-lg border-2 transition ${selectedVariantId === variant.id
                    ? 'border-[#C08A3E] bg-amber-50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="font-bold capitalize text-sm">{variant.name}</div>
                  <div className="text-lg font-bold text-[#C08A3E] mt-1">${variant.price}</div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* 3. Extras (Queso, Tocino, Carne) */}
        {selectedProduct && availableExtras.length > 0 && (
          <section className="bg-white rounded-xl p-6 shadow-sm border">
            <h2 className="text-xl font-bold text-[#3B1F1A] mb-4">3. Modificadores/Extras</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableExtras.map((modifier: V2Modifier) => {
                const isSelected = selectedModifierIds.includes(modifier.id)

                return (
                  <label
                    key={modifier.id}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition ${isSelected ? 'bg-amber-50 border-amber-300' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleModifier(modifier.id)}
                      className="w-5 h-5"
                    />
                    <span className="flex-1 font-medium">{modifier.name}</span>
                    <span className="text-sm font-bold text-[#C08A3E]">
                      +${modifier.price}
                    </span>
                  </label>
                )
              })}
            </div>
          </section>
        )}

        {/* 4. Sabores (Chimi, Mojo, Diabla, etc.) */}
        {selectedProduct && availableFlavors.length > 0 && (
          <section className="bg-white rounded-xl p-6 shadow-sm border">
            <h2 className="text-xl font-bold text-[#3B1F1A] mb-4">4. Sabores</h2>

            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                {defaultModifierIds.length > 0 ? (
                  <>
                    💡 <strong>Sabores incluidos por defecto:</strong>{' '}
                    {defaultModifierIds.map(id => {
                      const mod = modifiers.find(m => m.id === id)
                      return mod?.name
                    }).filter(Boolean).join(', ')}
                    {'. '}
                    Puedes agregar más sabores por <strong>+$5</strong> cada uno.
                  </>
                ) : (
                  <>
                    💡 Esta hamburguesa no incluye sabores por defecto. Puedes agregar los que quieras por <strong>+$5</strong> cada uno.
                  </>
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {availableFlavors.map((modifier: V2Modifier) => {
                const isSelected = selectedModifierIds.includes(modifier.id)
                const isDefault = defaultModifierIds.includes(modifier.id)

                return (
                  <label
                    key={modifier.id}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition ${isSelected
                      ? isDefault
                        ? 'bg-green-50 border-green-300'
                        : 'bg-amber-50 border-amber-300'
                      : 'border-gray-200 hover:bg-gray-50'
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleModifier(modifier.id)}
                      className="w-4 h-4"
                    />
                    <span className="flex-1 text-sm">{modifier.name}</span>
                    <span className={`text-xs font-semibold ${isDefault ? 'text-green-700' : 'text-[#C08A3E]'
                      }`}>
                      {isDefault ? '✓ Incluido' : `+$${modifier.price}`}
                    </span>
                  </label>
                )
              })}
            </div>
          </section>
        )}

        {/* Add to Cart Button */}
        {selectedVariant && (
          <button
            onClick={addToCart}
            className="w-full bg-[#C08A3E] text-white font-bold py-4 rounded-xl hover:bg-[#9F6B2A] transition shadow-lg"
          >
            Agregar al Pedido - ${currentItemCost}
          </button>
        )}
      </div>

      {/* RIGHT COLUMN: Cart Summary */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl p-6 shadow-sm border sticky top-4">
          <h2 className="text-xl font-bold text-[#3B1F1A] mb-4">Tu Pedido</h2>

          {cart.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">
              Tu carrito está vacío.<br />
              Agrega productos para empezar.
            </p>
          ) : (
            <div className="space-y-4">
              {cart.map((item, index) => (
                <div key={index} className="border-b pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold text-sm">{item.product.name}</div>
                      <div className="text-xs text-gray-500 capitalize">{item.variant.name}</div>
                    </div>
                    <button
                      onClick={() => removeFromCart(index)}
                      className="text-red-500 text-xs hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>

                  {item.selectedModifiers.length > 0 && (
                    <div className="text-xs text-gray-600 space-y-1 ml-2">
                      {item.selectedModifiers.map((mod, i) => (
                        <div key={i} className="flex justify-between">
                          <span>+ {mod.modifier.name}</span>
                          <span>${mod.modifier.price}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="text-sm font-bold text-right mt-2">
                    ${item.variant.price + item.selectedModifiers.reduce((s, m) => s + m.modifier.price, 0)}
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-2xl text-[#C08A3E]">${cartTotal}</span>
                </div>

                <button
                  onClick={() => setCart([])}
                  className="w-full bg-gray-200 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-300 transition text-sm"
                >
                  Limpiar Carrito
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}