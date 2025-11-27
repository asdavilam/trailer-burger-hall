import { createClient } from '@/lib/supabase'
import { notFound, redirect } from 'next/navigation'
import { getProductFull, getAllModifiers } from '../actions'
import { BasicInfoForm } from './BasicInfoForm'
import { VariantsTable } from './VariantsTable'
import { ModifiersSelector } from './ModifiersSelector'
import Link from 'next/link'

export default async function ProductEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  // Auth Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Cargar datos
  const [product, allModifiers] = await Promise.all([
    getProductFull(id),
    getAllModifiers()
  ])

  if (!product) notFound()

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Editando: {product.name}</h1>
        <Link href="/products" className="text-sm text-gray-500 hover:underline">← Volver al catálogo</Link>
      </div>

      {/* 1. Datos Básicos */}
      <BasicInfoForm product={product} />

      {/* 2. Variantes (Precios) */}
      <VariantsTable variants={product.variants || []} />

      {/* 3. Modificadores */}
      <ModifiersSelector product={product} allModifiers={allModifiers} />
    </div>
  )
}