// apps/admin/src/app/supplies/production-checklist/page.tsx
import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { Supply } from '@trailer/shared'
import Link from 'next/link'
import { QuickProduction } from './QuickProduction'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { getFinancialSettings } from '@/app/settings/actions'

export default async function ProductionChecklistPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // 1. Traemos TODOS los insumos
    const { data } = await supabase
        .from('supplies')
        .select('*')
        .order('name')

    const supplies = (data as Supply[]) || []

    // 1.5 Traemos settings para el multiplicador de buffer
    const settings = await getFinancialSettings()
    const bufferMultiplier = settings.stock_buffer_multiplier || 2.0

    // 2. Traemos logs de producción DE HOY (Zona Horaria México)
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' })
    const { data: logs } = await supabase
        .from('inventory_logs')
        .select('supply_id, entries')
        .eq('date', today)
        .gt('entries', 0)

    // Set de IDs producidos hoy
    const producedTodayIds = new Set(logs?.map(log => log.supply_id) || [])

    // 3. FILTRADO INTELIGENTE:
    // - Solo producción
    // - Stock bajo (< min_stock * bufferMultiplier)
    // - NO producido hoy
    const productionChecklist = supplies.filter(item => {
        // Solo producción
        if (item.supply_type !== 'production') return false

        const min = item.min_stock ?? 5
        const target = min * bufferMultiplier

        // Si el stock actual es menor a la meta + buffer
        const needsProduction = item.current_stock < target
        const isProducedToday = producedTodayIds.has(item.id)

        return needsProduction && !isProducedToday
    })

    // Lista de lo producido hoy (para referencia)
    const producedList = supplies.filter(item =>
        item.supply_type === 'production' && producedTodayIds.has(item.id)
    )

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
            <PageHeader
                title="Lista de Producción 👩‍🍳"
                description={`Recetas a preparar (Meta: x${bufferMultiplier} del mínimo).`}
            >
                <Button variant="ghost" asChild>
                    <Link href="/production/production-list">
                        ← Recetas
                    </Link>
                </Button>
            </PageHeader>

            {productionChecklist.length === 0 ? (
                <Card className="bg-[#f0fdf4] border-[#bbf7d0]">
                    <CardContent className="p-10 text-center">
                        <div className="text-4xl mb-4">🎉</div>
                        <h2 className="text-xl font-bold text-[#15803d] mb-2">¡Todo listo!</h2>
                        <p className="text-[#166534]">No hay recetas urgentes por preparar hoy.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4 sm:space-y-6">
                    {/* Summary Card Compacted */}
                    <Card className="bg-purple-50 border-purple-300 shadow-md">
                        <CardContent className="p-4 sm:p-6 flex flex-row justify-between items-center gap-4">
                            <div>
                                <span className="block text-[10px] sm:text-sm font-display text-purple-900/60 uppercase tracking-widest font-bold">Recetas</span>
                                <span className="text-2xl sm:text-3xl font-bold text-purple-700">{productionChecklist.length}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-3 sm:space-y-4">
                        {productionChecklist.map((item) => {
                            // Calculamos cuánto falta para la meta
                            const min = item.min_stock || 0
                            const target = min * bufferMultiplier
                            const missing = target - item.current_stock

                            const isCritical = item.current_stock <= min

                            return (
                                <Card key={item.id} className={`overflow-hidden hover:shadow-md transition-shadow ${isCritical ? 'border-purple-300 bg-purple-50/50' : 'border-[#e5e0d4]'}`}>
                                    <CardContent className="p-4 flex flex-col gap-4">
                                        {/* Header: Nombre */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-8 w-1 rounded-full flex-shrink-0 ${isCritical ? 'bg-purple-600' : 'bg-purple-400'}`} />
                                                <div>
                                                    <div className="font-bold text-[var(--color-secondary)] text-lg leading-tight">{item.name}</div>
                                                    <div className="text-xs text-[#3b1f1a]/50 font-bold uppercase tracking-wider mt-1">
                                                        {item.category || 'General'} • Rendimiento: {item.yield_quantity} {item.unit}
                                                        {item.quantity_per_package && item.purchase_unit && (
                                                            <span className="text-blue-600"> (≈{(item.yield_quantity! / item.quantity_per_package).toFixed(2)} {item.purchase_unit})</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-xs text-purple-600 font-bold uppercase">A Producir</span>
                                                <span className="text-2xl font-bold text-purple-700">{missing > 0 ? missing.toFixed(1) : 0} <span className="text-sm text-gray-400">{item.unit}</span></span>
                                                {item.quantity_per_package && item.purchase_unit && missing > 0 && (
                                                    <div className="text-xs text-blue-600 font-bold mt-1">
                                                        ≈ {(missing / item.quantity_per_package).toFixed(2)} {item.purchase_unit}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Info de Stock */}
                                        <div className="bg-[#fcfbf9] p-3 rounded-lg border border-[#e5e0d4] flex flex-col sm:flex-row gap-2 justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-[#3b1f1a]/70">Stock Actual:</span>
                                                <span className={`font-bold px-2 py-0.5 rounded text-sm border ${isCritical ? 'text-red-700 bg-red-100 border-red-200' : 'text-purple-700 bg-purple-50 border-purple-200'}`}>
                                                    {item.current_stock.toFixed(2)} {item.unit}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-[#3b1f1a]/50 font-bold uppercase">Meta Stock:</span>
                                                <span className="font-bold text-[#3b1f1a] text-sm">{target.toFixed(1)} {item.unit} <span className="text-[10px] font-normal text-gray-400">(x{bufferMultiplier})</span></span>
                                            </div>
                                        </div>

                                        {/* Footer: Acción de Producción */}
                                        <div className="w-full">
                                            <QuickProduction
                                                id={item.id}
                                                name={item.name}
                                                missingAmount={missing > 0 ? missing : 0}
                                                unit={item.unit}
                                                yieldQuantity={item.yield_quantity || 1}
                                                quantityPerPackage={item.quantity_per_package}
                                                purchaseUnit={item.purchase_unit}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Sección de Producido Hoy */}
            {producedList.length > 0 && (
                <div className="mt-12 pt-8 border-t border-[#e5e0d4]">
                    <h3 className="text-sm font-bold text-[#3b1f1a]/50 uppercase tracking-widest mb-6">✅ Producido Hoy (Oculto de la lista)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-75">
                        {producedList.map(item => (
                            <div key={item.id} className="bg-[#fcfbf9] p-3 rounded-lg border border-[#e5e0d4] flex items-center justify-between shadow-sm">
                                <span className="font-medium text-[#3b1f1a] text-sm">{item.name}</span>
                                <Badge variant="success" className="text-[10px]">
                                    Stock: {item.current_stock}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
