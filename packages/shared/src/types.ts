// packages/shared/src/types.ts

// 1. Variantes de hamburguesa
export type VariantKind = 'normal' | 'double' | 'light' | 'casa' | 'torre';

// 2. Entidades Principales (DB + Lógica)
export type Protein = {
  id: string
  name: string
  price_base: number
  price_double: number
  price_light: number
  available?: boolean
  created_at?: string
}

export type Flavor = {
  id: string
  name: string
  intensity: 'normal' | 'extremo'
  price_extra: number
  description?: string | null
  tags?: string[] | null
  available?: boolean
  created_at?: string
}

export type Extra = {
  id: string
  name: string
  price: number
  available?: boolean
  created_at?: string
}

// 3. Tipos de Resultados (para el ticket/carrito)
export type PriceBreakdown = {
  base: number
  flavorsIncluded: string[]
  flavorsCharged: { id: string; amount: number }[]
  extras: { id: string; amount: number }[]
  total: number
}

export type UserRole = 'admin' | 'staff' | 'kitchen';

export type UserProfile = {
  id: string;
  email: string;
  role: UserRole;
  display_name?: string | null;
  is_active: boolean;
  created_at: string;
};

export type SupplyUnit = 'kg' | 'lt' | 'pz' | 'gr' | 'ml';

export type Supply = {
  id: string;
  name: string;
  unit: SupplyUnit;
  cost_per_unit: number;
  package_cost?: number;
  quantity_per_package?: number;
  purchase_unit?: string;
  last_price_check?: string;
  price_trend?: 'up' | 'down' | 'stable';
  current_stock: number;
  min_stock?: number | null;
  provider?: string | null;
  brand?: string | null;
  category?: string | null;
  created_at?: string;
};

export type InventoryAssignment = {
  id: string;
  user_id: string;
  supply_id: string;
  // Opcional: incluir datos expandidos si haces joins
  supply?: Supply;
  user?: UserProfile;
};

export type InventoryLog = {
  id: string;
  date: string; // formato YYYY-MM-DD
  supply_id: string;
  user_id: string;
  initial_stock: number;
  entries: number;
  exits: number;
  final_count: number;
  comments?: string;
};

export type ProductIngredient = {
  id: string;
  // Puede pertenecer a uno de estos:
  protein_id?: string | null;
  flavor_id?: string | null;
  extra_id?: string | null;

  // Se conecta con:
  supply_id: string;
  supply?: Supply; // Para poder mostrar el nombre "Carne" en el front

  quantity: number;
};