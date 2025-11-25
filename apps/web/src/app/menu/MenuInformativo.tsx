// src/app/menu/MenuInformativo.tsx
import React from 'react'
import { GetStaticProps } from 'next'
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

export const getStaticProps: GetStaticProps<MenuPageProps> = async () => {
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  let menuSections: MenuSection[] = []
  try {
    const res = await fetch(`${site}/api/menu`, { cache: 'no-store' })
    if (res.ok) menuSections = await res.json()
  } catch {
    menuSections = []
  }
  return { props: { menuSections }, revalidate: 60 }
}