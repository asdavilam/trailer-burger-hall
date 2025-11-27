'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { LogoutBtn } from './LogoutBtn'

// Definición de las sub-rutas de inventario para reutilizar
const inventorySubItems = [
    { label: 'General', href: '/supplies', exact: true },
    { label: 'Compras', href: '/supplies/shopping-list' },
    { label: 'Asignaciones', href: '/supplies/assignments' },
    { label: 'Historial', href: '/supplies/history' },
    { label: 'Conteo', href: '/supplies/count' },
]

type NavItem = {
  label: string
  href?: string
  children?: { label: string; href: string }[]
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/' },
  { 
    label: 'Catálogo & Menú', 
    // Ahora hacemos dropdown aquí también para incluir Recetario
    children: [
        { label: 'Productos (Menú)', href: '/products' },
        { label: 'Recetario & Costos', href: '/products/recipes' }, // 👈 NUEVO
    ]
  },
  { 
    label: 'Inventario', 
    href: '/supplies', // En móvil sirve para activar el contexto
    children: inventorySubItems 
  },
  { label: 'Equipo', href: '/team' },
]

export function AdminNav() {
  const pathname = usePathname()
  
  if (pathname === '/login') return null

  // Detectar si estamos dentro de la sección Inventario
  const isInventorySection = pathname.startsWith('/supplies')

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo y Escritorio (Sin cambios) */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                TBH Admin
              </span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <NavEntry key={item.label} item={item} pathname={pathname} />
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <LogoutBtn />
          </div>
        </div>
      </div>

      {/* --- MÓVIL: SISTEMA DE DOBLE BARRA --- */}
      <div className="sm:hidden flex flex-col bg-white border-t border-gray-200">
         
         {/* NIVEL 1: Secciones Principales */}
         <div className="flex overflow-x-auto p-2 gap-2 no-scrollbar items-center">
             {navItems.map(item => {
                // Lógica de activo: Coincidencia exacta o parcial (para inventario)
                const isActive = item.href === '/' 
                    ? pathname === '/' 
                    : pathname.startsWith(item.href || '###')

                return (
                    <Link 
                        key={item.label} 
                        href={item.children ? item.children[0].href : item.href!} // Si tiene hijos, ir al primero
                        className={`text-sm font-bold whitespace-nowrap px-4 py-2 rounded-full transition-colors ${
                            isActive 
                                ? 'bg-gray-900 text-white shadow-md' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        {item.label}
                    </Link>
                )
             })}
         </div>

         {/* NIVEL 2: Sub-menú de Inventario (Solo aparece si estás en Inventario) */}
         {isInventorySection && (
            <div className="flex overflow-x-auto p-2 gap-2 bg-orange-50 border-t border-orange-100 no-scrollbar shadow-inner">
                {inventorySubItems.map(subItem => {
                    const isActive = subItem.exact 
                        ? pathname === subItem.href
                        : pathname.startsWith(subItem.href)

                    return (
                        <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={`text-xs font-medium whitespace-nowrap px-3 py-1.5 rounded-lg border transition-all ${
                                isActive
                                    ? 'bg-orange-600 border-orange-600 text-white shadow-sm'
                                    : 'bg-white border-orange-200 text-orange-800 hover:bg-orange-100'
                            }`}
                        >
                            {subItem.label}
                        </Link>
                    )
                })}
            </div>
         )}
      </div>
    </nav>
  )
}

// Sub-componente Desktop (Sin cambios mayores, solo tipado)
function NavEntry({ item, pathname }: { item: NavItem; pathname: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const isActive = item.href 
        ? pathname === item.href || (item.children && pathname.startsWith(item.href))
        : false

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    if (!item.children) {
        return (
            <Link
                href={item.href!}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    isActive
                        ? 'border-orange-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
            >
                {item.label}
            </Link>
        )
    }

    return (
        <div className="relative inline-flex items-center" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors outline-none ${
                    isActive
                        ? 'border-orange-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
                {item.label} 
                <span className="ml-1 text-xs opacity-50">▼</span>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50">
                    {item.children.map((child) => {
                        const isChildActive = pathname === child.href
                        return (
                            <Link
                                key={child.href}
                                href={child.href}
                                onClick={() => setIsOpen(false)}
                                className={`block px-4 py-3 text-sm hover:bg-orange-50 transition-colors ${
                                    isChildActive ? 'text-orange-600 font-bold bg-orange-50' : 'text-gray-700'
                                }`}
                            >
                                {child.label}
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    )
}