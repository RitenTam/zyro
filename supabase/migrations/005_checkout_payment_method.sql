-- Add payment_method to orders for checkout flows that do not rely on Stripe

alter table if exists public.orders
  add column if not exists payment_method text;

update public.orders
set payment_method = coalesce(payment_method, 'cash_on_delivery')
where payment_method is null and payment_status = 'pending';
