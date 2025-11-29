import { getSupplies } from './supplies/actions'
import { getV2Products } from './products/actions'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'

// Función para verificar si el precio está desactualizado (más de 30 días)
function isPriceOutdated(lastCheck?: string): boolean {
  if (!lastCheck) return true
  const daysSinceCheck = Math.floor((Date.now() - new Date(lastCheck).getTime()) / (1000 * 60 * 60 * 24))
  return daysSinceCheck > 30
}

export default async function AdminPage() {
  // Cargamos datos reales para mostrar estadísticas
  const [supplies, products] = await Promise.all([
    getSupplies(),
    getV2Products()
  ])

  // Cálculos rápidos
  const lowStockSupplies = supplies
    .filter(s => s.current_stock <= (s.min_stock || 5))
    .sort((a, b) => {
      const aRatio = a.current_stock / (a.min_stock || 5)
      const bRatio = b.current_stock / (b.min_stock || 5)
      return aRatio - bRatio
    })
    .slice(0, 5)

  const outdatedPrices = supplies.filter(s => isPriceOutdated(s.last_price_check))
  const activeProducts = products.length

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8">
      {/* Header */}
      <PageHeader
        title="Bienvenido al Panel 🛡️"
        description="Resumen operativo de Trailer Burger Hall."
      />

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tarjeta de Inventario - MEJORADA */}
        <Card className={lowStockSupplies.length > 0 ? 'border-[var(--color-error)] bg-red-50' : 'border-[var(--color-success)] bg-green-50'}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-sm font-medium opacity-80 uppercase tracking-wide">Alertas de Stock</CardTitle>
              <span className="text-2xl">📦</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-4xl font-bold ${lowStockSupplies.length > 0 ? 'text-[var(--color-error)]' : 'text-[var(--color-success)]'}`}>
              {lowStockSupplies.length}
            </div>
            <p className="text-sm mt-2 opacity-70">
              {lowStockSupplies.length > 0 ? 'Artículos requieren reabastecimiento urgente.' : 'Todo el inventario está saludable.'}
            </p>

            {/* Lista de insumos bajos */}
            {lowStockSupplies.length > 0 && (
              <div className="mt-4 space-y-2">
                {lowStockSupplies.map(supply => (
                  <Link
                    key={supply.id}
                    href="/supplies"
                    className="flex items-center justify-between p-2 bg-white/70 rounded hover:bg-white transition-colors text-sm"
                  >
                    <span className="font-medium text-gray-700 truncate">{supply.name}</span>
                    <Badge variant="error" className="ml-2 shrink-0">
                      {supply.current_stock} {supply.unit}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild className="w-full bg-white/50 hover:bg-white">
              <Link href="/supplies/shopping-list">Ver Lista de Compras →</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Tarjeta de Precios Desactualizados - NUEVA */}
        <Card className={outdatedPrices.length > 0 ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200'}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-sm font-medium opacity-80 uppercase tracking-wide">Precios a Verificar</CardTitle>
              <span className="text-2xl">⚠️</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-4xl font-bold ${outdatedPrices.length > 0 ? 'text-yellow-600' : 'text-gray-400'}`}>
              {outdatedPrices.length}
            </div>
            <p className="text-sm mt-2 opacity-70">
              {outdatedPrices.length > 0
                ? `${outdatedPrices.length} precio${outdatedPrices.length > 1 ? 's' : ''} sin verificar en 30+ días.`
                : 'Todos los precios están actualizados.'}
            </p>

            {/* Lista de precios desactualizados */}
            {outdatedPrices.length > 0 && (
              <div className="mt-4 space-y-2">
                {outdatedPrices.slice(0, 5).map(supply => {
                  const daysOld = supply.last_price_check
                    ? Math.floor((Date.now() - new Date(supply.last_price_check).getTime()) / (1000 * 60 * 60 * 24))
                    : 999
                  return (
                    <Link
                      key={supply.id}
                      href="/supplies"
                      className="flex items-center justify-between p-2 bg-white/70 rounded hover:bg-white transition-colors text-sm"
                    >
                      <span className="font-medium text-gray-700 truncate">{supply.name}</span>
                      <Badge variant="warning" className="ml-2 shrink-0">
                        {daysOld > 365 ? '+1 año' : `${daysOld}d`}
                      </Badge>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild className="w-full bg-white/50 hover:bg-white">
              <Link href="/supplies">Revisar Precios →</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Tarjeta de Menú */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wide">Productos Activos</CardTitle>
              <span className="text-2xl">🍔</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-[var(--color-secondary)]">{activeProducts}</div>
            <p className="text-sm text-gray-400 mt-2">
              Items disponibles en el menú digital V2.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" asChild className="w-full text-[var(--color-primary)] hover:text-[var(--color-primary)] hover:bg-orange-50">
              <Link href="/products">Gestionar Menú →</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Accesos Rápidos - AMPLIADOS */}
      <div>
        <h2 className="text-lg font-bold text-gray-700 mb-4">⚡ Accesos Rápidos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/supplies" className="group">
            <Card className="h-full hover:shadow-md transition-all duration-200 hover:border-[var(--color-primary)] cursor-pointer">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                  📊
                </div>
                <div>
                  <h3 className="font-bold text-[var(--color-secondary)]">Inventario General</h3>
                  <p className="text-sm text-gray-500">Ajustar stock, costos y proveedores.</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/supplies/count" className="group">
            <Card className="h-full hover:shadow-md transition-all duration-200 hover:border-green-500 cursor-pointer">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition">
                  ✅
                </div>
                <div>
                  <h3 className="font-bold text-[var(--color-secondary)]">Conteo Diario</h3>
                  <p className="text-sm text-gray-500">Registrar inventario físico.</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/supplies/history" className="group">
            <Card className="h-full hover:shadow-md transition-all duration-200 hover:border-purple-500 cursor-pointer">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition">
                  📜
                </div>
                <div>
                  <h3 className="font-bold text-[var(--color-secondary)]">Historial</h3>
                  <p className="text-sm text-gray-500">Ver movimientos de inventario.</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/products/new" className="group">
            <Card className="h-full hover:shadow-md transition-all duration-200 hover:border-[var(--color-primary)] cursor-pointer">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-white transition">
                  ✨
                </div>
                <div>
                  <h3 className="font-bold text-[var(--color-secondary)]">Nuevo Producto</h3>
                  <p className="text-sm text-gray-500">Crear hamburguesa o extra.</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/team" className="group">
            <Card className="h-full hover:shadow-md transition-all duration-200 hover:border-blue-500 cursor-pointer">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                  👥
                </div>
                <div>
                  <h3 className="font-bold text-[var(--color-secondary)]">Equipo</h3>
                  <p className="text-sm text-gray-500">Gestionar usuarios y roles.</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/supplies/shopping-list" className="group">
            <Card className="h-full hover:shadow-md transition-all duration-200 hover:border-red-500 cursor-pointer">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition">
                  🛒
                </div>
                <div>
                  <h3 className="font-bold text-[var(--color-secondary)]">Lista de Compras</h3>
                  <p className="text-sm text-gray-500">Insumos a reabastecer.</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}