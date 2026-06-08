-- Comprehensive Orders Management System Schema
-- Includes orders table, order_items table, RLS policies, and indexes
-- Run this migration in Supabase to set up the complete orders management system

-- Create enum for order status if it doesn't exist
CREATE TYPE IF NOT EXISTS order_status AS ENUM (
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled'
);

-- ============================================================================
-- ORDERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL UNIQUE,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  status order_status DEFAULT 'pending',
  subtotal INTEGER NOT NULL DEFAULT 0,
  shipping_cost INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  payment_status TEXT,
  payment_intent_id TEXT,
  shipping_address JSONB,
  line_items JSONB DEFAULT '[]',
  raw_session JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes on orders table
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_updated_at ON orders(updated_at DESC);

-- ============================================================================
-- ORDER_ITEMS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  product_sku TEXT,
  variant_id TEXT,
  variant_name TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price INTEGER NOT NULL CHECK (unit_price >= 0),
  subtotal INTEGER NOT NULL CHECK (subtotal >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes on order_items table
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_created_at ON order_items(created_at DESC);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES FOR ORDERS TABLE
-- ============================================================================

-- Policy: Customers can view only their own orders
CREATE POLICY "Customers can view their own orders" ON orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Admins can view all orders
-- Checks profiles.role = 'admin' for the authenticated user
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Policy: Customers can insert their own orders
CREATE POLICY "Customers can create their own orders" ON orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can update any order
CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Policy: Admins can delete orders
CREATE POLICY "Admins can delete orders" ON orders
  FOR DELETE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- ============================================================================
-- RLS POLICIES FOR ORDER_ITEMS TABLE
-- ============================================================================

-- Policy: Customers can view items from their own orders
CREATE POLICY "Customers can view items from their own orders" ON order_items
  FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders WHERE auth.uid() = user_id
    )
  );

-- Policy: Admins can view all order items
-- Checks profiles.role = 'admin' for the authenticated user
CREATE POLICY "Admins can view all order items" ON order_items
  FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Policy: Customers can insert items into their own orders
CREATE POLICY "Customers can create order items for their orders" ON order_items
  FOR INSERT
  WITH CHECK (
    order_id IN (
      SELECT id FROM orders WHERE auth.uid() = user_id
    )
  );

-- Policy: Admins can insert items
CREATE POLICY "Admins can create order items" ON order_items
  FOR INSERT
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Policy: Admins can update order items
CREATE POLICY "Admins can update order items" ON order_items
  FOR UPDATE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Policy: Admins can delete order items
CREATE POLICY "Admins can delete order items" ON order_items
  FOR DELETE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- ============================================================================
-- NOTES
-- ============================================================================
-- 
-- ADMIN DETECTION:
-- This schema uses the profiles table for admin detection:
-- - profiles.id = auth.uid()
-- - profiles.role = 'admin' (or other role values)
--
-- RLS policies check: (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
--
-- PRICING FIELDS:
-- All price fields (unit_price, subtotal, shipping_cost, total) are stored as INTEGER
-- in cents/smallest currency unit (e.g., $10.00 = 1000 cents).
-- This avoids floating-point precision issues.
--
-- FOREIGN KEYS:
-- - orders.user_id → auth.users.id (CASCADE on delete)
-- - order_items.order_id → orders.id (CASCADE on delete)
-- - order_items.product_id is stored as TEXT (not a foreign key) to allow:
--   * Archiving products without deleting order history
--   * Flexibility for external product systems
--
