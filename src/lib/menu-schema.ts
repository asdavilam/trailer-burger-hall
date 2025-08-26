// Tipos de la carta digital (puedes extenderlos si lo necesitas)
export type MenuPrice = {
  label?: string // ej. "Combo", "Doble"
  value: number // precio
}

export type MenuItem = {
  id: string
  name: string
  description?: string | null
  prices: MenuPrice[] // uno o varios precios
  tags?: string[] // ej. ["picante", "vegetariano"]
  available?: boolean // si no lo pones, asume true
  // 👇 campos visuales adicionales (no rompen nada existente)
  includes?: string[] // sabores por defecto visibles como píldoras (ej. ["diabla","mojo"])
  badges?: string[] // ej. ["vegetariano","estrella","doble","torre","light"]
  note?: string // microcopy corto (reglas de sabores)
  image?: string // ruta opcional a imagen
}

export type MenuSection = {
  id: string
  title: string // Título visible de la sección
  subtitle?: string // Línea de apoyo (opcional)
  layout?: 'cards' | 'list' // cómo renderizar (cards por defecto)
  items: MenuItem[]
}

// Carta digital con énfasis en SABORES primero (hero informativo)
export const MENU_SECTIONS: MenuSection[] = [
  // 0) SABORES — destacado arriba
  {
    id: 'sabores',
    title: 'Sabores',
    subtitle:
      'Elige tu combinación. En Res/Pollo el primer sabor está incluido. Extras: +$5 (Extremo +$10).',
    layout: 'cards',
    items: [
      {
        id: 'habanero-extremo',
        name: 'Habanero Extremo',
        description: 'Muy picante',
        prices: [{ label: 'Extra', value: 10 }],
        tags: ['muy_picante'],
        available: true,
      },
      {
        id: 'habanero',
        name: 'Habanero',
        description: 'Picante',
        prices: [{ label: 'Extra', value: 5 }],
        tags: ['picante'],
        available: true,
      },
      {
        id: 'diabla',
        name: 'Diabla',
        description: 'Picante',
        prices: [{ label: 'Extra', value: 5 }],
        tags: ['picante'],
        available: true,
      },
      {
        id: 'tamarindo',
        name: 'Tamarindo',
        description: 'Dulce',
        prices: [{ label: 'Extra', value: 5 }],
        tags: ['dulce'],
        available: true,
      },
      {
        id: 'bbq',
        name: 'BBQ',
        description: 'Agridulce y ahumada',
        prices: [{ label: 'Extra', value: 5 }],
        tags: ['agridulce'],
        available: true,
      },
      {
        id: 'cilantro',
        name: 'Cilantro',
        description: 'Fresco y salado',
        prices: [{ label: 'Extra', value: 5 }],
        tags: ['salado'],
        available: true,
      },
      {
        id: 'chimi',
        name: 'Chimi',
        description: 'Chimichurri casero',
        prices: [{ label: 'Extra', value: 5 }],
        tags: ['salado'],
        available: true,
      },
      {
        id: 'mojo',
        name: 'Mojo',
        description: 'Criolla salada',
        prices: [{ label: 'Extra', value: 5 }],
        tags: ['salado'],
        available: true,
      },
    ],
  },

  // 1) HAMBURGUESAS CLÁSICAS
  {
    id: 'clasicas',
    title: 'Hamburguesas — Clásicas',
    subtitle: 'Primer sabor incluido. Extras: +$5 (Extremo +$10).',
    layout: 'cards',
    items: [
      {
        id: 'res',
        name: 'Res',
        description: 'Carne 100% res. Elige 1 o más sabores.',
        note: 'Primer sabor incluido; cada sabor extra +$5 (Extremo +$10).',
        prices: [
          { label: 'Normal', value: 85 },
          { label: 'Doble', value: 125 },
        ],
        tags: [],
        available: true,
      },
      {
        id: 'pollo',
        name: 'Pollo',
        description: 'Carne 100% pollo. Elige 1 o más sabores.',
        note: 'Primer sabor incluido; cada sabor extra +$5 (Extremo +$10).',
        prices: [
          { label: 'Normal', value: 90 },
          { label: 'Doble', value: 130 },
        ],
        tags: [],
        available: true,
      },
    ],
  },

  // 2) HAMBURGUESAS DE MAR
  {
    id: 'mar',
    title: 'Hamburguesas — De Mar',
    subtitle: 'Incluye sabores por defecto: Diabla + Mojo. Extras opcionales.',
    layout: 'cards',
    items: [
      {
        id: 'camaron',
        name: 'Camarón',
        description: 'Carne 100% camarón.',
        includes: ['diabla', 'mojo'],
        prices: [
          { label: 'Normal', value: 135 },
          { label: 'Doble', value: 220 },
        ],
        tags: ['picante', 'salado'],
        available: true,
      },
      {
        id: 'salmon',
        name: 'Salmón',
        description: 'Carne 100% salmón.',
        includes: ['diabla', 'mojo'],
        prices: [
          { label: 'Normal', value: 135 },
          { label: 'Doble', value: 220 },
        ],
        tags: ['picante', 'salado'],
        available: true,
      },
    ],
  },

  // 3) HAMBURGUESA VEGETARIANA
  {
    id: 'veg',
    title: 'Hamburguesa — Vegetariana',
    subtitle: 'Incluye sabores por defecto: Chimi + Mojo.',
    layout: 'cards',
    items: [
      {
        id: 'portobello',
        name: 'Portobello',
        description: 'Hongos Portobello.',
        includes: ['chimi', 'mojo'],
        prices: [
          { label: 'Normal', value: 85 },
          { label: 'Doble', value: 110 },
        ],
        tags: ['vegetariano', 'salado'],
        available: true,
      },
    ],
  },

  // 4) HAMBURGUESAS LIGHT (sección propia) 🥗
  {
    id: 'light',
    title: 'Hamburguesas — Light 🥗',
    subtitle: 'Sin pan (ensalada). Misma lógica de sabores que la versión normal.',
    layout: 'cards',
    items: [
      {
        id: 'light-res',
        name: 'Res (Light)',
        description: 'Elige 1 o más sabores. Primer sabor incluido; extras +$5 (Extremo +$10).',
        prices: [{ value: 90 }],
        badges: ['light'],
        available: true,
      },
      {
        id: 'light-pollo',
        name: 'Pollo (Light)',
        description: 'Elige 1 o más sabores. Primer sabor incluido; extras +$5 (Extremo +$10).',
        prices: [{ value: 95 }],
        badges: ['light'],
        available: true,
      },
      {
        id: 'light-camaron',
        name: 'Camarón (Light)',
        description: 'Incluye: Diabla + Mojo. Puedes agregar sabores extra.',
        includes: ['diabla', 'mojo'],
        prices: [{ value: 115 }],
        badges: ['light'],
        available: true,
      },
      {
        id: 'light-salmon',
        name: 'Salmón (Light)',
        description: 'Incluye: Diabla + Mojo. Puedes agregar sabores extra.',
        includes: ['diabla', 'mojo'],
        prices: [{ value: 115 }],
        badges: ['light'],
        available: true,
      },
      {
        id: 'light-portobello',
        name: 'Portobello (Light)',
        description: 'Incluye: Chimi + Mojo. Puedes agregar sabores extra.',
        includes: ['chimi', 'mojo'],
        prices: [{ value: 95 }],
        badges: ['light', 'vegetariano'],
        available: true,
      },
    ],
  },

  // 5) HAMBURGUESAS DE LA CASA ⭐
  {
    id: 'casa',
    title: 'Hamburguesas de la Casa ⭐',
    subtitle: 'Incluye Portobello (Chimi + Mojo) + segunda proteína con sabor por defecto.',
    layout: 'cards',
    items: [
      {
        id: 'casa-res',
        name: 'La Casa (con Res)',
        description: 'Portobello + Res con sabor Habanero.',
        includes: ['chimi', 'mojo', 'habanero'],
        prices: [{ value: 135 }],
        tags: ['picante', 'salado'],
        badges: ['estrella'],
        available: true,
      },
      {
        id: 'casa-pollo',
        name: 'La Casa (con Pollo)',
        description: 'Portobello + Pollo con sabor Habanero.',
        includes: ['chimi', 'mojo', 'habanero'],
        prices: [{ value: 125 }],
        tags: ['picante', 'salado'],
        badges: ['estrella'],
        available: true,
      },
      {
        id: 'casa-camaron',
        name: 'La Casa (con Camarón)',
        description: 'Portobello + Camarón con Diabla + Mojo.',
        includes: ['chimi', 'mojo', 'diabla', 'mojo'],
        prices: [{ value: 160 }],
        tags: ['picante', 'salado'],
        badges: ['estrella'],
        available: true,
      },
      {
        id: 'casa-salmon',
        name: 'La Casa (con Salmón)',
        description: 'Portobello + Salmón con Diabla + Mojo.',
        includes: ['chimi', 'mojo', 'diabla', 'mojo'],
        prices: [{ value: 160 }],
        tags: ['picante', 'salado'],
        badges: ['estrella'],
        available: true,
      },
    ],
  },

  // 6) TORRE PIZZA 🍕
  {
    id: 'torre',
    title: 'Torre Pizza 🍕',
    subtitle: 'Res con salsa de tomate, parmesano y manchego. Extras: +$5 (Extremo +$10).',
    layout: 'cards',
    items: [
      {
        id: 'torre-normal',
        name: 'Torre Pizza',
        description: 'Receta fija. Puedes agregar sabores extra (mismos costos).',
        prices: [{ value: 100 }],
        tags: ['agridulce', 'salado'],
        badges: ['torre'],
        available: true,
      },
      {
        id: 'torre-doble',
        name: 'Torre Pizza Doble',
        description: 'Duplica proteína/queso/salsa. Puedes agregar sabores extra (mismos costos).',
        prices: [{ value: 130 }],
        tags: ['agridulce', 'salado'],
        badges: ['torre', 'doble'],
        available: true,
      },
    ],
  },

  // 7) PAPAS
  {
    id: 'papas',
    title: 'Papas Italianas',
    subtitle: 'Base $40. Puedes agregar cualquier sabor (+$5 cada uno; Extremo +$10).',
    layout: 'list',
    items: [
      {
        id: 'papas-italianas',
        name: 'Papas Italianas',
        description: 'Papas a la francesa. Agrega sabores a tu gusto.',
        prices: [{ value: 40 }],
        tags: [],
        available: true,
      },
    ],
  },
]
