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
            ← Volver al Inventario
          </Link>
        </Button>
      </PageHeader>

      {shoppingList.length === 0 ? (
        <div className="p-10 bg-green-50 border border-green-200 rounded-xl text-center text-green-800">
          🎉 ¡Todo está en orden! No hay nada urgente que comprar.
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="bg-yellow-50 border-yellow-100">
            <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-center gap-2">
              <span className="font-bold text-yellow-800">Artículos a comprar: {shoppingList.length}</span>
              <span className="text-sm text-yellow-700">Costo est. para reponer: ${totalCost.toFixed(2)}</span>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {shoppingList.map((item) => {
              // Calculamos cuánto falta para la meta (usando multiplicador)
              const target = (item.min_stock || 5) * bufferMultiplier
              const missing = target - item.current_stock

              return (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Info del producto */}
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="h-3 w-3 rounded-full bg-[var(--color-error)] animate-pulse flex-shrink-0" />
                      <div>
                        <div className="font-bold text-[var(--color-secondary)] text-lg">{item.name}</div>
                        <div className="text-sm text-gray-500">
                          Tienes: <span className="font-bold text-[var(--color-error)]">{item.current_stock} {item.unit}</span>
                          {' '}/ Meta: {target.toFixed(1)} <span className="text-xs text-gray-400">(x{bufferMultiplier})</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Prov: {item.provider || 'Genérico'}
                        </div>
                      </div>
                    </div>

                    {/* Sección de Acción (Compra Rápida) */}
                    <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg border border-gray-100 w-full sm:w-auto justify-between sm:justify-end">
                      <span className="text-xs font-bold text-gray-400 uppercase hidden sm:block">Ingreso Rápido:</span>

                      <QuickPurchase
                        id={item.id}
                        missingAmount={missing > 0 ? missing : 0}
                        unit={item.unit}
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
        <div className="mt-6 flex justify-end">
          <Button className="bg-gray-800 hover:bg-black text-white">
            🖨️ Imprimir Lista
          </Button>
        </div>
      )}

      {/* Sección de Comprado Hoy */}
      {purchasedList.length > 0 && (
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-bold text-gray-500 mb-4">✅ Comprado Hoy (Oculto de la lista)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-75">
            {purchasedList.map(item => (
              <div key={item.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-center justify-between">
                <span className="font-medium text-gray-700">{item.name}</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Stock: {item.current_stock} {item.unit}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}