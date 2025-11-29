// apps/admin/src/app/products/page.tsx
import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getV2Products } from './actions'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { PageHeader } from '@/components/ui/PageHeader'
import { DeleteProductButton } from './DeleteProductButton'

export default async function ProductsV2Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const products = await getV2Products()

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <PageHeader
        title="Menú"
        description="Vista previa de los productos registrados."
      >
        <Button asChild>
          <Link href="/products/new">
            + Nuevo Producto
          </Link>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="flex flex-col hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 bg-gray-50/50 border-b border-gray-100">
              <div className="flex justify-between items-start gap-2">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <Badge variant="secondary" className="uppercase text-[10px] tracking-wider">
                    {product.category.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-7 text-xs bg-white" asChild>
                    <Link href={`/products/${product.id}`}>
                      Editar ✏️
                    </Link>
                  </Button>
                  <DeleteProductButton productId={product.id} productName={product.name} />
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 py-4 space-y-4">
              {/* Variantes */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Variantes & Precios</p>
                <div className="space-y-1">
                  {product.variants?.sort((a, b) => a.price - b.price).map(v => (
                    <div key={v.id} className="flex justify-between text-sm">
                      <span className="capitalize text-gray-700">{v.name}</span>
                      <span className="font-bold text-[var(--color-secondary)]">${v.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modificadores */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Extras / Sabores</p>
                <div className="flex flex-wrap gap-1.5">
                  {product.allowed_modifiers?.slice(0, 6).map(link => (
                    <Badge
                      key={link.modifier_id}
                      variant={link.is_default ? 'success' : 'outline'}
                      className="font-normal"
                    >
                      {link.modifier?.name}
                    </Badge>
                  ))}
                  {(product.allowed_modifiers?.length || 0) > 6 && (
                    <span className="text-xs text-gray-400 px-1 self-center">...</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}