// apps/admin/src/app/products/page.tsx
import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import Link from 'next/link' // 👈 Importante: Importar Link
import { getV2Products } from './actions'

export default async function ProductsV2Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const products = await getV2Products()

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Catálogo Unificado (V2) 🚀</h1>
          <p className="text-gray-500">Vista previa de la nueva estructura migrada.</p>
        </div>
        {/* Botón para crear nuevos (Próximamente) */}
        <Link 
          href="/products/new"
          className="bg-orange-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-orange-700 transition shadow-sm flex items-center gap-2"
        >
          + Nuevo Producto
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition">
            {/* Header del Producto */}
            <div className="p-4 bg-gray-50 border-b flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-gray-900">{product.name}</h3>
                <span className="text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {product.category.replace('_', ' ')}
                </span>
              </div>
              
              {/* 👇 AQUÍ ESTÁ EL BOTÓN QUE FALTABA */}
              <Link 
                href={`/products/${product.id}`}
                className="text-xs font-bold bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition"
              >
                Editar ✏️
              </Link>
            </div>

            {/* Variantes (Precios) */}
            <div className="p-4 border-b border-dashed">
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">Variantes & Precios</p>
              <div className="space-y-1">
                {product.variants?.sort((a,b) => a.price - b.price).map(v => (
                  <div key={v.id} className="flex justify-between text-sm">
                    <span className="capitalize text-gray-700">{v.name}</span>
                    <span className="font-bold text-gray-900">${v.price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modificadores Permitidos */}
            <div className="p-4 flex-1 bg-gray-50/50">
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">Extras / Sabores</p>
              <div className="flex flex-wrap gap-1">
                {product.allowed_modifiers?.slice(0, 6).map(link => ( // Limitamos a 6 para no saturar la tarjeta
                  <span 
                    key={link.modifier_id} 
                    className={`text-xs px-2 py-1 rounded border ${
                      link.is_default 
                        ? 'bg-green-100 border-green-200 text-green-800 font-bold' 
                        : 'bg-white border-gray-200 text-gray-600'
                    }`}
                  >
                    {link.modifier?.name}
                  </span>
                ))}
                {(product.allowed_modifiers?.length || 0) > 6 && (
                  <span className="text-xs text-gray-400 px-1">...</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}