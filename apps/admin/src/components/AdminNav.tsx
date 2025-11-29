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

const menuSubItems = [
    { label: 'General', href: '/products', exact: true },
    { label: 'Recetas', href: '/products/recipes' },
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
        href: '/products',
        children: menuSubItems
    },
    {
        label: 'Inventario',
        href: '/supplies',
        children: inventorySubItems
    },
    { label: 'Equipo', href: '/team' },
]

import { createClient } from '@/lib/supabase-client'

// ... (imports remain the same)

export function AdminNav() {
    const pathname = usePathname()
    const [role, setRole] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()



    useEffect(() => {
        let mounted = true
        let retryCount = 0
        const MAX_RETRIES = 5

        const fetchRole = async (userId: string) => {
            try {
                const { data, error } = await supabase
                    .from('user_profiles')
                    .select('role')
                    .eq('id', userId)
                    .single()

                if (!mounted) return

                if (data) {
                    setRole(data.role)
                } else {
                    setRole(null)
                }
            } catch (error) {
                console.error('AdminNav: Error fetching role:', error)
                if (mounted) setRole(null)
            } finally {
                if (mounted) setLoading(false)
            }
        }

        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()

                if (session?.user) {
                    await fetchRole(session.user.id)
                    return true
                }
                return false
            } catch (e) {
                console.error('AdminNav: Session check error', e)
                return false
            }
        }

        const init = async () => {
            // 1. Intento inmediato
            const found = await checkSession()
            if (found) return

            // 2. Si falló, intentar con getUser (servidor)
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                await fetchRole(user.id)
                return
            }

            // 3. Polling de emergencia (por si la sesión se hidrata tarde)
            const interval = setInterval(async () => {
                if (!mounted) return
                retryCount++

                const success = await checkSession()
                if (success || retryCount >= MAX_RETRIES) {
                    clearInterval(interval)
                    if (!success && mounted) setLoading(false) // Rendirse y mostrar navbar vacío
                }
            }, 500) // Reintentar cada 500ms
        }

        init()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
                if (session?.user) {
                    fetchRole(session.user.id)
                }
            } else if (event === 'SIGNED_OUT') {
                if (mounted) {
                    setRole(null)
                    setLoading(false)
                }
            }
        })

        return () => {
            mounted = false
            subscription.unsubscribe()
        }
    }, [supabase, pathname]) // Agregamos pathname para re-verificar al navegar

    // Ocultar en login, update-password y auth callback
    if (pathname === '/login' || pathname === '/update-password' || pathname.startsWith('/auth')) return null

    // Si está cargando, mostramos un navbar vacío o skeleton para evitar saltos, 
    // o simplemente el navbar completo y luego se ajusta (preferible skeleton o nada)
    // Pero para simplicidad, retornamos null hasta saber el rol para evitar mostrar opciones prohibidas
    if (loading) return null

    const isInventorySection = pathname.startsWith('/supplies')
    const isCatalogSection = pathname.startsWith('/products')

    // Filtrar items según rol
    const visibleNavItems = navItems.filter(item => {
        if (role === 'admin') return true

        // Si no es admin (staff/kitchen), solo mostrar Inventario
        if (item.label === 'Inventario') return true

        return false
    })

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo y Escritorio */}
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <span className="text-xl font-display font-bold text-[var(--color-primary)]">
                                TBH Portal
                            </span>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            {visibleNavItems.map((item) => (
                                <NavEntry key={item.label} item={item} pathname={pathname} />
                            ))}
                        </div>
                    </div>
                    {/* ... rest of the component */}

                    <div className="flex items-center">
                        <LogoutBtn />
                    </div>
                </div>
            </div>

            {/* --- MÓVIL: SISTEMA DE DOBLE BARRA --- */}
            <div className="sm:hidden flex flex-col bg-white border-t border-gray-200">

                {/* NIVEL 1: Secciones Principales */}
                <div className="flex overflow-x-auto p-2 gap-2 no-scrollbar items-center">
                    {visibleNavItems.map(item => {
                        const isActive = item.href === '/'
                            ? pathname === '/'
                            : pathname.startsWith(item.href || '###')

                        return (
                            <Link
                                key={item.label}
                                href={item.children ? item.children[0].href : item.href!}
                                className={`text-sm font-bold whitespace-nowrap px-4 py-2 rounded-full transition-colors ${isActive
                                    ? 'bg-[var(--color-secondary)] text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        )
                    })}
                </div>

                {/* NIVEL 2: Sub-menú de Inventario */}
                {isInventorySection && (
                    <div className="flex overflow-x-auto p-2 gap-2 bg-[var(--color-background)] border-t border-gray-200 no-scrollbar shadow-inner">
                        {inventorySubItems.map(subItem => {
                            const isActive = subItem.exact
                                ? pathname === subItem.href
                                : pathname.startsWith(subItem.href)

                            return (
                                <Link
                                    key={subItem.href}
                                    href={subItem.href}
                                    className={`text-xs font-medium whitespace-nowrap px-3 py-1.5 rounded-lg border transition-all ${isActive
                                        ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-sm'
                                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {subItem.label}
                                </Link>
                            )
                        })}
                    </div>
                )}
                {/* NIVEL 2: Sub-menú de Catálogo & Menú */}
                {isCatalogSection && (
                    <div className="flex overflow-x-auto p-2 gap-2 bg-[var(--color-background)] border-t border-gray-200 no-scrollbar shadow-inner">
                        {menuSubItems.map(subItem => {
                            const isActive = subItem.exact
                                ? pathname === subItem.href
                                : pathname.startsWith(subItem.href)

                            return (
                                <Link
                                    key={subItem.href}
                                    href={subItem.href}
                                    className={`text-xs font-medium whitespace-nowrap px-3 py-1.5 rounded-lg border transition-all ${isActive
                                        ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-sm'
                                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
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
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${isActive
                    ? 'border-[var(--color-primary)] text-[var(--color-secondary)]'
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
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors outline-none ${isActive
                    ? 'border-[var(--color-primary)] text-[var(--color-secondary)]'
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
                                className={`block px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${isChildActive ? 'text-[var(--color-primary)] font-bold bg-gray-50' : 'text-gray-700'
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