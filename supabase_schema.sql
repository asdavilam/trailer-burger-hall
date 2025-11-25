-- 1. Crear Tablas

-- Tabla de Secciones (Ej. "Hamburguesas Clásicas", "Bebidas")
create table public.menu_sections (
  id text primary key, -- 'clasicas', 'bebidas'
  title text not null,
  subtitle text,
  layout text default 'cards', -- 'cards' | 'list'
  sort_order integer default 0
);

-- Tabla de Items (Ej. "Hamburguesa de Res", "Coca Cola")
create table public.menu_items (
  id text primary key,
  section_id text references public.menu_sections(id) on delete cascade,
  name text not null,
  description text,
  image_url text,
  available boolean default true,
  tags text[], -- ['picante', 'vegetariano']
  badges text[], -- ['nuevo', 'popular']
  includes_list text[], -- ['papas', 'refresco'] (renombrado de 'includes' para evitar confusión)
  note text,
  sort_order integer default 0
);

-- Tabla de Precios (Ej. "Sencilla: $85", "Doble: $125")
create table public.menu_item_prices (
  id uuid primary key default gen_random_uuid(),
  item_id text references public.menu_items(id) on delete cascade,
  label text, -- 'Sencilla', 'Doble', o NULL si es precio único
  value numeric not null,
  sort_order integer default 0
);

-- Habilitar RLS (Seguridad) - Opcional pero recomendado
alter table public.menu_sections enable row level security;
alter table public.menu_items enable row level security;
alter table public.menu_item_prices enable row level security;

-- Política de lectura pública (Cualquiera puede ver el menú)
create policy "Menu Sections son públicos" on public.menu_sections for select using (true);
create policy "Menu Items son públicos" on public.menu_items for select using (true);
create policy "Menu Prices son públicos" on public.menu_item_prices for select using (true);
