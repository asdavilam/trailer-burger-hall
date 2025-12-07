'use client'

import { useState } from 'react'
import { FinancialSettings, updateFinancialSettings } from './actions'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Supply } from '@trailer/shared'
import { CountingModeSettings } from './CountingModeSettings'
import { ClassificationSettings } from './ClassificationSettings'
import { DaySelector } from './DaySelector'

export default function SettingsPage({ initialSettings, supplies }: { initialSettings: FinancialSettings, supplies: Supply[] }) {
    const [activeTab, setActiveTab] = useState<'finance' | 'inventory' | 'permissions'>('finance')
    const [loading, setLoading] = useState(false)

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6">
            <PageHeader
                title="Configuración ⚙️"
                description="Ajustes globales del sistema y calculadora de costos."
            />

            {/* Tabs Navigation */}
            <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('finance')}
                    className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'finance' ? 'border-purple-600 text-purple-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    💰 Finanzas & Costos
                </button>
                <button
                    onClick={() => setActiveTab('inventory')}
                    className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'inventory' ? 'border-purple-600 text-purple-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    📦 Inventario
                </button>
                <button
                    onClick={() => setActiveTab('permissions')}
                    className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'permissions' ? 'border-purple-600 text-purple-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    🔒 Permisos
                </button>
            </div>

            {/* Content */}
            {activeTab === 'finance' && (
                <FinanceSettingsForm initialSettings={initialSettings} />
            )}

            {activeTab === 'inventory' && (
                <InventorySettingsForm initialSettings={initialSettings} supplies={supplies} />
            )}

            {activeTab === 'permissions' && (
                <div className="p-10 text-center border-2 border-dashed rounded-xl bg-gray-50">
                    <span className="text-4xl block mb-2">🚧</span>
                    <h3 className="text-lg font-bold text-gray-600">En Construcción</h3>
                    <p className="text-gray-500">La gestión granular de roles y permisos estará disponible pronto.</p>
                </div>
            )}
        </div>
    )
}

function FinanceSettingsForm({ initialSettings }: { initialSettings: FinancialSettings }) {
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)

    return (
        <form action={async (formData) => {
            setLoading(true)
            const res = await updateFinancialSettings(formData)
            setLoading(false)
            if (res?.error) alert('Error: ' + res.error)
            else {
                alert('Configuración guardada correctamente')
                setIsEditing(false)
            }
        }}>
            <div className="flex justify-end mb-4">
                {!isEditing ? (
                    <Button type="button" onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                        ✏️ Editar Configuración
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button type="button" onClick={() => setIsEditing(false)} variant="outline" className="text-gray-600">
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
                            {loading ? 'Guardando...' : '💾 Guardar Cambios'}
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Costos Fijos */}
                <Card>
                    <CardHeader>
                        <CardTitle>Costos Fijos Mensuales</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 items-center">
                            <label className="text-sm font-medium text-gray-600">Alquiler Local</label>
                            <input name="rent_cost" type="number" step="0.01" defaultValue={initialSettings.rent_cost} disabled={!isEditing} className="p-2 border rounded disabled:bg-gray-100" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 items-center">
                            <label className="text-sm font-medium text-gray-600">Nómina / Personal</label>
                            <input name="salaries_cost" type="number" step="0.01" defaultValue={initialSettings.salaries_cost} disabled={!isEditing} className="p-2 border rounded disabled:bg-gray-100" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 items-center">
                            <label className="text-sm font-medium text-gray-600">Servicio de Agua</label>
                            <input name="water_cost" type="number" step="0.01" defaultValue={initialSettings.water_cost} disabled={!isEditing} className="p-2 border rounded disabled:bg-gray-100" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 items-center">
                            <label className="text-sm font-medium text-gray-600">Servicio de Luz</label>
                            <input name="electricity_cost" type="number" step="0.01" defaultValue={initialSettings.electricity_cost} disabled={!isEditing} className="p-2 border rounded disabled:bg-gray-100" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 items-center">
                            <label className="text-sm font-medium text-gray-600">Marketing / Ads</label>
                            <input name="marketing_cost" type="number" step="0.01" defaultValue={initialSettings.marketing_cost} disabled={!isEditing} className="p-2 border rounded disabled:bg-gray-100" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 items-center">
                            <label className="text-sm font-medium text-gray-600">Impuestos</label>
                            <input name="taxes_cost" type="number" step="0.01" defaultValue={initialSettings.taxes_cost} disabled={!isEditing} className="p-2 border rounded disabled:bg-gray-100" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 items-center">
                            <label className="text-sm font-medium text-gray-600">Otros Gastos</label>
                            <input name="other_costs" type="number" step="0.01" defaultValue={initialSettings.other_costs} disabled={!isEditing} className="p-2 border rounded disabled:bg-gray-100" />
                        </div>
                    </CardContent>
                </Card>

                {/* Parámetros Operativos */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Parámetros Operativos</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 items-center">
                                <label className="text-sm font-medium text-gray-600">Días trabajados / mes</label>
                                <input name="work_days_per_month" type="number" defaultValue={initialSettings.work_days_per_month} disabled={!isEditing} className="p-2 border rounded disabled:bg-gray-100" />
                            </div>
                            <div className="grid grid-cols-2 gap-4 items-center">
                                <label className="text-sm font-medium text-gray-600">Promedio Ventas / día</label>
                                <input name="avg_sales_per_day" type="number" defaultValue={initialSettings.avg_sales_per_day} disabled={!isEditing} className="p-2 border rounded disabled:bg-gray-100" />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-purple-700 mb-2">💳 Comisión Tarjeta / Terminal (%)</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            name="card_commission_percent"
                                            type="number"
                                            step="0.01"
                                            defaultValue={initialSettings.card_commission_percent || 4.06}
                                            disabled={!isEditing}
                                            className="p-2 border rounded disabled:bg-gray-100 w-24 font-bold text-right"
                                        />
                                        <span className="text-gray-500">%</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">Este porcentaje se usará para calcular el precio sugerido con tarjeta.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-green-700 mb-2">📈 Margen de Ganancia por Defecto (%)</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            name="default_margin_percent"
                                            type="number"
                                            step="1"
                                            defaultValue={initialSettings.default_margin_percent || 30}
                                            disabled={!isEditing}
                                            className="p-2 border rounded disabled:bg-gray-100 w-24 font-bold text-right"
                                        />
                                        <span className="text-gray-500">%</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">Se usará automáticamente en recetas nuevas sin precio definido.</p>
                                </div>
                            </div>

                        </CardContent>
                    </Card>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
                        <p className="font-bold mb-1">ℹ️ ¿Cómo funciona?</p>
                        Estos valores se usarán para calcular el <strong>Costo Fijo Unitario</strong> en tus recetas, permitiéndote saber tu margen de ganancia real.
                    </div>
                </div>
            </div>

            {/* Campos ocultos de inventario para no perderlos al guardar finanzas */}
            <input type="hidden" name="default_min_stock" value={initialSettings.default_min_stock} />
            <input type="hidden" name="abc_days_b" value={JSON.stringify(initialSettings.abc_days_b || [1, 4])} />
            <input type="hidden" name="abc_days_c" value={JSON.stringify(initialSettings.abc_days_c || [0])} />
            <input type="hidden" name="stock_buffer_multiplier" value={initialSettings.stock_buffer_multiplier} />
        </form >
    )
}

function InventorySettingsForm({ initialSettings, supplies }: { initialSettings: FinancialSettings, supplies: Supply[] }) {
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)

    return (
        <>
            <form action={async (formData) => {
                setLoading(true)
                const res = await updateFinancialSettings(formData) // Reusamos la misma action por ahora
                setLoading(false)
                if (res?.error) alert('Error: ' + res.error)
                else {
                    alert('Configuración guardada')
                    setIsEditing(false)
                }
            }}>
                {/* Campos ocultos para mantener los valores financieros */}
                <input type="hidden" name="rent_cost" value={initialSettings.rent_cost} />
                <input type="hidden" name="salaries_cost" value={initialSettings.salaries_cost} />
                <input type="hidden" name="water_cost" value={initialSettings.water_cost} />
                <input type="hidden" name="electricity_cost" value={initialSettings.electricity_cost} />
                <input type="hidden" name="marketing_cost" value={initialSettings.marketing_cost} />
                <input type="hidden" name="taxes_cost" value={initialSettings.taxes_cost} />
                <input type="hidden" name="other_costs" value={initialSettings.other_costs} />
                <input type="hidden" name="work_days_per_month" value={initialSettings.work_days_per_month} />
                <input type="hidden" name="avg_sales_per_day" value={initialSettings.avg_sales_per_day} />
                <input type="hidden" name="avg_sales_per_day" value={initialSettings.avg_sales_per_day} />
                <input type="hidden" name="card_commission_percent" value={initialSettings.card_commission_percent} />
                <input type="hidden" name="default_margin_percent" value={initialSettings.default_margin_percent} />
                <input type="hidden" name="default_margin_percent" value={initialSettings.default_margin_percent} />
                {/* Los inputs de abc_days se manejan dentro del DaySelector, pero necesitamos asegurarnos de que se envíen si no se renderiza el form de inventario... 
                    Espera, este form ES el de inventario. El DaySelector debe generar el input hidden. 
                    Pero si estamos en Finance form, necesitamos los hidden inputs de inventory settings.
                */}

                <div className="flex justify-end mb-4">
                    {!isEditing ? (
                        <Button type="button" onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                            ✏️ Editar Inventario
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button type="button" onClick={() => setIsEditing(false)} variant="outline" className="text-gray-600">
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
                                {loading ? 'Guardando...' : '💾 Guardar Cambios'}
                            </Button>
                        </div>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Metas de Inventario</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="max-w-md">
                            <label className="block text-sm font-medium text-gray-600 mb-1">Stock Mínimo por Defecto</label>
                            <div className="flex gap-2">
                                <input name="default_min_stock" type="number" defaultValue={initialSettings.default_min_stock} disabled={!isEditing} className="p-2 border rounded flex-1 disabled:bg-gray-100" />
                                <span className="p-2 bg-gray-100 rounded text-gray-500">unidades</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Se usará cuando un insumo no tenga una meta específica definida.</p>
                        </div>

                        <div className="max-w-md">
                            <label className="block text-sm font-medium text-gray-600 mb-1">Factor de Stock Ideal (Buffer)</label>
                            <div className="flex gap-2 items-center">
                                <span className="text-gray-500 font-bold">x</span>
                                <input name="stock_buffer_multiplier" type="number" step="0.1" defaultValue={initialSettings.stock_buffer_multiplier || 2.0} disabled={!isEditing} className="p-2 border rounded flex-1 disabled:bg-gray-100" />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Multiplicador del Mínimo para determinar la compra ideal. (Ej. 2.0 = Doble del mínimo)</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Frecuencia de Conteo ABC</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Grupo B */}
                        <div>
                            <label className="block text-sm font-bold text-blue-800 mb-2">Grupo B (Bi-semanal)</label>
                            <p className="text-xs text-gray-500 mb-2">Selecciona los días que deben aparecer estos insumos.</p>
                            <DaySelector name="abc_days_b" initialDays={initialSettings.abc_days_b || [1, 4]} color="blue" disabled={!isEditing} />
                        </div>

                        {/* Grupo C */}
                        <div>
                            <label className="block text-sm font-bold text-green-800 mb-2">Grupo C (Semanal)</label>
                            <p className="text-xs text-gray-500 mb-2">Selecciona los días que deben aparecer estos insumos.</p>
                            <DaySelector name="abc_days_c" initialDays={initialSettings.abc_days_c || [0]} color="green" disabled={!isEditing} />
                        </div>
                    </CardContent>
                </Card>
            </form>

            <div className="mt-8">
                <CountingModeSettings supplies={supplies} />
            </div>
            <div className="mt-8">
                <ClassificationSettings supplies={supplies} />
            </div>
        </>
    )
}
