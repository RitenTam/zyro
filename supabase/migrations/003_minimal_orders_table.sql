-- Minimal Orders Table Migration
-- Creates only the order_status enum and orders table
-- No RLS, policies, or indexes

-- Create enum for order status
CREATE TYPE IF NOT EXISTS order_status AS ENUM (
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled'
);

-- Create orders table
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
