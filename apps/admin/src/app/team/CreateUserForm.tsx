'use client'
import { useState } from 'react'
import { inviteUser } from './actions'

export function CreateUserForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [msg, setMsg] = useState('')

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-orange-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-orange-700 transition"
      >
        + Invitar Usuario
      </button>
    )
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg border mb-6 animate-in fade-in slide-in-from-top-2">
      <form action={async (formData) => {
        setMsg('Enviando invitación...')
        const res = await inviteUser(formData)
        if (res.error) setMsg(res.error)
        else {
          setMsg('¡Invitación enviada!')
          setTimeout(() => {
            setIsOpen(false)
            setMsg('')
          }, 2000)
        }
      }} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase">Email</label>
          <input name="email" type="email" required placeholder="staff@trailer.com" className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase">Nombre</label>
          <input name="name" type="text" required placeholder="Juan Pérez" className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase">Rol Inicial</label>
          <select name="role" className="w-full p-2 border rounded">
            <option value="staff">Staff</option>
            <option value="kitchen">Cocina</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded font-bold">Invitar</button>
          <button type="button" onClick={() => setIsOpen(false)} className="bg-gray-300 px-4 py-2 rounded">Cancelar</button>
        </div>
      </form>
      {msg && <p className="text-sm mt-2 font-bold text-orange-600">{msg}</p>}
    </div>
  )
}