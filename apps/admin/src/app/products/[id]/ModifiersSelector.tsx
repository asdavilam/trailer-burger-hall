'use client'
import { toggleModifierLink, toggleModifierDefault } from '../actions'
import { useTransition } from 'react'

export function ModifiersSelector({ product, allModifiers }: { product: any, allModifiers: any[] }) {
  const [isPending, startTransition] = useTransition()

  // Helper para saber si está activo
  const isLinked = (modId: string) => product.allowed_modifiers.some((link: any) => link.modifier_id === modId)
  const isDefault = (modId: string) => product.allowed_modifiers.find((link: any) => link.modifier_id === modId)?.is_default

  const handleToggle = (modId: string, currentStatus: boolean) => {
    startTransition(async () => {
      await toggleModifierLink(product.id, modId, !currentStatus)
    })
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
      <h3 className="font-bold text-gray-700 mb-4">Extras y Sabores Permitidos 🌶️</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {allModifiers.map(mod => {
          const active = isLinked(mod.id)
          return (
            <div key={mod.id} className={`p-3 rounded border ${active ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-transparent'} transition`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm">{mod.name}</span>
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => handleToggle(mod.id, active)}
                  disabled={isPending}
                  className="w-5 h-5 text-orange-600 rounded cursor-pointer"
                />
              </div>
              {active && (
                <label className="flex items-center gap-2 text-xs text-gray-600">
                  <input
                    type="checkbox"
                    checked={isDefault(mod.id) || false}
                    onChange={(e) => {
                      const checked = e.target.checked
                      startTransition(async () => {
                        await toggleModifierDefault(product.id, mod.id, checked)
                      })
                    }}
                  />
                  Pre-seleccionado
                </label>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}