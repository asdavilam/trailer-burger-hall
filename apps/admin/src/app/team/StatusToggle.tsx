'use client'
import { toggleUserStatus } from './actions'
import { useState } from 'react'

export function StatusToggle({ userId, isActive }: { userId: string, isActive: boolean }) {
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    if (!confirm(isActive ? '¿Desactivar usuario? No podrá entrar.' : '¿Reactivar usuario?')) return
    setLoading(true)
    await toggleUserStatus(userId, !isActive)
    setLoading(false)
  }

  return (
    <button 
      onClick={handleToggle}
      disabled={loading}
      className={`text-xs px-2 py-1 rounded font-bold border transition
        ${isActive 
          ? 'bg-green-100 text-green-700 border-green-200 hover:bg-red-100 hover:text-red-700 hover:content-["Desactivar"]' 
          : 'bg-red-100 text-red-700 border-red-200 hover:bg-green-100 hover:text-green-700'
        }
      `}
    >
      {loading ? '...' : isActive ? 'ACTIVO' : 'INACTIVO'}
    </button>
  )
}