'use client'

import React, { useState, useMemo, useEffect } from 'react'
import type { V2Product, V2ProductVariant, V2Modifier } from '@trailer/shared'
import { formatCurrency } from '@/lib/currency'
import { X, Check } from 'lucide-react'

interface ProductConfigDialogProps {
    product: V2Product
    modifiers: V2Modifier[]
    onClose: () => void
    onConfirm: (
        variant: V2ProductVariant,
        modifiers: Array<{ modifier: V2Modifier; quantity: number }>,
        notes: string[]
    ) => void
}

const QUICK_NOTES = [
    { id: 's/verd', label: 'Sin Verdura' },
    { id: 's/jsp', label: 'Sin J/C/P' }, // Jitomate/Cebolla/Pepinillo
    { id: 'Q', label: 'Queso' },
    { id: 's/may', label: 'Sin Mayonesa' },
    { id: 's/chi', label: 'Sin Chile' }
]

export function ProductConfigDialog({ product, modifiers, onClose, onConfirm }: ProductConfigDialogProps) {
    // State
    const [selectedVariantId, setSelectedVariantId] = useState<string>('')
    const [selectedModifierIds, setSelectedModifierIds] = useState<string[]>([])
    const [selectedNotes, setSelectedNotes] = useState<string[]>([])

    // Sort variants by price ascending
    const sortedVariants = useMemo(() => {
        return [...(product.variants || [])].sort((a, b) => a.price - b.price)
    }, [product])

    // Initialize with first variant
    useEffect(() => {
        if (sortedVariants.length > 0 && !selectedVariantId) {
            // Prefer "normal" or active variant
            // NOTE: Variant names are lowercase in the DB enum (normal, double, etc.)
            const defaultVariant = sortedVariants.find(v => v.name === 'normal') || sortedVariants.find(v => v.is_active) || sortedVariants[0]
            if (defaultVariant) setSelectedVariantId(defaultVariant.id)
        }
    }, [sortedVariants, selectedVariantId])

    const selectedVariant = useMemo(
        () => sortedVariants.find(v => v.id === selectedVariantId),
        [sortedVariants, selectedVariantId]
    )

    // Modifiers Logic (copied and adapted from SimulatorClient)
    const flavorModifiers = useMemo(() => modifiers.filter(m => m.type === 'flavor'), [modifiers])
    const extraModifiers = useMemo(() => modifiers.filter(m => m.type === 'extra'), [modifiers])

    const availableFlavors = useMemo(() => {
        if (product.category === 'protein_base' || product.category === 'special') {
            return flavorModifiers
        }
        const allowedIds = product.allowed_modifiers?.map(link => link.modifier_id) ?? []
        return flavorModifiers.filter(m => allowedIds.includes(m.id))
    }, [product, flavorModifiers])

    const availableExtras = useMemo(() => {
        const allowedIds = product.allowed_modifiers?.map(link => link.modifier_id) ?? []
        return extraModifiers.filter(m => allowedIds.includes(m.id))
    }, [product, extraModifiers])

    // Default Modifiers Logic
    const defaultModifierIds = useMemo(() => {
        if (!selectedVariant) return []

        const productName = product.name.toLowerCase()
        const variantName = selectedVariant.name.toLowerCase()

        const findModifiersByNames = (names: string[]) => {
            return names
                .map(name => modifiers.find(m => m.name.toLowerCase().includes(name.toLowerCase()))?.id)
                .filter(Boolean) as string[]
        }

        let defaultFlavors: string[] = []

        if (variantName === 'casa') {
            const isSea = productName.includes('camarón') || productName.includes('camaron') ||
                productName.includes('salmón') || productName.includes('salmon')
            const isResPollo = productName.includes('res') || productName.includes('pollo')

            if (isSea) {
                defaultFlavors = findModifiersByNames(['Mojo', 'Diabla', 'Chimi'])
            } else if (isResPollo) {
                defaultFlavors = findModifiersByNames(['Habanero', 'Chimi', 'Mojo'])
            } else if (productName.includes('portobello')) {
                defaultFlavors = findModifiersByNames(['Chimi', 'Mojo'])
            }
        } else {
            const isSea = productName.includes('camarón') || productName.includes('camaron') ||
                productName.includes('salmón') || productName.includes('salmon')
            const isPortobello = productName.includes('portobello')

            if (isSea) {
                defaultFlavors = findModifiersByNames(['Mojo', 'Diabla'])
            } else if (isPortobello) {
                defaultFlavors = findModifiersByNames(['Chimi', 'Mojo'])
            }
        }

        return defaultFlavors
    }, [product, selectedVariant, modifiers])

    // Auto-select defaults
    useEffect(() => {
        if (defaultModifierIds.length > 0) {
            setSelectedModifierIds(defaultModifierIds)
        } else {
            setSelectedModifierIds([])
        }
    }, [defaultModifierIds])

    const toggleModifier = (modifierId: string) => {
        setSelectedModifierIds(prev =>
            prev.includes(modifierId)
                ? prev.filter(id => id !== modifierId)
                : [...prev, modifierId]
        )
    }

    const toggleNote = (noteId: string) => {
        setSelectedNotes(prev =>
            prev.includes(noteId)
                ? prev.filter(n => n !== noteId)
                : [...prev, noteId]
        )
    }

    // Calculate Cost
    const currentTotal = useMemo(() => {
        if (!selectedVariant) return 0
        let total = selectedVariant.price

        selectedModifierIds.forEach(modId => {
            const modifier = modifiers.find(m => m.id === modId)
            if (!modifier) return

            const isDefault = defaultModifierIds.includes(modId)
            // If default, it's free/included. If not, add price.
            if (!isDefault) {
                total += modifier.price
            }
        })
        return total
    }, [selectedVariant, selectedModifierIds, modifiers, defaultModifierIds])

    const handleConfirm = () => {
        if (!selectedVariantId || !selectedVariant) return

        const selectedModsDetails = selectedModifierIds.map(id => {
            const mod = modifiers.find(m => m.id === id)!
            return { modifier: mod, quantity: 1 }
        })

        onConfirm(selectedVariant, selectedModsDetails, selectedNotes)
        onClose()
    }

    if (!sortedVariants.length) return null

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
                    <div>
                        <h2 className="text-2xl font-bold text-espresso">{product.name}</h2>
                        <p className="text-gray-500">{product.category}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-white rounded-full hover:bg-gray-100 transition shadow-sm"
                    >
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50/50">

                    {/* 1. Variants */}
                    <section>
                        <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-bronze text-white flex items-center justify-center text-sm">1</span>
                            Elige Tamaño
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {sortedVariants.map(variant => (
                                <button
                                    key={variant.id}
                                    onClick={() => setSelectedVariantId(variant.id)}
                                    className={`p-4 rounded-xl border-2 transition-all relative overflow-hidden ${selectedVariantId === variant.id
                                        ? 'border-bronze bg-white shadow-md'
                                        : 'border-transparent bg-white shadow-sm hover:border-gray-200'
                                        }`}
                                >
                                    <span className="block font-bold text-espresso mb-1 capitalize">{variant.name}</span>
                                    <span className="block text-2xl font-bold text-bronze">{formatCurrency(variant.price)}</span>
                                    {selectedVariantId === variant.id && (
                                        <div className="absolute top-2 right-2 text-bronze">
                                            <Check className="w-5 h-5" strokeWidth={3} />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* 2. Extras */}
                    {availableExtras.length > 0 && (
                        <section>
                            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-bronze text-white flex items-center justify-center text-sm">2</span>
                                Extras
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {availableExtras.map(modifier => {
                                    const isSelected = selectedModifierIds.includes(modifier.id)
                                    return (
                                        <button
                                            key={modifier.id}
                                            onClick={() => toggleModifier(modifier.id)}
                                            className={`p-3 rounded-xl border-2 transition-all flex items-center justify-between group ${isSelected
                                                ? 'border-bronze bg-bronze/5'
                                                : 'border-transparent bg-white shadow-sm hover:border-gray-200'
                                                }`}
                                        >
                                            <span className="font-medium text-gray-700">{modifier.name}</span>
                                            <span className="font-bold text-bronze">+{formatCurrency(modifier.price)}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </section>
                    )}

                    {/* Quick Notes / Preferences */}
                    <section>
                        <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-bronze text-white flex items-center justify-center text-sm">3</span>
                            Preferencias
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {QUICK_NOTES.map(note => (
                                <button
                                    key={note.id}
                                    onClick={() => toggleNote(note.id)}
                                    className={`px-4 py-2 rounded-full border-2 text-sm font-semibold transition-all ${selectedNotes.includes(note.id)
                                            ? 'border-red-400 bg-red-50 text-red-600'
                                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                        }`}
                                >
                                    {note.label || note.id}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* 4. Flavors */}
                    {availableFlavors.length > 0 && (
                        <section>
                            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-bronze text-white flex items-center justify-center text-sm">4</span>
                                Sabores
                            </h3>

                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-4 text-sm text-blue-800 flex items-start gap-3">
                                <div className="mt-0.5">💡</div>
                                <div>
                                    {defaultModifierIds.length > 0 ? (
                                        <div>
                                            <strong>Incluidos en {selectedVariant?.name}: </strong>
                                            {defaultModifierIds.map(id => modifiers.find(m => m.id === id)?.name).join(', ')}.
                                            {' '}Los demás tienen costo extra.
                                        </div>
                                    ) : (
                                        "Esta variante no incluye sabores por defecto."
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {availableFlavors.map(modifier => {
                                    const isSelected = selectedModifierIds.includes(modifier.id)
                                    const isDefault = defaultModifierIds.includes(modifier.id)

                                    return (
                                        <button
                                            key={modifier.id}
                                            onClick={() => toggleModifier(modifier.id)}
                                            className={`p-3 rounded-xl border-2 transition-all text-left relative overflow-hidden ${isSelected
                                                ? isDefault
                                                    ? 'border-sage bg-sage/5'
                                                    : 'border-bronze bg-bronze/5'
                                                : 'border-transparent bg-white shadow-sm hover:border-gray-200'
                                                }`}
                                        >
                                            <div className="font-medium text-gray-800 mb-1">{modifier.name}</div>
                                            <div className={`text-sm font-bold ${isDefault ? 'text-sage' : 'text-bronze'
                                                }`}>
                                                {isDefault ? 'Incluido' : `+${formatCurrency(modifier.price)}`}
                                            </div>
                                            {isSelected && (
                                                <div className={`absolute top-2 right-2 ${isDefault ? 'text-sage' : 'text-bronze'}`}>
                                                    <Check className="w-4 h-4" strokeWidth={3} />
                                                </div>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </section>
                    )}

                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-200 bg-white shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
                    <div className="flex gap-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-4 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-lg hover:bg-gray-50 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="flex-[2] py-4 rounded-xl bg-bronze text-white font-bold text-lg hover:bg-bronze/90 transition shadow-lg flex items-center justify-center gap-2"
                        >
                            <span>Agregar Orden</span>
                            <span className="bg-black/20 px-3 py-1 rounded-lg text-base">
                                {formatCurrency(currentTotal)}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
