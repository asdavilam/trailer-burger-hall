'use client'

import { useEffect, useMemo, useState } from 'react'
import ProteinList from './ProteinList'
import FlavorList from './FlavorList'
import ExtrasList from './ExtrasList'
import type { Protein, Flavor, Extra } from '@/lib/menu-data'
import { getFlavors, getExtras } from '@/lib/menu-data'

type Props = {
  proteins: Protein[]
}

export default function MenuFlow({ proteins }: Props) {
  const [proteinId, setProteinId] = useState<string | null>(null)
  const [flavors, setFlavors] = useState<Flavor[]>([])
  const [flavorId, setFlavorId] = useState<string | null>(null)

  const [extras, setExtras] = useState<Extra[]>([])
  const [selectedExtras, setSelectedExtras] = useState<string[]>([])

  // Carga sabores + extras (una vez)
  useEffect(() => {
    let mounted = true
    ;(async () => {
      const [fl, ex] = await Promise.all([getFlavors(), getExtras()])
      if (!mounted) return
      setFlavors(fl)
      setExtras(ex)
    })()
    return () => {
      mounted = false
    }
  }, [])

  // Reset al cambiar proteína o sabor
  useEffect(() => {
    setFlavorId(null)
    setSelectedExtras([])
  }, [proteinId])

  useEffect(() => {
    setSelectedExtras([])
  }, [flavorId])

  const selectedProtein = proteins.find((p) => p.id === proteinId)
  const selectedFlavor = flavors.find((f) => f.id === flavorId)

  // Cálculo de total: base + extra del sabor + sum(extras)
  const total = useMemo(() => {
    const base = selectedProtein?.price_base ?? 0
    const flavorExtra = selectedFlavor?.price_extra ?? 0
    const extrasSum = selectedExtras
      .map((id) => extras.find((e) => e.id === id)?.price ?? 0)
      .reduce((a, b) => a + b, 0)
    return base + flavorExtra + extrasSum
  }, [selectedProtein, selectedFlavor, selectedExtras, extras])

  const toggleExtra = (id: string) => {
    setSelectedExtras((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  return (
    <section className="space-y-10">
      {/* Paso 1: Proteínas */}
      <section>
        <header className="mb-4">
          <h2 className="text-2xl font-bold text-[#3B1F1A]">1) Elige tu proteína</h2>
          <p className="text-sm text-gray-600">Selecciona una base para tu hamburguesa.</p>
        </header>
        <ProteinList proteins={proteins} selectedId={proteinId} onSelect={setProteinId} />
      </section>

      {/* Paso 2: Sabores */}
      <section aria-disabled={!proteinId} className={!proteinId ? 'opacity-60' : ''}>
        <header className="mb-4">
          <h2 className="text-2xl font-bold text-[#3B1F1A]">2) Elige tu sabor</h2>
          <p className="text-sm text-gray-600">
            {proteinId
              ? 'Ahora selecciona tu combinación de sabor.'
              : 'Primero selecciona una proteína.'}
          </p>
        </header>

        <fieldset disabled={!proteinId} className="contents">
          <FlavorList flavors={flavors} selectedId={flavorId} onSelect={setFlavorId} />
        </fieldset>
      </section>

      {/* Paso 3: Extras */}
      <section
        aria-disabled={!proteinId || !flavorId}
        className={!proteinId || !flavorId ? 'opacity-60' : ''}
      >
        <header className="mb-4">
          <h2 className="text-2xl font-bold text-[#3B1F1A]">3) Agrega extras (opcional)</h2>
          <p className="text-sm text-gray-600">
            {proteinId && flavorId
              ? 'Personaliza tu burger con extras.'
              : 'Selecciona proteína y sabor para habilitar extras.'}
          </p>
        </header>

        <fieldset disabled={!proteinId || !flavorId} className="contents">
          <ExtrasList extras={extras} selectedIds={selectedExtras} onToggle={toggleExtra} />
        </fieldset>
      </section>

      {/* Resumen y total */}
      <section className="border-t pt-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-gray-700">
            {selectedProtein ? (
              <span>
                Proteína: <strong>{selectedProtein.name}</strong>
              </span>
            ) : (
              <span>Proteína: —</span>
            )}
            {' · '}
            {selectedFlavor ? (
              <span>
                Sabor: <strong>{selectedFlavor.name}</strong>
              </span>
            ) : (
              <span>Sabor: —</span>
            )}
            {' · '}
            <span>
              Extras: <strong>{selectedExtras.length}</strong>
            </span>
          </div>

          <div className="text-xl font-bold text-[#3B1F1A]">Total: ${total.toFixed(2)}</div>
        </div>

        <div className="mt-4">
          <button
            type="button"
            disabled={!proteinId || !flavorId}
            className={[
              'rounded-lg px-5 py-2 font-semibold text-white',
              proteinId && flavorId
                ? 'bg-[#6B8E62] hover:bg-[#C08A3E]'
                : 'bg-gray-300 cursor-not-allowed',
            ].join(' ')}
            onClick={() => {
              // Aquí más adelante enviaremos al carrito/orden (futuro)
              // Por ahora solo dejamos el resumen y el total calculado.
            }}
          >
            Continuar
          </button>
        </div>
      </section>
    </section>
  )
}
