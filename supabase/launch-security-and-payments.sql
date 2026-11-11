-- =====================================================================
-- The Safehouse: admin lockdown + manual MTN MoMo payments
-- Run once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
-- Safe to re-run.
--
-- BEFORE YOU RUN IT: change the email on the line marked  ← CHANGE THIS
-- to the email you sign in to /admin with. The script stops before
-- changing any permission if that email has no Supabase account, so it
-- can never lock you out of your own dashboard.
--
-- What this does:
--   1. Adds an admin list. Until now every signed-in account counted as
--      admin, so anyone who signed up could read customer orders and edit
--      or delete products. Now only accounts on the list can.
--   2. Puts orders, order items, products, product photos and quote files
--      behind that list. The public can still browse products and photos.
--   3. Adds payment tracking to orders: awaiting payment, paid, expired.
--      Orders not paid within 48 hours count as expired.
--   4. Lets a customer paste the MoMo transaction ID from their SMS onto
--      their order, so you can match the payment in admin.
-- =====================================================================


-- 1. THE ADMIN LIST ----------------------------------------------------

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  added_at timestamptz not null default now()
);

-- RLS on with no policies: nobody can read or edit this table through
-- the API. Only the is_admin() check below looks inside it.
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

insert into public.admins (user_id)
select id from auth.users
where lower(email) = lower('YOUR-ADMIN-EMAIL@example.com')   -- ← CHANGE THIS
on conflict do nothing;

do $$
begin
  if not exists (select 1 from public.admins) then
    raise exception
      'No admin was added. Change YOUR-ADMIN-EMAIL@example.com to the email you sign in to /admin with, then run this again. Nothing else was changed.';
  end if;
end $$;


-- 2. ORDERS AND ORDER ITEMS: ADMIN ONLY --------------------------------

drop policy if exists "Admin reads orders" on public.orders;
drop policy if exists "Admin updates orders" on public.orders;
drop policy if exists "Admin deletes orders" on public.orders;
drop policy if exists "Admin reads order items" on public.order_items;

create policy "Admin reads orders" on public.orders
  for select to authenticated using (public.is_admin());
create policy "Admin updates orders" on public.orders
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admin deletes orders" on public.orders
  for delete to authenticated using (public.is_admin());
create policy "Admin reads order items" on public.order_items
  for select to authenticated using (public.is_admin());


-- 3. PRODUCTS: ANYONE READS, ONLY ADMIN WRITES -------------------------
-- The earlier product policies were created by hand, so their names are
-- not known here. Drop every policy on products and recreate them.

do $$
declare p record;
begin
  for p in select policyname from pg_policies
           where schemaname = 'public' and tablename = 'products' loop
    execute format('drop policy if exists %I on public.products', p.policyname);
  end loop;
end $$;

alter table public.products enable row level security;

create policy "Anyone reads products" on public.products
  for select to anon, authenticated using (true);
create policy "Admin adds products" on public.products
  for insert to authenticated with check (public.is_admin());
create policy "Admin edits products" on public.products
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admin removes products" on public.products
  for delete to authenticated using (public.is_admin());


-- 4. PRODUCT PHOTOS AND QUOTE FILES ------------------------------------
-- Replace any storage policy that mentions the product-images bucket,
-- and the quote-files delete policy, with admin-only versions.

do $$
declare p record;
begin
  for p in select policyname from pg_policies
           where schemaname = 'storage' and tablename = 'objects'
             and (coalesce(qual, '') ilike '%product-images%'
                  or coalesce(with_check, '') ilike '%product-images%') loop
    execute format('drop policy if exists %I on storage.objects', p.policyname);
  end loop;
end $$;

create policy "Anyone views product photos" on storage.objects
  for select to anon, authenticated using (bucket_id = 'product-images');
create policy "Admin uploads product photos" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images' and public.is_admin());
create policy "Admin replaces product photos" on storage.objects
  for update to authenticated using (bucket_id = 'product-images' and public.is_admin());
create policy "Admin removes product photos" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "only admins remove quote files" on storage.objects;
create policy "only admins remove quote files" on storage.objects
  for delete to authenticated using (bucket_id = 'quote-files' and public.is_admin());


-- 5. PAYMENT TRACKING ON ORDERS ----------------------------------------

alter table public.orders add column if not exists payment_status text not null default 'awaiting_payment';
alter table public.orders drop constraint if exists orders_payment_status_check;
alter table public.orders add constraint orders_payment_status_check
  check (payment_status in ('awaiting_payment', 'paid', 'expired', 'refunded'));

-- What the customer pasted from their MoMo SMS (unverified).
alter table public.orders add column if not exists payment_ref text;
-- What you confirmed against your own MoMo statement.
alter table public.orders add column if not exists momo_txn_id text;
alter table public.orders add column if not exists paid_at timestamptz;
-- Deadline to pay. Orders older than this count as expired.
alter table public.orders add column if not exists pay_by timestamptz;

update public.orders set pay_by = created_at + interval '48 hours' where pay_by is null;
alter table public.orders alter column pay_by set default (now() + interval '48 hours');


-- 6. ORDER STATUS PAGE: NOW ALSO SHOWS WHAT IS OWED --------------------
-- Still returns no name, phone, email or address.

drop function if exists public.get_order_status(text);

create function public.get_order_status(p_order_number text)
returns table (
  order_number text,
  status text,
  estimated_ready text,
  location text,
  delivery_method text,
  total integer,
  payment_status text,
  pay_by timestamptz,
  payment_ref_sent boolean
)
language sql
security definer
set search_path = public
as $$
  select
    o.order_number,
    o.status,
    o.estimated_ready,
    o.location,
    o.delivery_method,
    o.total,
    case
      when o.payment_status = 'awaiting_payment' and o.pay_by < now() then 'expired'
      else o.payment_status
    end,
    o.pay_by,
    o.payment_ref is not null
  from public.orders o
  where o.order_number = upper(trim(p_order_number))
  limit 1;
$$;

revoke all on function public.get_order_status(text) from public;
grant execute on function public.get_order_status(text) to anon, authenticated;


-- 7. CUSTOMER SENDS THEIR MOMO TRANSACTION ID --------------------------
-- Only works while the order is still waiting for payment. Anyone who
-- knows the order number can send one; you check it against your MoMo
-- statement before marking the order paid, so a wrong ID changes nothing.

create or replace function public.submit_payment_ref(p_order_number text, p_ref text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ref text := upper(regexp_replace(coalesce(p_ref, ''), '\s', '', 'g'));
begin
  if v_ref !~ '^[A-Z0-9.\-]{6,40}$' then
    raise exception 'That does not look like a MoMo transaction ID. Copy the ID from the payment SMS.';
  end if;

  update public.orders
  set payment_ref = v_ref
  where order_number = upper(trim(p_order_number))
    and payment_status = 'awaiting_payment'
    and pay_by > now();

  if not found then
    raise exception 'This order is not waiting for payment. Message us on WhatsApp if you have already paid.';
  end if;

  return true;
end;
$$;

revoke all on function public.submit_payment_ref(text, text) from public;
grant execute on function public.submit_payment_ref(text, text) to anon, authenticated;


-- OPTIONAL: mark unpaid orders as expired in the table itself every hour.
-- The site already treats them as expired after 48 hours, so this only
-- tidies the admin list. Needs the pg_cron extension (Database →
-- Extensions → pg_cron). Remove the two dashes in front to use it.
--
-- select cron.schedule('expire-unpaid-orders', '7 * * * *',
--   $$update public.orders set payment_status = 'expired'
--     where payment_status = 'awaiting_payment' and pay_by < now()$$);
