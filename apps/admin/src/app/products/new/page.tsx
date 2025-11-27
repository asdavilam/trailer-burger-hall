// apps/admin/src/app/products/new/page.tsx
import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createProduct } from '../actions'

export default async function NewProductPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const handleCreate = async (formData: FormData) => {
        'use server'
        const result = await createProduct(formData)
        // If there's an error, the redirect won't happen
        // We could handle the error here if needed
        if (result && 'error' in result) {
            console.error('Error creating product:', result.error)
            // You could also throw an error here to show it to the user
        }
    }

    return (
        <div className="max-w-2xl mx-auto py-10 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Nuevo Producto ✨</h1>
                <p className="text-gray-500">Comencemos con lo básico.</p>
            </div>

            <form action={handleCreate} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nombre del Producto</label>
                    <input
                        name="name"
                        type="text"
                        required
                        placeholder="Ej: Alitas BBQ, Hot Dog Especial..."
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none font-lg"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Categoría</label>
                    <select name="category" required className="w-full p-3 border rounded-lg bg-white">
                        <option value="protein_base">Proteína (Base de Burger)</option>
                        <option value="special">Especial</option>
                        <option value="side">Acompañamiento / Entrada</option>
                        <option value="drink">Bebida</option>
                        <option value="extra">Extra Suelto</option>
                    </select>
                    <p className="text-xs text-gray-400 mt-2">
                        * Esto define dónde aparecerá en el menú.
                    </p>
                </div>

                <div className="pt-4 flex gap-4">
                    <Link
                        href="/products"
                        className="px-6 py-3 rounded-lg font-bold text-gray-600 hover:bg-gray-100 transition text-center"
                    >
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        className="flex-1 bg-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-700 transition shadow-lg"
                    >
                        Crear y Configurar →
                    </button>
                </div>

            </form>
        </div>
    )
}