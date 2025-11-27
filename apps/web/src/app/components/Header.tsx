'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu } from 'lucide-react'

const navItems = [
  { href: '/', label: 'Inicio' },
  { href: '/menu', label: 'Menú' },
  { href: '/acerca', label: 'Acerca de' },
  { href: '/contacto', label: 'Contacto' },
]

export default function Header() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-[#3B1F1A] text-[#C08A3E] shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="font-display text-xl tracking-wide">
          Trailer Burger Hall
        </Link>

        {/* Desktop nav */}
        <nav className="hidden gap-6 md:flex" aria-label="Principal">
          {navItems.map(({ href, label }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`font-medium transition-colors ${
                  active ? 'text-[#6B8E62]' : 'hover:text-[#6B8E62]'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden"
          aria-label="Abrir menú"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="md:hidden bg-[#3B1F1A] border-t border-[#C08A3E]/20">
          <nav className="flex flex-col p-4 gap-3" aria-label="Principal móvil">
            {navItems.map(({ href, label }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`font-medium transition-colors ${
                    active ? 'text-[#6B8E62]' : 'hover:text-[#6B8E62]'
                  }`}
                >
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>
      )}
    </header>
  )
}