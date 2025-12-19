'use client'
import { useState, useEffect } from 'react'
import { createSupply, updateSupply, getSupplyIngredients, addSupplyIngredient, removeSupplyIngredient, updateSupplyIngredient, getSupplies } from '../../supplies/actions'
import { Supply, SupplyType, SupplyIngredient, CountingMode } from '@trailer/shared'

type Props = {
    supply?: Supply // Si viene, es edición. Si no, es crear.
    onClose: () => void
}

export function ProductionModal({ supply, onClose }: Props) {
    const [isSaving, setIsSaving] = useState(false)
    // Hardcoded to production
    const supplyType: SupplyType = 'production'
    const [countingMode, setCountingMode] = useState<CountingMode>(supply?.counting_mode || 'integer')

    // Production Mode State
    const [manualCost, setManualCost] = useState(supply?.cost_per_unit || 0)
    const [yieldQuantity, setYieldQuantity] = useState<number | string>(supply?.yield_quantity || 1)
    const [ingredients, setIngredients] = useState<SupplyIngredient[]>([])
    const [availableSupplies, setAvailableSupplies] = useState<Supply[]>([])
    const [showIngredientSelector, setShowIngredientSelector] = useState(false)

    // Ingredient Search
    const [ingredientSearch, setIngredientSearch] = useState('')

    // Yield Calculator State
    const [showYieldCalc, setShowYieldCalc] = useState(false)
    const [unitWeight, setUnitWeight] = useState(0) // Peso de la unidad final (ej. 115g)

    // Categorias comunes de cocina
    const kitchenCategories = ['Proteínas', 'Salsas', 'Preparados', 'Postres', 'Bebidas Preparadas', 'Otros']

    // Cargar ingredientes siempre (si es edición)
    useEffect(() => {
        if (supply) {
            loadIngredients()
        }
    }, [supply])

    // Cargar lista de insumos disponibles para el selector (SOLO insumos de compra)
    useEffect(() => {
        getSupplies().then(data => {
            // Filtrar solo 'purchase' para evitar ciclos y simplificar
            const purchaseSupplies = data.filter(s => s.supply_type === 'purchase')
            setAvailableSupplies(purchaseSupplies)
        })
    }, [])

    // Insumos filtrados por búsqueda
    const filteredAvailableSupplies = availableSupplies.filter(s =>
        s.name.toLowerCase().includes(ingredientSearch.toLowerCase()) ||
        s.category?.toLowerCase().includes(ingredientSearch.toLowerCase())
    )

    const loadIngredients = async () => {
        if (!supply) return
        const data = await getSupplyIngredients(supply.id)
        setIngredients(data)
    }

    // Calcular costo total de ingredientes
    const totalIngredientsCost = ingredients.reduce((sum, ing) => {
        const cost = ing.child_supply?.cost_per_unit || 0
        return sum + (cost * ing.quantity)
    }, 0)

    const yieldVal = Number(yieldQuantity) || 0
    const calculatedProductionCost = yieldVal > 0 ? totalIngredientsCost / yieldVal : 0

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSaving(true)
        const formData = new FormData(e.currentTarget)
        // Asegurar que el tipo se envíe como production
        formData.set('supply_type', 'production')

        // Si tiene ingredientes, el costo unitario es calculado
        if (ingredients.length > 0) {
            formData.set('cost_per_unit', calculatedProductionCost.toFixed(2))
        } else {
            // Si no tiene ingredientes, usa el costo manual (para empezar)
            formData.set('cost_per_unit', manualCost.toFixed(2))
        }

        let res
        if (supply) {
            res = await updateSupply(supply.id, formData)
        } else {
            res = await createSupply(formData)
        }

        setIsSaving(false)
        if (res?.error) alert(res.error)
        else onClose()
    }

    const handleAddIngredient = async (childId: string) => {
        if (!supply) return

        try {
            // Default quantity 1
            const res = await addSupplyIngredient(supply.id, childId, 1)
            if (res?.error) {
                alert(`Error al agregar ingrediente: ${res.error}`)
                return
            }
            await loadIngredients()
            setShowIngredientSelector(false)
        } catch (error) {
            console.error(error)
            alert('Error inesperado al agregar ingrediente')
        }
    }

    const handleRemoveIngredient = async (ingredientId: string) => {
        if (!supply) return
        await removeSupplyIngredient(ingredientId, supply.id)
        await loadIngredients()
    }

    // Lógica de Cálculo Automático de Rendimiento
    const calculateYield = () => {
        // 1. Sumar peso efectivo de ingredientes (Peso - Merma)
        let totalEffectiveWeight = 0

        ingredients.forEach(ing => {
            const qty = ing.quantity
            const shrinkage = (ing.child_supply?.shrinkage_percent || 0) / 100

            // Conversión simple (Mejorar en el futuro con tabla de conversiones real)
            let weightInGrams = 0
            if (ing.child_supply?.unit === 'kg') weightInGrams = qty * 1000
            else if (ing.child_supply?.unit === 'lt') weightInGrams = qty * 1000 // Aprox agua
            else if (ing.child_supply?.unit === 'gr' || ing.child_supply?.unit === 'ml') weightInGrams = qty
            else weightInGrams = qty * 0 // Piezas u otros no suman peso automáticamente sin saber cuánto pesan

            const effectiveWeight = weightInGrams * (1 - shrinkage)
            totalEffectiveWeight += effectiveWeight
        })

        if (unitWeight > 0) {
            const calculatedYield = totalEffectiveWeight / unitWeight
            setYieldQuantity(parseFloat(calculatedYield.toFixed(2)))
            setShowYieldCalc(false)
        } else {
            alert('Ingresa el peso por unidad final (ej. 115g para una carne)')
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto border-t-4 border-purple-600">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-purple-900">
                        {supply ? 'Editar Receta' : 'Nueva Receta'}
                    </h2>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full">
                        👩‍🍳 Producción Interna
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase">Nombre de la Receta *</label>
                        <input name="name" defaultValue={supply?.name} required className="w-full p-2 border rounded focus:ring-purple-500" placeholder="Ej. Salsa Especial, Carne Hamburguesa..." />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase">Unidad de Salida *</label>
                        <select
                            name="unit"
                            defaultValue={supply?.unit || 'pz'}
                            className="w-full p-2 border rounded"
                        >
                            <option value="pz">Piezas (pz)</option>
                            <option value="kg">Kilogramos (kg)</option>
                            <option value="lt">Litros (lt)</option>
                            <option value="gr">Gramos (gr)</option>
                            <option value="ml">Mililitros (ml)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase">Stock Mínimo (Alerta)</label>
                        <input
                            name="min_stock"
                            type="number"
                            step="0.01"
                            defaultValue={supply?.min_stock || 5}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                </div>

                {/* Sección de Receta */}
                <div className="border-t pt-4 bg-purple-50 -mx-6 px-6 pb-4">
                    <h3 className="text-sm font-bold text-purple-900 mb-3">📝 Ingredientes y Rendimiento</h3>

                    {/* Rendimiento con Calculadora */}
                    <div className="mb-4 bg-white p-3 rounded border border-purple-100 shadow-sm">
                        <div className="flex justify-between items-end mb-2">
                            <label className="block text-xs font-bold text-purple-800 uppercase">
                                Cantidad Resultante (Rendimiento) *
                                <span className="block text-[10px] text-gray-400 font-normal normal-case mt-0.5">
                                    ¿Cuántos {supply?.unit || 'unidades'} obtienes al preparar esta receta completa?
                                </span>
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowYieldCalc(!showYieldCalc)}
                                className="text-xs text-blue-600 hover:underline font-bold"
                            >
                                ⚡ Calcular Automáticamente
                            </button>
                        </div>

                        {showYieldCalc && (
                            <div className="mb-3 p-3 bg-blue-50 rounded border border-blue-100 text-sm">
                                <p className="font-bold text-blue-800 mb-2">Calculadora de Rendimiento</p>
                                <div className="flex gap-2 items-end">
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-gray-500">Peso por Unidad Final (gramos)</label>
                                        <input
                                            type="number"
                                            value={unitWeight || ''}
                                            onChange={(e) => setUnitWeight(parseFloat(e.target.value))}
                                            placeholder="Ej. 115 (para carne)"
                                            className="w-full p-1 border rounded"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={calculateYield}
                                        className="bg-blue-600 text-white px-3 py-1 rounded font-bold hover:bg-blue-700"
                                    >
                                        Aplicar
                                    </button>
                                </div>
                            </div>
                        )}

                        <input
                            name="yield_quantity"
                            type="number"
                            step="0.01"
                            value={yieldQuantity}
                            onChange={(e) => setYieldQuantity(e.target.value === '' ? '' : parseFloat(e.target.value))}
                            required
                            placeholder="Ej. 900 (para ml)"
                            className="w-full p-2 border rounded bg-white border-purple-200 font-bold text-lg text-purple-900"
                        />
                    </div>

                    {/* Presentación (Opcional) */}
                    <div className="mb-4 bg-blue-50 p-3 rounded border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                            <label className="block text-xs font-bold text-blue-800 uppercase">
                                📦 Presentación de Conteo (Opcional)
                            </label>
                        </div>
                        <p className="text-[10px] text-blue-600 mb-3">
                            Si manejas este producto en presentaciones (ej: botellas de 500ml), llena estos campos para visualizar el stock en unidades manejables.
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Nombre de presentación</label>
                                <input
                                    name="purchase_unit"
                                    type="text"
                                    defaultValue={supply?.purchase_unit || ''}
                                    placeholder="Ej: botella, mamila"
                                    className="w-full p-2 border rounded text-sm focus:ring-1 ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">{supply?.unit || 'Unidades'} por presentación</label>
                                <input
                                    name="quantity_per_package"
                                    type="number"
                                    step="0.01"
                                    defaultValue={supply?.quantity_per_package || ''}
                                    placeholder="Ej: 500"
                                    className="w-full p-2 border rounded text-sm focus:ring-1 ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Preview calculation */}
                        {supply?.quantity_per_package && Number(yieldQuantity) > 0 && (
                            <div className="mt-2 p-2 bg-white rounded text-xs text-blue-900 font-medium">
                                ✨ Rendimiento: {(Number(yieldQuantity) / supply.quantity_per_package).toFixed(2)} {supply.purchase_unit || 'presentaciones'}
                            </div>
                        )}
                    </div>

                    {/* Lista de Ingredientes (Solo si ya existe el insumo) */}
                    {supply ? (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="block text-xs font-bold text-purple-800 uppercase">Ingredientes</label>
                                <button
                                    type="button"
                                    onClick={() => setShowIngredientSelector(!showIngredientSelector)}
                                    className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 font-bold shadow-sm"
                                >
                                    + Agregar Ingrediente
                                </button>
                            </div>

                            {showIngredientSelector && (
                                <div className="p-2 bg-white border border-purple-200 rounded shadow-lg mb-2 z-10 relative">
                                    <p className="text-xs font-bold text-gray-500 mb-2">Selecciona un insumo de compra:</p>

                                    {/* Buscador de Ingredientes */}
                                    <input
                                        type="text"
                                        placeholder="🔍 Buscar insumo..."
                                        value={ingredientSearch}
                                        onChange={(e) => setIngredientSearch(e.target.value)}
                                        className="w-full p-2 mb-2 border rounded text-sm focus:ring-1 ring-purple-500"
                                        autoFocus
                                    />

                                    <div className="max-h-48 overflow-y-auto space-y-1">
                                        {filteredAvailableSupplies.length === 0 ? (
                                            <p className="text-xs text-gray-400 text-center py-2">No se encontraron insumos.</p>
                                        ) : (
                                            filteredAvailableSupplies
                                                .filter(s => s.id !== supply.id) // Evitar auto-referencia
                                                .map(s => (
                                                    <button
                                                        key={s.id}
                                                        type="button"
                                                        onClick={() => {
                                                            handleAddIngredient(s.id)
                                                            setIngredientSearch('') // Limpiar búsqueda al seleccionar
                                                        }}
                                                        className="block w-full text-left text-sm px-2 py-1 hover:bg-purple-50 rounded flex justify-between border-b border-gray-100 last:border-0"
                                                    >
                                                        <span className="font-medium text-gray-700">{s.name}</span>
                                                        <span className="text-gray-400 text-xs">
                                                            {s.unit} (Compra)
                                                        </span>
                                                    </button>
                                                ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {ingredients.length === 0 ? (
                                <p className="text-sm text-gray-500 italic p-4 text-center border border-dashed border-gray-300 rounded bg-gray-50">
                                    No hay ingredientes agregados a esta receta.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {ingredients.map(ing => (
                                        <div key={ing.id} className="flex justify-between items-center bg-white p-2 rounded border border-purple-100 shadow-sm">
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-gray-800">{ing.child_supply?.name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <input
                                                        type="number"
                                                        step="0.001"
                                                        defaultValue={ing.quantity}
                                                        onBlur={async (e) => {
                                                            const newQty = parseFloat(e.target.value)
                                                            if (newQty > 0 && newQty !== ing.quantity) {
                                                                await updateSupplyIngredient(ing.id, newQty)
                                                                await loadIngredients()
                                                            }
                                                        }}
                                                        className="w-20 p-1 text-xs border rounded text-center bg-gray-50 focus:bg-white focus:ring-1 ring-purple-500 font-bold"
                                                    />
                                                    <span className="text-xs text-gray-500 font-medium">{ing.child_supply?.unit}</span>
                                                    <span className="text-xs text-gray-400">(${(ing.child_supply?.cost_per_unit || 0).toFixed(2)})</span>
                                                </div>
                                                {ing.child_supply?.shrinkage_percent ? <p className="text-[10px] text-red-500 mt-1">Merma {ing.child_supply.shrinkage_percent}%</p> : null}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-bold text-purple-700">
                                                    ${((ing.child_supply?.cost_per_unit || 0) * ing.quantity).toFixed(2)}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveIngredient(ing.id)}
                                                    className="text-red-400 hover:text-red-600 px-2"
                                                    title="Eliminar ingrediente"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Resumen de Costos */}
                            <div className="mt-4 p-4 bg-purple-900 text-white rounded-lg shadow-md">
                                <div className="flex justify-between text-sm mb-1 opacity-80">
                                    <span>Costo Total Ingredientes:</span>
                                    <span>${totalIngredientsCost.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm mb-2 border-b border-purple-700 pb-2 opacity-80">
                                    <span>Rendimiento:</span>
                                    <span>{yieldQuantity} unidades</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold">
                                    <span>Costo Unitario:</span>
                                    <span>${calculatedProductionCost.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-yellow-50 text-yellow-800 text-sm rounded border border-yellow-200 flex items-center gap-2">
                            <span>⚠️</span>
                            Guarda primero el nombre y rendimiento para agregar ingredientes.
                            <input type="hidden" name="manual_cost" value="0" />
                        </div>
                    )}
                </div>

                {/* Categoría */}
                <div className="pt-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase">Categoría</label>
                    <select
                        name="category"
                        defaultValue={supply?.category || 'Salsas'}
                        className="w-full p-2 border rounded bg-white"
                    >
                        {kitchenCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                    <button type="button" onClick={onClose} className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded font-bold">Cancelar</button>
                    <button type="submit" disabled={isSaving} className="flex-1 py-2 bg-purple-700 text-white hover:bg-purple-800 rounded font-bold disabled:opacity-50">
                        {isSaving ? 'Guardando...' : 'Guardar Receta'}
                    </button>
                </div>
            </form >
        </div >
    )
}
