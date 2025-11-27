import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getFullRecipesReport } from '../actions'

export default async function RecipesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const products = await getFullRecipesReport()

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recetario & Costos 👨‍🍳</h1>
          <p className="text-gray-500">
            Vista general de ingredientes y costos teóricos por producto.
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
                Editar Producto →
              </Link>
            </div>

            {/* Lista de Variantes (Tamaños) */}
            <div className="divide-y divide-gray-100">
              {product.variants?.map((variant: any) => {
                
                // 1. Calcular Costo Total de esta variante
                const totalCost = variant.ingredients?.reduce((acc: number, ing: any) => {
                  const unitCost = ing.supply?.cost_per_unit || 0
                  return acc + (unitCost * ing.quantity)
                }, 0) || 0

                // 2. Calcular Utilidad Bruta (Precio Venta - Costo Insumos)
                const grossProfit = variant.price - totalCost
                const marginPercent = variant.price > 0 ? (grossProfit / variant.price) * 100 : 0

                const hasRecipe = variant.ingredients && variant.ingredients.length > 0

                return (
                  <div key={variant.id} className="p-6 flex flex-col md:flex-row gap-6">
                    {/* Columna Izquierda: Info General */}
                    <div className="md:w-1/4 min-w-[200px]">
                      <h3 className="text-lg font-bold capitalize text-gray-800">{variant.name}</h3>
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Precio Venta:</span>
                          <span className="font-medium text-gray-900">${variant.price.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Costo Insumos:</span>
                          <span className={`font-bold ${totalCost > variant.price ? 'text-red-600' : 'text-gray-700'}`}>
                            ${totalCost.toFixed(2)}
                          </span>
                        </div>
                        <div className="pt-2 border-t mt-2">
                           <div className="flex justify-between text-xs uppercase font-bold text-gray-400">
                              Margen Est.
                           </div>
                           <div className={`text-xl font-bold ${marginPercent < 30 ? 'text-red-500' : 'text-green-600'}`}>
                              {marginPercent.toFixed(0)}%
                           </div>
                        </div>
                      </div>
                    </div>

                    {/* Columna Derecha: Tabla de Ingredientes */}
                    <div className="flex-1 bg-gray-50/50 rounded-lg p-4 border border-gray-100">
                      {!hasRecipe ? (
                        <div className="h-full flex flex-col items-center justify-center text-center py-4">
                            <span className="text-4xl mb-2">⚠️</span>
                            <p className="text-gray-500 font-medium">Sin receta definida</p>
                            <p className="text-xs text-gray-400 mb-3">Este producto no descuenta inventario.</p>
                            <Link href={`/products/${product.id}`} className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded hover:bg-orange-200 transition">
                                + Agregar Receta
                            </Link>
                        </div>
                      ) : (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-xs font-bold text-gray-400 uppercase border-b border-gray-200">
                              <th className="pb-2">Insumo</th>
                              <th className="pb-2 text-right">Cant.</th>
                              <th className="pb-2 text-right">Costo</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100/50">
                            {variant.ingredients.map((ing: any) => (
                              <tr key={ing.id}>
                                <td className="py-2 pr-2 text-gray-700">{ing.supply?.name}</td>
                                <td className="py-2 px-2 text-right font-mono text-gray-500">
                                  {ing.quantity} <span className="text-[10px]">{ing.supply?.unit}</span>
                                </td>
                                <td className="py-2 pl-2 text-right text-gray-400">
                                  ${((ing.supply?.cost_per_unit || 0) * ing.quantity).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}