-- Script SQL para agregar las columnas 'available' e 'image_url' a la tabla 'products'
-- Ejecuta este script en tu consola de Supabase cuando estés listo

-- Agregar columna 'available' (por defecto true)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS available BOOLEAN DEFAULT true NOT NULL;

-- Agregar columna 'image_url' (puede ser null)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Comentarios para documentar las columnas
COMMENT ON COLUMN products.available IS 'Indica si el producto está disponible para ordenar';
COMMENT ON COLUMN products.image_url IS 'URL de la imagen del producto';
