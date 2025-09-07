'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from './LogoutButton'

const items = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/notices', label: 'Avisos' },
  { href: '/admin/menu/proteins', label: 'Proteínas' },
  { href: '/admin/menu/flavors', label: 'Sabores' },
  { href: '/admin/menu/extras', label: 'Extras' },
  { href: '/admin/feedback', label: 'Feedback' },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="card p-3">
      <p className="font-display text-lg mb-2">Admin 1</p>
      <ul className="space-y-1">
        {items.map((i) => {
          const active = pathname === i.href || pathname.startsWith(i.href + '/')
          return (
            <li key={i.href}>
              <Link
                href={i.href}
                className={[
                  'block rounded-lg px-3 py-2 text-sm transition',
                  active
                    ? 'bg-[--surface] text-[--primary] ring-1 ring-[--accent]/40'
                    : 'text-[--text] hover:bg-[--surface] hover:text-[--primary]'
                ].join(' ')}
                aria-current={active ? 'page' : undefined}
              >
                {i.label}
              </Link>
            </li>
          )
        })}
      </ul>
      <LogoutButton />
    </nav>
  )
}