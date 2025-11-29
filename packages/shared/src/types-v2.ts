// packages/shared/src/types-v2.ts

export type ProductCategory = 'protein_base' | 'special' | 'side' | 'drink' | 'extra';
export type VariantType = 'normal' | 'doble' | 'light' | 'standard' | 'casa';
export type ModifierType = 'flavor' | 'extra';

// 1. EL PRODUCTO (El padre)
export type V2Product = {
  id: string;
  name: string;
  description?: string | null;
  category: ProductCategory;
  image_url?: string | null;
  is_active: boolean;
  config: {
    included_flavors?: number;
    default_modifiers?: string[]; // IDs de modificadores
    allow_extras?: boolean;
  };
  // Relaciones (se llenan al hacer join)
  variants?: V2ProductVariant[];
  allowed_modifiers?: V2ProductModifierLink[];
};

// 2. LAS VARIANTES (Los tamaños/versiones)
export type V2ProductVariant = {
  id: string;
  product_id: string;
  name: VariantType;
  price: number;
  is_active: boolean;
  image_url?: string | null;
  description?: string | null;
};

// 3. LOS MODIFICADORES (Sabores y Extras unificados)
export type V2Modifier = {
  id: string;
  name: string;
  type: ModifierType;
  price: number;         // Precio base
  price_intense?: number | null; // Precio si es "Extremo" (solo sabores)
  is_active: boolean;
};

// 4. LA REGLA DE VINCULACIÓN (Qué lleva qué)
export type V2ProductModifierLink = {
  product_id: string;
  modifier_id: string;
  is_default: boolean;
  is_included_free: boolean;
  // Relación expandida
  modifier?: V2Modifier;
};