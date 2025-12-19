// apps/admin/src/app/supplies/shopping-list/page.tsx
import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { Supply } from '@trailer/shared'
import Link from 'next/link'
import { QuickPurchase } from './QuickPurchase'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { getFinancialSettings } from '@/app/settings/actions'

export default async function ShoppingListPage() {
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

  // 2. Traemos logs de compras DE HOY (Zona Horaria México)
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' })
  const { data: logs } = await supabase
    .from('inventory_logs')
    .select('supply_id, entries')
    .eq('date', today)
    .gt('entries', 0)

  // Set de IDs comprados hoy
  const purchasedTodayIds = new Set(logs?.map(log => log.supply_id) || [])

  // 3. FILTRADO INTELIGENTE:
  // - Stock bajo (<= min_stock)
  // - NO comprado hoy
  const shoppingList = supplies.filter(item => {
    const min = item.min_stock ?? 5
    const isLowStock = item.current_stock <= min
    const isPurchasedToday = purchasedTodayIds.has(item.id)
    return isLowStock && !isPurchasedToday
  })

  // Lista de lo comprado hoy (para referencia)
  const purchasedList = supplies.filter(item => purchasedTodayIds.has(item.id))

  // Calcular costo estimado total
  const totalCost = shoppingList.reduce((acc, item) => {
    // Calcular meta usando el multiplicador configurado (default x2)
    const target = (item.min_stock || 5) * bufferMultiplier
    const missing = target - item.current_stock
    const cost = missing > 0 ? missing * item.cost_per_unit : 0
    return acc + cost
  }, 0)

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <PageHeader
        title="Lista de Compras 🛒"
        description={`Insumos a reponer (Meta: x${bufferMultiplier} del mínimo).`}
      >
        <Button variant="ghost" asChild>
          <Link href="/supplies">
            ← Inventario
          </Link>
        </Button>
      </PageHeader>

      {shoppingList.length === 0 ? (
        <Card className="bg-[#f0fdf4] border-[#bbf7d0]">
          <CardContent className="p-10 text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-xl font-bold text-[#15803d] mb-2">¡Todo en orden!</h2>
            <p className="text-[#166534]">No hay insumos urgentes por comprar hoy.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {/* Summary Card Compacted */}
          <Card className="bg-[#fff9f2] border-[#c08a3e]/30 shadow-md">
            <CardContent className="p-4 sm:p-6 flex flex-row justify-between items-center gap-4">
              <div>
                <span className="block text-[10px] sm:text-sm font-display text-[#3b1f1a]/60 uppercase tracking-widest font-bold">Artículos</span>
                <span className="text-2xl sm:text-3xl font-bold text-[#c08a3e]">{shoppingList.length}</span>
              </div>
              <div className="text-right">
                <span className="block text-[10px] sm:text-sm font-display text-[#3b1f1a]/60 uppercase tracking-widest font-bold">Total Est.</span>
                <span className="text-xl sm:text-2xl font-bold text-[#3b1f1a]">${totalCost.toFixed(0)}</span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3 sm:space-y-4">
            {shoppingList.map((item) => {
              // Calculamos cuánto falta para la meta (usando multiplicador)
              const target = (item.min_stock || 5) * bufferMultiplier
              const missing = target - item.current_stock

              return (
                <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow border-[#e5e0d4]">
                  <CardContent className="p-4 flex flex-col gap-4">
                    {/* Header: Nombre y Proveedor */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-1 rounded-full bg-[var(--color-error)] flex-shrink-0" />
                        <div>
                          <div className="font-bold text-[var(--color-secondary)] text-lg leading-tight">{item.name}</div>
                          <div className="text-xs text-[#3b1f1a]/50 font-bold uppercase tracking-wider mt-1">
                            {item.provider || 'Genérico'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Info de Stock (Middle Row) */}
                    <div className="bg-[#fcfbf9] p-3 rounded-lg border border-[#e5e0d4] flex flex-col sm:flex-row gap-2 justify-between items-center">
                      {(() => {
                        const pkgSize = item.quantity_per_package
                        const pkgName = item.purchase_unit
                        const isPkg = (pkgSize && pkgSize > 1) || (pkgSize === 1 && !!pkgName)

                        // Logic: Always show base unit for "Stock" (User Request)
                        // Button shows Presentation (handled in QuickPurchase)
                        const currentDisplay = `${item.current_stock} ${item.unit}`

                        // Meta shows packages if applicable, to help with purchasing decision.
                        // We keep it as is.
                        const targetDisplay = isPkg ? (target / pkgSize!).toFixed(1) : target.toFixed(1)

                        return (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-[#3b1f1a]/70">Tienes:</span>
                              <span className="font-bold text-[#9f1239] bg-[#fff1f2] px-2 py-0.5 rounded text-sm border border-[#fecdd3]">
                                {currentDisplay}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[#3b1f1a]/50 font-bold uppercase">Meta:</span>
                              <span className="font-bold text-[#3b1f1a] text-sm">{targetDisplay} <span className="text-[10px] font-normal text-gray-400">({isPkg ? (pkgName || 'Paq') : item.unit} x{bufferMultiplier})</span></span>
                            </div>
                          </>
                        )
                      })()}
                    </div>

                    {/* Footer: Acción de Compra */}
                    <div className="w-full">
                      <QuickPurchase
                        id={item.id}
                        missingAmount={missing > 0 ? missing : 0}
                        unit={item.unit}
                        packageSize={item.quantity_per_package}
                        packageUnitDescription={item.purchase_unit}
                      />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Botón de imprimir simulado */}
      {shoppingList.length > 0 && (
        <div className="mt-8 flex justify-end">
          <Button variant="secondary" className="gap-2">
            <span>🖨️</span> Imprimir Lista
          </Button>
        </div>
      )}

      {/* Sección de Comprado Hoy */}
      {purchasedList.length > 0 && (
        <div className="mt-12 pt-8 border-t border-[#e5e0d4]">
          <h3 className="text-sm font-bold text-[#3b1f1a]/50 uppercase tracking-widest mb-6">✅ Comprado Hoy (Oculto de la lista)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-75">
            {purchasedList.map(item => (
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