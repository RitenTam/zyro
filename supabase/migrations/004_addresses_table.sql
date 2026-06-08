-- 004_addresses_table.sql
-- Create a dedicated addresses table for user shipping addresses and migrate any existing profile address JSON data.

create table if not exists public.addresses (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  recipient text not null,
  phone text not null,
  line1 text not null,
  line2 text,
  city text not null,
  region text not null,
  postal_code text not null,
  country text not null,
  delivery_notes text,
  default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists addresses_user_default_unique on public.addresses (user_id) where default;

create function if not exists public.set_updated_at_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger if not exists addresses_set_updated_at
before update on public.addresses
for each row
execute function public.set_updated_at_timestamp();

alter table public.addresses enable row level security;

create policy if not exists "Allow users to select their own addresses"
  on public.addresses
  for select
  using (auth.uid() = user_id);

create policy if not exists "Allow users to insert their own addresses"
  on public.addresses
  for insert
  with check (auth.uid() = user_id);

create policy if not exists "Allow users to update their own addresses"
  on public.addresses
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy if not exists "Allow users to delete their own addresses"
  on public.addresses
  for delete
  using (auth.uid() = user_id);

-- Migrate existing JSON addresses from profiles.addresses if the column exists.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'addresses'
  ) then
    with profile_addresses as (
      select id as user_id, addresses
      from public.profiles
      where addresses is not null
        and jsonb_typeof(addresses) = 'array'
    ), flattened as (
      select
        coalesce(elem->>'id', gen_random_uuid()::text) as id,
        user_id,
        elem->>'label' as label,
        elem->>'recipient' as recipient,
        elem->>'phone' as phone,
        elem->>'line1' as line1,
        elem->>'line2' as line2,
        elem->>'city' as city,
        elem->>'region' as region,
        elem->>'postalCode' as postal_code,
        elem->>'country' as country,
        elem->>'deliveryNotes' as delivery_notes,
        coalesce((elem->>'default')::boolean, false) as default,
        now() as created_at,
        now() as updated_at
      from profile_addresses,
      jsonb_array_elements(addresses) as elem
    )
    insert into public.addresses (
      id, user_id, label, recipient, phone, line1, line2, city, region,
      postal_code, country, delivery_notes, default, created_at, updated_at
    )
    select * from flattened
    on conflict (id) do nothing;

    alter table public.profiles drop column if exists addresses;
  end if;
end;
$$;
