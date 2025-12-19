-- Migration: Create POS Accounts Tables
-- Description: Creates tables for managing POS accounts (orders) and their items
-- Date: 2025-12-18

-- Create pos_accounts table
CREATE TABLE IF NOT EXISTS pos_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('dine_in', 'takeout')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  notes TEXT
);

-- Create index on status for faster queries of open accounts
CREATE INDEX IF NOT EXISTS idx_pos_accounts_status ON pos_accounts(status);

-- Create index on created_at for ordering
CREATE INDEX IF NOT EXISTS idx_pos_accounts_created_at ON pos_accounts(created_at DESC);

-- Create pos_account_items table
CREATE TABLE IF NOT EXISTS pos_account_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES pos_accounts(id) ON DELETE CASCADE,
  product_id UUID REFERENCES v2_products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES v2_product_variants(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  modifiers JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on account_id for faster item queries
CREATE INDEX IF NOT EXISTS idx_pos_account_items_account_id ON pos_account_items(account_id);

-- Enable Row Level Security
ALTER TABLE pos_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_account_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pos_accounts
-- Allow authenticated users to read all accounts
CREATE POLICY "Allow authenticated users to read accounts"
  ON pos_accounts
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to create accounts
CREATE POLICY "Allow authenticated users to create accounts"
  ON pos_accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Allow authenticated users to update accounts they created
CREATE POLICY "Allow users to update their own accounts"
  ON pos_accounts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- RLS Policies for pos_account_items
-- Allow authenticated users to read all items
CREATE POLICY "Allow authenticated users to read account items"
  ON pos_account_items
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert items to any account
CREATE POLICY "Allow authenticated users to insert account items"
  ON pos_account_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update items
CREATE POLICY "Allow authenticated users to update account items"
  ON pos_account_items
  FOR UPDATE
  TO authenticated
  USING (true);

-- Allow authenticated users to delete items
CREATE POLICY "Allow authenticated users to delete account items"
  ON pos_account_items
  FOR DELETE
  TO authenticated
  USING (true);

-- Add helpful comments
COMMENT ON TABLE pos_accounts IS 'POS customer accounts/orders with status tracking and payment information';
COMMENT ON TABLE pos_account_items IS 'Line items for POS accounts including products, variants, and modifiers';
COMMENT ON COLUMN pos_accounts.service_type IS 'Type of service: dine_in (Aquí) or takeout (Para Llevar)';
COMMENT ON COLUMN pos_accounts.status IS 'Account status: open or closed';
COMMENT ON COLUMN pos_accounts.total_amount IS 'Total amount of all items in the account';
COMMENT ON COLUMN pos_accounts.paid_amount IS 'Amount already paid by customer';
COMMENT ON COLUMN pos_account_items.modifiers IS 'JSON array of modifier selections with modifier_id and quantity';
