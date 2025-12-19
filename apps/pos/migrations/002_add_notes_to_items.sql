-- Migration: Add notes to pos_account_items
-- Description: Adds a notes column to store special instructions/exclusions per item
-- Date: 2025-12-18

ALTER TABLE pos_account_items 
ADD COLUMN IF NOT EXISTS notes TEXT;

COMMENT ON COLUMN pos_account_items.notes IS 'Special instructions or exclusions for the item (comma separated)';
