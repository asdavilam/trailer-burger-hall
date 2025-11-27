-- 2. Insertar Datos Iniciales (Seed)

-- Secciones
INSERT INTO public.menu_sections (id, title, subtitle, layout, sort_order) VALUES
('sabores', 'Sabores', 'Elige tu combinación. En Res/Pollo el primer sabor está incluido. Extras: +$5 (Extremo +$10).', 'cards', 0),
('clasicas', 'Hamburguesas — Clásicas', 'Primer sabor incluido. Extras: +$5 (Extremo +$10).', 'cards', 1),
('mar', 'Hamburguesas — De Mar', 'Incluye sabores por defecto: Diabla + Mojo. Extras opcionales.', 'cards', 2),
('veg', 'Hamburguesa — Vegetariana', 'Incluye sabores por defecto: Chimi + Mojo.', 'cards', 3),
('light', 'Hamburguesas — Light 🥗', 'Sin pan (ensalada). Misma lógica de sabores que la versión normal.', 'cards', 4),
('casa', 'Hamburguesas de la Casa ⭐', 'Incluye Portobello (Chimi + Mojo) + segunda proteína con sabor por defecto.', 'cards', 5),
('torre', 'Torre Pizza 🍕', 'Res con salsa de tomate, parmesano y manchego. Extras: +$5 (Extremo +$10).', 'cards', 6),
('papas', 'Papas Italianas', 'Base $40. Puedes agregar cualquier sabor (+$5 cada uno; Extremo +$10).', 'list', 7);

-- Items: Sabores
INSERT INTO public.menu_items (id, section_id, name, description, tags, available, sort_order) VALUES
('habanero-extremo', 'sabores', 'Habanero Extremo', 'Muy picante', ARRAY['muy_picante'], true, 0),
('habanero', 'sabores', 'Habanero', 'Picante', ARRAY['picante'], true, 1),
('diabla', 'sabores', 'Diabla', 'Picante', ARRAY['picante'], true, 2),
('tamarindo', 'sabores', 'Tamarindo', 'Dulce', ARRAY['dulce'], true, 3),
('bbq', 'sabores', 'BBQ', 'Agridulce y ahumada', ARRAY['agridulce'], true, 4),
('cilantro', 'sabores', 'Cilantro', 'Fresco y salado', ARRAY['salado'], true, 5),
('chimi', 'sabores', 'Chimi', 'Chimichurri casero', ARRAY['salado'], true, 6),
('mojo', 'sabores', 'Mojo', 'Criolla salada', ARRAY['salado'], true, 7);

-- Precios: Sabores
INSERT INTO public.menu_item_prices (item_id, label, value) VALUES
('habanero-extremo', 'Extra', 10),
('habanero', 'Extra', 5),
('diabla', 'Extra', 5),
('tamarindo', 'Extra', 5),
('bbq', 'Extra', 5),
('cilantro', 'Extra', 5),
('chimi', 'Extra', 5),
('mojo', 'Extra', 5);

-- Items: Clásicas
INSERT INTO public.menu_items (id, section_id, name, description, note, available, sort_order) VALUES
('res', 'clasicas', 'Res', 'Carne 100% res. Elige 1 o más sabores.', 'Primer sabor incluido; cada sabor extra +$5 (Extremo +$10).', true, 0),
('pollo', 'clasicas', 'Pollo', 'Carne 100% pollo. Elige 1 o más sabores.', 'Primer sabor incluido; cada sabor extra +$5 (Extremo +$10).', true, 1);

-- Precios: Clásicas
INSERT INTO public.menu_item_prices (item_id, label, value, sort_order) VALUES
('res', 'Normal', 85, 0),
('res', 'Doble', 125, 1),
('pollo', 'Normal', 90, 0),
('pollo', 'Doble', 130, 1);

-- Items: Mar
INSERT INTO public.menu_items (id, section_id, name, description, includes_list, tags, available, sort_order) VALUES
('camaron', 'mar', 'Camarón', 'Carne 100% camarón.', ARRAY['diabla', 'mojo'], ARRAY['picante', 'salado'], true, 0),
('salmon', 'mar', 'Salmón', 'Carne 100% salmón.', ARRAY['diabla', 'mojo'], ARRAY['picante', 'salado'], true, 1);

-- Precios: Mar
INSERT INTO public.menu_item_prices (item_id, label, value, sort_order) VALUES
('camaron', 'Normal', 135, 0),
('camaron', 'Doble', 220, 1),
('salmon', 'Normal', 135, 0),
('salmon', 'Doble', 220, 1);

-- Items: Vegetariana
INSERT INTO public.menu_items (id, section_id, name, description, includes_list, tags, available, sort_order) VALUES
('portobello', 'veg', 'Portobello', 'Hongos Portobello.', ARRAY['chimi', 'mojo'], ARRAY['vegetariano', 'salado'], true, 0);

-- Precios: Vegetariana
INSERT INTO public.menu_item_prices (item_id, label, value, sort_order) VALUES
('portobello', 'Normal', 85, 0),
('portobello', 'Doble', 110, 1);

-- Items: Light
INSERT INTO public.menu_items (id, section_id, name, description, includes_list, badges, available, sort_order) VALUES
('light-res', 'light', 'Res (Light)', 'Elige 1 o más sabores. Primer sabor incluido; extras +$5 (Extremo +$10).', NULL, ARRAY['light'], true, 0),
('light-pollo', 'light', 'Pollo (Light)', 'Elige 1 o más sabores. Primer sabor incluido; extras +$5 (Extremo +$10).', NULL, ARRAY['light'], true, 1),
('light-camaron', 'light', 'Camarón (Light)', 'Incluye: Diabla + Mojo. Puedes agregar sabores extra.', ARRAY['diabla', 'mojo'], ARRAY['light'], true, 2),
('light-salmon', 'light', 'Salmón (Light)', 'Incluye: Diabla + Mojo. Puedes agregar sabores extra.', ARRAY['diabla', 'mojo'], ARRAY['light'], true, 3),
('light-portobello', 'light', 'Portobello (Light)', 'Incluye: Chimi + Mojo. Puedes agregar sabores extra.', ARRAY['chimi', 'mojo'], ARRAY['light', 'vegetariano'], true, 4);

-- Precios: Light
INSERT INTO public.menu_item_prices (item_id, label, value) VALUES
('light-res', NULL, 90),
('light-pollo', NULL, 95),
('light-camaron', NULL, 115),
('light-salmon', NULL, 115),
('light-portobello', NULL, 95);

-- Items: Casa
INSERT INTO public.menu_items (id, section_id, name, description, includes_list, tags, badges, available, sort_order) VALUES
('casa-res', 'casa', 'La Casa (con Res)', 'Portobello + Res con sabor Habanero.', ARRAY['chimi', 'mojo', 'habanero'], ARRAY['picante', 'salado'], ARRAY['estrella'], true, 0),
('casa-pollo', 'casa', 'La Casa (con Pollo)', 'Portobello + Pollo con sabor Habanero.', ARRAY['chimi', 'mojo', 'habanero'], ARRAY['picante', 'salado'], ARRAY['estrella'], true, 1),
('casa-camaron', 'casa', 'La Casa (con Camarón)', 'Portobello + Camarón con Diabla + Mojo.', ARRAY['chimi', 'mojo', 'diabla', 'mojo'], ARRAY['picante', 'salado'], ARRAY['estrella'], true, 2),
('casa-salmon', 'casa', 'La Casa (con Salmón)', 'Portobello + Salmón con Diabla + Mojo.', ARRAY['chimi', 'mojo', 'diabla', 'mojo'], ARRAY['picante', 'salado'], ARRAY['estrella'], true, 3);

-- Precios: Casa
INSERT INTO public.menu_item_prices (item_id, label, value) VALUES
('casa-res', NULL, 135),
('casa-pollo', NULL, 125),
('casa-camaron', NULL, 160),
('casa-salmon', NULL, 160);

-- Items: Torre
INSERT INTO public.menu_items (id, section_id, name, description, tags, badges, available, sort_order) VALUES
('torre-normal', 'torre', 'Torre Pizza', 'Receta fija. Puedes agregar sabores extra (mismos costos).', ARRAY['agridulce', 'salado'], ARRAY['torre'], true, 0),
('torre-doble', 'torre', 'Torre Pizza Doble', 'Duplica proteína/queso/salsa. Puedes agregar sabores extra (mismos costos).', ARRAY['agridulce', 'salado'], ARRAY['torre', 'doble'], true, 1);

-- Precios: Torre
INSERT INTO public.menu_item_prices (item_id, label, value) VALUES
('torre-normal', NULL, 100),
('torre-doble', NULL, 130);

-- Items: Papas
INSERT INTO public.menu_items (id, section_id, name, description, available, sort_order) VALUES
('papas-italianas', 'papas', 'Papas Italianas', 'Papas a la francesa. Agrega sabores a tu gusto.', true, 0);

-- Precios: Papas
INSERT INTO public.menu_item_prices (item_id, label, value) VALUES
('papas-italianas', NULL, 40);
