// src/app/menu/MenuInformativo.tsx
import React from 'react'
import MenuListClient from './MenuListClient'
import type { MenuSection } from '@trailer/shared'

type MenuPageProps = {
  menuSections: MenuSection[]
}

export default function MenuPage({ menuSections: initial }: MenuPageProps) {
  return (
    <main className="container mx-auto px-4 py-8">
      {/* ancho mayor para cards grandes */}
      <div className="mx-auto max-w-6xl">
        <MenuListClient initial={initial} />
      </div>
    </main>
  )
}