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

export type CountingMode = 'integer' | 'fraction' | 'fuzzy';

export type SupplyType = 'purchase' | 'production';

export type Supply = {
  id: string;
  name: string;
  unit: SupplyUnit;
  cost_per_unit: number;
  counting_mode: CountingMode; // Nuevo campo
  supply_type?: SupplyType; // Nuevo campo
  package_cost?: number | null;
  quantity_per_package?: number | null;
  purchase_unit?: string | null;
  last_price_check?: string;
  price_trend?: 'up' | 'down' | 'stable';
  current_stock: number;
  min_stock?: number | null;
  provider?: string | null;
  brand?: string | null;
  category?: string | null;
  yield_quantity?: number; // Rendimiento de la receta (default 1)
  shrinkage_percent?: number; // Porcentaje de merma (0-100)
  abc_classification?: 'A' | 'B' | 'C'; // Clasificación ABC
  average_weight?: number | null; // Peso promedio por pieza (para Smart Conversion)
  assigned_user_id?: string | null; // Usuario responsable de la compra
  created_at?: string;
};

export type SupplyIngredient = {
  id: string;
  parent_supply_id: string;
  child_supply_id: string;
  quantity: number;
  child_supply?: Supply; // Para mostrar el nombre
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

// 4. POS Account Types (Sistema de Cuentas)
export type ServiceType = 'dine_in' | 'takeout';
export type AccountStatus = 'open' | 'closed';

export type POSAccount = {
  id: string;
  customer_name: string;
  service_type: ServiceType;
  status: AccountStatus;
  total_amount: number;
  paid_amount: number;
  created_by: string;
  created_at: string;
  closed_at?: string | null;
  notes?: string | null;
};

export type POSAccountItem = {
  id: string;
  account_id: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  modifiers: Array<{ modifier_id: string; quantity: number }>;
  created_at: string;
};

export type POSAccountWithItems = POSAccount & {
  items?: POSAccountItem[];
  pending_balance: number; // calculated: total_amount - paid_amount
};