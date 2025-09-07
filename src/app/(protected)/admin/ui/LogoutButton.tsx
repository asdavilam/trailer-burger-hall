'use client'

import { logout } from '@/app/(auth)/actions'

export default function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 text-sm"
      >
        Cerrar sesión
      </button>
    </form>
  )
}