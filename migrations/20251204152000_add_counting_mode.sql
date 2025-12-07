ALTER TABLE supplies 
ADD COLUMN counting_mode text NOT NULL DEFAULT 'integer' 
CHECK (counting_mode IN ('integer', 'fraction', 'fuzzy'));
