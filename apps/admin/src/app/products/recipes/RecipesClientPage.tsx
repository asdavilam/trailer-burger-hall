'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { RecipeModal } from '../[id]/RecipeModal'
import { FinancialSettings } from '@/app/settings/actions'

type Props = {
    products: any[]
    settings: FinancialSettings | null
}

export default function RecipesClientPage({ products, settings }: Props) {
    const router = useRouter()
    const [editingVariant, setEditingVariant] = useState<any>(null)

    // Calcular Costo Fijo Unitario
    let fixedUnitCost = 0
    if (settings) {
        const totalFixedMonthly =
            settings.rent_cost +
            settings.salaries_cost +
            settings.water_cost +
            settings.electricity_cost +
            settings.marketing_cost +
            settings.taxes_cost +
            settings.other_costs

        const totalUnitsPerMonth = settings.work_days_per_month * settings.avg_sales_per_day

        if (totalUnitsPerMonth > 0) {
            fixedUnitCost = totalFixedMonthly / totalUnitsPerMonth
        }
    }

    const handleCloseModal = () => {
        setEditingVariant(null)
        router.refresh() // Recargar datos al cerrar
    }

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Recetario & Costos 👨‍🍳</h1>
                    <p className="text-gray-500">
                        Vista general de ingredientes y costos reales por producto.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {products.map((product: any) => (
                    <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

                        {/* Cabecera del Producto */}
                        <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
                                <span className="text-xs font-bold uppercase tracking-wider bg-white border border-gray-200 text-gray-500 px-2 py-1 rounded">
                                    {product.category}
                                </span>
                            </div>
                            <Link
                                href={`/products/${product.id}`}
                                className="text-sm font-medium text-orange-600 hover:text-orange-800 hover:underline"
                            >
                                Ver Producto →
                            </Link>
                        </div>

                        {/* Lista de Variantes (Tamaños) */}
                        <div className="divide-y divide-gray-100">
                            {product.variants?.map((variant: any) => {

                                // 1. Calcular Costo Directo (Insumos)
                                const directCost = variant.ingredients?.reduce((acc: number, ing: any) => {
                                    const unitCost = ing.supply?.cost_per_unit || 0
                                    return acc + (unitCost * ing.quantity)
                                }, 0) || 0

                                // 2. Costo Total (Directo + Fijo)
                                const totalCost = directCost + fixedUnitCost

                                // 3. Utilidad Neta
                                const netProfit = variant.price - totalCost
                                const marginPercent = variant.price > 0 ? (netProfit / variant.price) * 100 : 0

                                const hasRecipe = variant.ingredients && variant.ingredients.length > 0

                                return (
                                    <div key={variant.id} className="p-6 flex flex-col md:flex-row gap-6">
                                        {/* Columna Izquierda: Info Financiera */}
                                        <div className="md:w-1/3 min-w-[250px] space-y-4">
                                            <div className="flex justify-between items-start">
                                                <h3 className="text-lg font-bold capitalize text-gray-800">{variant.name}</h3>
                                                <button
                                                    onClick={() => setEditingVariant(variant)}
                                                    className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 font-bold transition"
                                                >
                                                    ✏️ Editar Receta
                                                </button>
                                            </div>

                                            <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm border border-gray-100">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Precio Venta (Efectivo)</span>
                                                    <span className="font-bold text-gray-900">${variant.price.toFixed(2)}</span>
                                                </div>

                                                {/* Precio con Comisión */}
                                                {settings?.card_commission_percent && settings.card_commission_percent > 0 && (
                                                    <div className="flex justify-between text-purple-700">
                                                        <span className="text-xs">Precio Venta (Tarjeta)</span>
                                                        <span className="font-bold text-sm">
                                                            ${(variant.price * (1 + (settings.card_commission_percent / 100))).toFixed(2)}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="border-t border-gray-200 my-1"></div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Costo Insumos</span>
                                                    <span className="text-gray-700">${directCost.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Costo Fijo (Est.)</span>
                                                    <span className="text-orange-600">+${fixedUnitCost.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between font-medium bg-gray-100 p-1 rounded">
                                                    <span className="text-gray-700">Costo Total</span>
                                                    <span className="text-gray-900">${totalCost.toFixed(2)}</span>
                                                </div>
                                                <div className="border-t border-gray-200 my-1"></div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-500 font-bold">Utilidad Neta</span>
                                                    <div className="text-right">
                                                        <div className={`font-bold ${netProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                            ${netProfit.toFixed(2)}
                                                        </div>
                                                        <div className={`text-[10px] ${marginPercent < 30 ? 'text-red-500' : 'text-green-600'}`}>
                                                            {marginPercent.toFixed(0)}% Margen
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Columna Derecha: Tabla de Ingredientes */}
                                        <div className="flex-1 bg-white rounded-lg border border-gray-100">
                                            {!hasRecipe ? (
                                                <div className="h-full flex flex-col items-center justify-center text-center py-8 bg-gray-50/50">
                                                    <span className="text-2xl mb-2">⚠️</span>
                                                    <p className="text-gray-500 text-sm font-medium">Sin receta definida</p>
                                                    <button
                                                        onClick={() => setEditingVariant(variant)}
                                                        className="mt-2 text-xs text-purple-600 hover:underline"
                                                    >
                                                        Definir Receta Ahora
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-sm">
                                                        <thead className="bg-gray-50">
                                                            <tr className="text-left text-xs font-bold text-gray-400 uppercase">
                                                                <th className="py-2 px-4">Insumo</th>
                                                                <th className="py-2 px-4 text-right">Cant.</th>
                                                                <th className="py-2 px-4 text-right">Costo</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-50">
                                                            {variant.ingredients.map((ing: any) => (
                                                                <tr key={ing.id}>
                                                                    <td className="py-2 px-4 text-gray-700">{ing.supply?.name}</td>
                                                                    <td className="py-2 px-4 text-right font-mono text-gray-500">
                                                                        {ing.quantity} <span className="text-[10px]">{ing.supply?.unit}</span>
                                                                    </td>
                                                                    <td className="py-2 px-4 text-right text-gray-400">
                                                                        ${((ing.supply?.cost_per_unit || 0) * ing.quantity).toFixed(2)}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL */}
            {editingVariant && (
                <RecipeModal
                    variant={editingVariant}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    )
}
