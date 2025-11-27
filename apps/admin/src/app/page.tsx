import { getSupplies } from './supplies/actions'
import { getV2Products } from './products/actions'
import Link from 'next/link'

export default async function AdminPage() {
  // Cargamos datos reales para mostrar estadísticas
  const [supplies, products] = await Promise.all([
    getSupplies(),
    getV2Products()
  ])

  // Cálculos rápidos
  const lowStockCount = supplies.filter(s => s.current_stock <= (s.min_stock || 5)).length
  const activeProducts = products.length

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bienvenido al Panel 🛡️</h1>
        <p className="text-gray-500">Resumen operativo de Trailer Burger Hall.</p>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tarjeta de Inventario */}
        <div className={`p-6 rounded-xl border shadow-sm ${lowStockCount > 0 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium opacity-80 uppercase tracking-wide">Alertas de Stock</p>
              <h2 className={`text-4xl font-bold mt-2 ${lowStockCount > 0 ? 'text-red-700' : 'text-green-700'}`}>
                {lowStockCount}
              </h2>
            </div>
            <span className="text-2xl">📦</span>
          </div>
          <p className="text-sm mt-4 opacity-70">
            {lowStockCount > 0 ? 'Artículos requieren reabastecimiento urgente.' : 'Todo el inventario está saludable.'}
          </p>
          <div className="mt-4">
             <Link href="/supplies/shopping-list" className="text-sm font-bold underline hover:opacity-80">
                Ver Lista de Compras →
             </Link>
          </div>
        </div>

        {/* Tarjeta de Menú */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
           <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Productos Activos</p>
              <h2 className="text-4xl font-bold text-gray-900 mt-2">{activeProducts}</h2>
            </div>
            <span className="text-2xl">🍔</span>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            Items disponibles en el menú digital V2.
          </p>
          <div className="mt-4">
             <Link href="/products" className="text-sm font-bold text-orange-600 hover:text-orange-700">
                Gestionar Menú →
             </Link>
          </div>
        </div>

        {/* Tarjeta de Equipo */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
           <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Equipo</p>
              <h2 className="text-4xl font-bold text-gray-900 mt-2">Staff</h2>
            </div>
            <span className="text-2xl">👥</span>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            Gestionar accesos y roles de usuarios.
          </p>
          <div className="mt-4">
             <Link href="/team" className="text-sm font-bold text-blue-600 hover:text-blue-700">
                Ver Usuarios →
             </Link>
          </div>
        </div>
      </div>

      {/* Accesos Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link 
            href="/supplies" 
            className="flex items-center gap-4 p-6 bg-white border border-gray-200 rounded-xl hover:shadow-md transition group"
        >
            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                📊
            </div>
            <div>
                <h3 className="font-bold text-gray-900">Inventario General</h3>
                <p className="text-sm text-gray-500">Ajustar stock, costos y proveedores.</p>
            </div>
        </Link>
        
        <Link 
            href="/products/new" 
            className="flex items-center gap-4 p-6 bg-white border border-gray-200 rounded-xl hover:shadow-md transition group"
        >
            <div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition">
                ✨
            </div>
            <div>
                <h3 className="font-bold text-gray-900">Nuevo Producto</h3>
                <p className="text-sm text-gray-500">Crear una nueva hamburguesa o extra.</p>
            </div>
        </Link>
      </div>
    </div>
  )
}