-- Add first-class product color support and persist selected order colors.

alter table if exists public.products
  add column if not exists colors jsonb not null default '[]'::jsonb;

alter table if exists public.order_items
  add column if not exists variant_color text;