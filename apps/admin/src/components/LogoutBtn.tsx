'use client'
import { logout } from '@/app/login/actions'

export function LogoutBtn() {
  return (
    <button 
      onClick={() => logout()} 
      className="text-sm font-medium text-red-600 hover:text-red-800 hover:underline transition"
    >
      Cerrar Sesión 🚪
    </button>
  )
}