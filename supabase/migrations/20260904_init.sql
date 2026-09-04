-- The Safe House — schema, storage, and Row Level Security
-- Run this in the Supabase SQL editor (or via supabase db push).
--
-- After the first admin signs up at /login, promote that account:
--   insert into public.admin_users (user_id)
--   select id from auth.users where email = 'you@example.com'
--   on conflict do nothing;
-- If the admin_users table is empty, the first authenticated user
-- can self-promote once from the admin dashboard.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'Decor',
  price numeric(12, 2) not null check (price >= 0),
  description text not null default '',
  status text not null default 'In Stock',
  inventory integer not null default 0 check (inventory >= 0),
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  label text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  customer_name text not null,
  phone text not null,
  address text not null,
  notes text not null default '',
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at
before update on public.products
for each row execute procedure public.touch_updated_at();

-- First authenticated user may claim admin if nobody is admin yet.
create or replace function public.claim_first_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return false;
  end if;
  if exists (select 1 from public.admin_users) then
    return public.is_admin();
  end if;
  insert into public.admin_users (user_id) values (auth.uid())
  on conflict do nothing;
  return true;
end;
$$;

grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.claim_first_admin() to authenticated;

grant usage on schema public to anon, authenticated;
grant select on table public.products, public.categories, public.payment_methods to anon, authenticated;
grant insert on table public.orders to anon, authenticated;
grant select, insert, update, delete on table public.products, public.categories, public.payment_methods, public.orders, public.admin_users to authenticated;

-- ---------------------------------------------------------------------------
-- Seed catalog metadata
-- ---------------------------------------------------------------------------

insert into public.categories (name, slug) values
  ('Lighting', 'lighting'),
  ('Workspace', 'workspace'),
  ('Decor', 'decor'),
  ('Interior', 'interior')
on conflict (name) do nothing;

insert into public.payment_methods (label) values
  ('MTN Mobile Money'),
  ('Airtel Money'),
  ('Bank Transfer (RWF)')
on conflict (label) do nothing;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Public/anonymous: SELECT products + categories (+ payment labels for checkout).
-- Writes: authenticated admins only (is_admin()).
-- Orders: anyone may INSERT a request; only admins may read/update.
-- ---------------------------------------------------------------------------

alter table public.admin_users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.payment_methods enable row level security;
alter table public.orders enable row level security;

drop policy if exists "admins_select_self" on public.admin_users;
create policy "admins_select_self"
on public.admin_users for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "admins_insert_by_admin" on public.admin_users;
create policy "admins_insert_by_admin"
on public.admin_users for insert
to authenticated
with check (public.is_admin() or not exists (select 1 from public.admin_users));

drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read"
on public.categories for select
to anon, authenticated
using (true);

drop policy if exists "categories_admin_write" on public.categories;
create policy "categories_admin_write"
on public.categories for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "products_public_read" on public.products;
create policy "products_public_read"
on public.products for select
to anon, authenticated
using (true);

drop policy if exists "products_admin_insert" on public.products;
create policy "products_admin_insert"
on public.products for insert
to authenticated
with check (auth.role() = 'authenticated' and public.is_admin());

drop policy if exists "products_admin_update" on public.products;
create policy "products_admin_update"
on public.products for update
to authenticated
using (auth.role() = 'authenticated' and public.is_admin())
with check (auth.role() = 'authenticated' and public.is_admin());

drop policy if exists "products_admin_delete" on public.products;
create policy "products_admin_delete"
on public.products for delete
to authenticated
using (auth.role() = 'authenticated' and public.is_admin());

drop policy if exists "payments_public_read" on public.payment_methods;
create policy "payments_public_read"
on public.payment_methods for select
to anon, authenticated
using (true);

drop policy if exists "payments_admin_write" on public.payment_methods;
create policy "payments_admin_write"
on public.payment_methods for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "orders_public_insert" on public.orders;
create policy "orders_public_insert"
on public.orders for insert
to anon, authenticated
with check (true);

drop policy if exists "orders_admin_read" on public.orders;
create policy "orders_admin_read"
on public.orders for select
to authenticated
using (public.is_admin());

drop policy if exists "orders_admin_update" on public.orders;
create policy "orders_admin_update"
on public.orders for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "orders_admin_delete" on public.orders;
create policy "orders_admin_delete"
on public.orders for delete
to authenticated
using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage: public read, admin write for product images
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read"
on storage.objects for select
using (bucket_id = 'product-images');

drop policy if exists "product_images_admin_insert" on storage.objects;
create policy "product_images_admin_insert"
on storage.objects for insert
to authenticated
with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product_images_admin_update" on storage.objects;
create policy "product_images_admin_update"
on storage.objects for update
to authenticated
using (bucket_id = 'product-images' and public.is_admin())
with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product_images_admin_delete" on storage.objects;
create policy "product_images_admin_delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'product-images' and public.is_admin());

do $$
begin
  alter publication supabase_realtime add table public.products;
exception
  when duplicate_object then null;
end $$;
