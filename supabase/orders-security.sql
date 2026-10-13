-- =====================================================================
-- The Safehouse — orders security + server-side order placement
-- Run once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
-- Safe to re-run.
--
-- What this does:
--   1. Makes sure the orders / order_items tables exist.
--   2. Removes the old "anyone can read/insert orders" policies, so
--      customer names, phones and emails are no longer public.
--   3. Adds place_order(): the browser sends only product ids +
--      quantities; prices and totals are looked up from the products
--      table on the server, so nobody can change a price in their browser.
--   4. Adds get_order_status(): the Order Status page can look up ONE
--      order by its number and only sees status/delivery fields —
--      never the customer's personal details.
--   5. Only the signed-in admin can read and update orders.
-- =====================================================================

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text not null,
  delivery_method text not null,
  delivery_address text,
  subtotal integer not null default 0,
  delivery_fee integer not null default 0,
  total integer not null default 0,
  status text not null default 'received',
  estimated_ready text,
  location text,
  created_at timestamptz default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  product_name text not null,
  quantity integer not null,
  unit_price integer not null
);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Old permissive policies (from the first setup) ----------------------
drop policy if exists "Public can create orders" on public.orders;
drop policy if exists "Public can read own order by number" on public.orders;
drop policy if exists "Authenticated manage orders" on public.orders;
drop policy if exists "Public can create order items" on public.order_items;
drop policy if exists "Public can read order items" on public.order_items;

-- New policies: admin only --------------------------------------------
drop policy if exists "Admin reads orders" on public.orders;
drop policy if exists "Admin updates orders" on public.orders;
drop policy if exists "Admin deletes orders" on public.orders;
drop policy if exists "Admin reads order items" on public.order_items;

create policy "Admin reads orders" on public.orders
  for select to authenticated using (true);
create policy "Admin updates orders" on public.orders
  for update to authenticated using (true) with check (true);
create policy "Admin deletes orders" on public.orders
  for delete to authenticated using (true);
create policy "Admin reads order items" on public.order_items
  for select to authenticated using (true);

-- place_order ----------------------------------------------------------
create or replace function public.place_order(
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text,
  p_delivery_method text,
  p_delivery_address text,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_order_number text;
  v_subtotal integer := 0;
  v_fee integer;
  v_item jsonb;
  v_qty integer;
  v_product record;
  v_lines jsonb := '[]'::jsonb;
begin
  if coalesce(trim(p_customer_name), '') = ''
     or coalesce(trim(p_customer_phone), '') = ''
     or coalesce(trim(p_customer_email), '') = '' then
    raise exception 'Name, phone and email are required.';
  end if;

  if p_delivery_method not in ('pickup', 'delivery') then
    raise exception 'Invalid delivery method.';
  end if;

  if p_delivery_method = 'delivery'
     and coalesce(trim(p_delivery_address), '') = '' then
    raise exception 'A delivery address is required for delivery.';
  end if;

  if p_items is null
     or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) = 0
     or jsonb_array_length(p_items) > 50 then
    raise exception 'Your cart is empty or invalid.';
  end if;

  v_fee := case when p_delivery_method = 'delivery' then 2000 else 0 end;
  v_order_number := 'SH-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

  insert into orders (
    order_number, customer_name, customer_phone, customer_email,
    delivery_method, delivery_address, status
  ) values (
    v_order_number, trim(p_customer_name), trim(p_customer_phone),
    trim(p_customer_email), p_delivery_method,
    case when p_delivery_method = 'delivery' then trim(p_delivery_address) end,
    'received'
  )
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := (v_item->>'quantity')::integer;
    if v_qty is null or v_qty < 1 or v_qty > 99 then
      raise exception 'Invalid quantity.';
    end if;

    if coalesce(v_item->>'product_id', '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
      raise exception 'A product in your cart is no longer available. Please remove it and add it again.';
    end if;

    select id, name, price into v_product
    from products
    where id = (v_item->>'product_id')::uuid;

    if not found then
      raise exception 'A product in your cart is no longer available.';
    end if;

    insert into order_items (order_id, product_name, quantity, unit_price)
    values (v_order_id, v_product.name, v_qty, v_product.price);

    v_subtotal := v_subtotal + v_product.price * v_qty;
    v_lines := v_lines || jsonb_build_object(
      'name', v_product.name, 'quantity', v_qty, 'unit_price', v_product.price
    );
  end loop;

  update orders
  set subtotal = v_subtotal, delivery_fee = v_fee, total = v_subtotal + v_fee
  where id = v_order_id;

  return jsonb_build_object(
    'order_number', v_order_number,
    'subtotal', v_subtotal,
    'delivery_fee', v_fee,
    'total', v_subtotal + v_fee,
    'items', v_lines
  );
end;
$$;

revoke all on function public.place_order(text, text, text, text, text, jsonb) from public;
grant execute on function public.place_order(text, text, text, text, text, jsonb) to anon, authenticated;

-- get_order_status -----------------------------------------------------
create or replace function public.get_order_status(p_order_number text)
returns table (
  order_number text,
  status text,
  estimated_ready text,
  location text,
  delivery_method text
)
language sql
security definer
set search_path = public
as $$
  select o.order_number, o.status, o.estimated_ready, o.location, o.delivery_method
  from orders o
  where o.order_number = upper(trim(p_order_number))
  limit 1;
$$;

revoke all on function public.get_order_status(text) from public;
grant execute on function public.get_order_status(text) to anon, authenticated;
