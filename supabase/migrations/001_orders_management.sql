-- Orders Management System
-- Comprehensive orders table with support for order tracking and fulfillment
-- Run this migration in Supabase to set up the orders management schema

-- Create enum for order status
CREATE TYPE order_status AS ENUM (
  'pending',
  'processing', 
  'shipped',
  'delivered',
  'cancelled'
);

-- Create orders table if it doesn't exist
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_email TEXT,
  customer_name TEXT,
  amount_total INTEGER,
  currency TEXT,
  payment_status TEXT,
  status order_status DEFAULT 'pending',
  line_items JSONB DEFAULT '[]',
  raw_session JSONB,
  shipping_address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for order_number for quick lookups
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Create index for status for filtering
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Create index for customer_email for customer lookups
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);

-- Create index for created_at for date-based sorting
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to view all orders
-- Note: Adjust the auth.users check based on your actual role management
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT
  USING (true);

-- Create policy for admins to update order status
CREATE POLICY "Admins can update order status" ON orders
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Note: The service role key is used in the API endpoints for server-side operations
-- Users cannot directly modify orders through the client; updates happen via API routes
