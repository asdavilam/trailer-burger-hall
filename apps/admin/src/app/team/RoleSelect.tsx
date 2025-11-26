// apps/admin/src/app/team/RoleSelect.tsx
'use client'

import { useState } from 'react'
import { UserRole } from '@trailer/shared'
import { updateUserRole } from './actions'

type Props = {
  userId: string
  currentRole: UserRole
  disabled?: boolean
}

export function RoleSelect({ userId, currentRole, disabled }: Props) {
  const [isPending, setIsPending] = useState(false)

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as UserRole
    
    // Confirmación rápida
    if (!confirm(`¿Cambiar rol a ${newRole.toUpperCase()}?`)) {
      e.target.value = currentRole // Revertir visualmente
      return
    }

    setIsPending(true)
    const res = await updateUserRole(userId, newRole)
    setIsPending(false)

    if (res?.error) {
      alert(res.error)
    }
  }

  return (
    <div className="relative">
      <select
        defaultValue={currentRole}
        onChange={handleChange}
        disabled={disabled || isPending}
        className={`
          block w-full rounded-md border-gray-300 py-1.5 text-sm font-semibold
          focus:border-orange-500 focus:ring-orange-500 shadow-sm
          ${isPending ? 'opacity-50 cursor-wait' : ''}
          ${currentRole === 'admin' ? 'text-purple-700 bg-purple-50' : 'text-gray-700 bg-white'}
        `}
      >
        <option value="staff">STAFF</option>
        <option value="kitchen">COCINA</option>
        <option value="admin">ADMIN</option>
      </select>
      {isPending && (
        <span className="absolute right-8 top-2 text-xs text-orange-600">...</span>
      )}
    </div>
  )
}