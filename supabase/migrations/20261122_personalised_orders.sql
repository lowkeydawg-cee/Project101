-- The Safehouse: personalised orders + product galleries.
-- Safe to run more than once. Ship together with the site update that sends `personalisation`.
--
-- What changes:
--   products.gallery        text[]  slide image URLs (in order)
--   products.personalise    jsonb   fields a customer fills in, e.g. [{"key":"name","label":"Name","max":32,"required":true}]
--   order_items.personalisation jsonb  what the customer typed, only allowed keys, trimmed and length-limited
--   place_order             now records product_id, stores personalisation, enforces required fields,
--                           and rate-limits to 5 orders per phone number per 10 minutes
-- Old checkout calls keep working: items without `personalisation` are accepted
-- unless the product has required personalisation fields.

alter table public.products    add column if not exists gallery text[];
alter table public.products    add column if not exists personalise jsonb not null default '[]'::jsonb;
alter table public.order_items add column if not exists personalisation jsonb;

update public.products set personalise = '[{"key":"link","label":"Link or payment code for the QR","max":200,"required":true}]'
 where slug = 'connect-display';
update public.products set personalise = '[{"key":"name","label":"Name","max":32,"required":true},{"key":"title","label":"Title","max":40,"required":false}]'
 where slug = 'signature-nameplate';

create or replace function public.place_order(
  p_customer_name text, p_customer_phone text, p_customer_email text,
  p_delivery_method text, p_delivery_address text, p_items jsonb)
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
  v_field jsonb;
  v_val text;
  v_pers jsonb;
begin
  if coalesce(trim(p_customer_name), '') = ''
     or coalesce(trim(p_customer_phone), '') = ''
     or coalesce(trim(p_customer_email), '') = '' then
    raise exception 'Name, phone and email are required.';
  end if;

  if (select count(*) from orders
       where customer_phone = trim(p_customer_phone)
         and created_at > now() - interval '10 minutes') >= 5 then
    raise exception 'Too many orders from this number. Please wait a few minutes or message us on WhatsApp.';
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

    select id, name, price, personalise into v_product
    from products
    where id = (v_item->>'product_id')::uuid;

    if not found then
      raise exception 'A product in your cart is no longer available.';
    end if;

    -- keep only the fields this product allows; trim, strip control characters, cap length
    v_pers := '{}'::jsonb;
    for v_field in select * from jsonb_array_elements(coalesce(v_product.personalise, '[]'::jsonb)) loop
      v_val := left(regexp_replace(trim(coalesce(v_item->'personalisation'->>(v_field->>'key'), '')),
                                   '[[:cntrl:]]', '', 'g'),
                    coalesce((v_field->>'max')::int, 60));
      if v_val = '' and coalesce((v_field->>'required')::boolean, false) then
        raise exception 'Please fill in "%" for %.', v_field->>'label', v_product.name;
      end if;
      if v_val <> '' then
        v_pers := v_pers || jsonb_build_object(v_field->>'key', v_val);
      end if;
    end loop;

    insert into order_items (order_id, product_id, product_name, quantity, unit_price, personalisation)
    values (v_order_id, v_product.id, v_product.name, v_qty, v_product.price,
            case when v_pers = '{}'::jsonb then null else v_pers end);

    v_subtotal := v_subtotal + v_product.price * v_qty;
    v_lines := v_lines || jsonb_build_object(
      'name', v_product.name, 'quantity', v_qty, 'unit_price', v_product.price,
      'personalisation', case when v_pers = '{}'::jsonb then null else v_pers end
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
