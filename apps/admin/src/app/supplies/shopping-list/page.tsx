// apps/admin/src/app/supplies/shopping-list/page.tsx
import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { Supply } from '@trailer/shared'
import Link from 'next/link'
import { QuickPurchase } from './QuickPurchase' // 👈 Importamos el componente cliente

export default async function ShoppingListPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Traemos TODOS los insumos
  const { data } = await supabase
    .from('supplies')
    .select('*')
    .order('name')

  const supplies = (data as Supply[]) || []

  // FILTRADO INTELIGENTE:
  // Solo mostramos lo que está por debajo o igual al stock mínimo
  const shoppingList = supplies.filter(item => {
    const min = item.min_stock ?? 5 // Si es null, asumimos 5
    return item.current_stock <= min
  })

  // Calcular costo estimado total
  const totalCost = shoppingList.reduce((acc, item) => {
    const missing = (item.min_stock || 5) * 2 - item.current_stock // Meta: llegar al doble del mínimo
    const cost = missing > 0 ? missing * item.cost_per_unit : 0
    return acc + cost
  }, 0)

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lista de Compras 🛒</h1>
          <p className="text-gray-500">Insumos con stock crítico que necesitas reponer.</p>
        </div>
        <Link href="/supplies" className="text-sm text-gray-600 hover:underline">
          ← Volver al Inventario
        </Link>
      </div>

      {shoppingList.length === 0 ? (
        <div className="p-10 bg-green-50 border border-green-200 rounded-xl text-center text-green-800">
          🎉 ¡Todo está en orden! No hay nada urgente que comprar.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-4 bg-yellow-50 border-b border-yellow-100 flex justify-between">
            <span className="font-bold text-yellow-800">Artículos a comprar: {shoppingList.length}</span>
            {/* Dato curioso opcional */}
            <span className="text-sm text-yellow-700">Costo est. para reponer: ${totalCost.toFixed(2)}</span>
          </div>
          
          <ul className="divide-y divide-gray-100">
            {shoppingList.map((item) => {
              // Calculamos cuánto falta para la meta (doble del mínimo)
              const missing = (item.min_stock || 5) * 2 - item.current_stock
              
              return (
                <li key={item.id} className="p-4 flex flex-col sm:flex-row items-center justify-between hover:bg-gray-50 gap-4">
                  {/* Info del producto */}
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                    <div>
                      <div className="font-bold text-gray-900 text-lg">{item.name}</div>
                      <div className="text-sm text-gray-500">
                        Tienes: <span className="font-bold text-red-600">{item.current_stock} {item.unit}</span> 
                        {' '}/ Meta: {(item.min_stock || 5) * 2}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                         Prov: {item.provider || 'Genérico'}
                      </div>
                    </div>
                  </div>

                  {/* Sección de Acción (Compra Rápida) */}
                  <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg border border-gray-100 w-full sm:w-auto justify-between sm:justify-end">
                      <span className="text-xs font-bold text-gray-400 uppercase hidden sm:block">Ingreso Rápido:</span>
                      
                      {/* 👇 Aquí integramos el componente cliente */}
                      <QuickPurchase 
                        id={item.id} 
                        missingAmount={missing > 0 ? missing : 0} 
                        unit={item.unit} 
                      />
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
      
      {/* Botón de imprimir simulado */}
      <div className="mt-6 text-right">
        <button 
          className="bg-gray-800 text-white px-6 py-3 rounded-lg font-bold hover:bg-black transition flex items-center gap-2 ml-auto"
        >
          🖨️ Imprimir Lista
        </button>
      </div>
    </div>
  )
}