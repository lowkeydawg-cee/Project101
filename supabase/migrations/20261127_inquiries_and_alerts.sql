-- Contact and quote messages are saved in public.inquiries, and every new
-- order, payment ID and message triggers the "notify" Edge Function
-- (supabase/functions/notify), which sends the WhatsApp and email alerts.

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('Contact','Custom quote')),
  name text not null,
  email text not null,
  phone text,
  message text not null,
  details jsonb not null default '{}'::jsonb,
  file_url text,
  status text not null default 'new' check (status in ('new','replied','closed')),
  created_at timestamptz not null default now()
);
alter table public.inquiries enable row level security;

drop policy if exists "admin reads inquiries" on public.inquiries;
create policy "admin reads inquiries" on public.inquiries for select using (public.is_admin());
drop policy if exists "admin updates inquiries" on public.inquiries;
create policy "admin updates inquiries" on public.inquiries for update using (public.is_admin()) with check (public.is_admin());

create or replace function public.submit_inquiry(
  p_kind text, p_name text, p_email text, p_phone text, p_message text,
  p_details jsonb default '{}'::jsonb, p_file_url text default null
) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if p_kind not in ('Contact','Custom quote') then raise exception 'bad kind'; end if;
  if coalesce(length(trim(p_name)),0) not between 1 and 120 then raise exception 'name'; end if;
  if p_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' or length(p_email) > 200 then raise exception 'email'; end if;
  if coalesce(length(trim(p_message)),0) not between 1 and 5000 then raise exception 'message'; end if;
  if length(coalesce(p_phone,'')) > 40 then raise exception 'phone'; end if;
  if length(coalesce(p_details::text,'')) > 4000 then raise exception 'details'; end if;
  if p_file_url is not null and p_file_url !~ '^https://[a-z0-9]+\.supabase\.co/storage/' then raise exception 'file'; end if;
  if (select count(*) from inquiries where email = lower(p_email) and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'too many messages, try WhatsApp';
  end if;
  insert into inquiries(kind,name,email,phone,message,details,file_url)
  values (p_kind, trim(p_name), lower(trim(p_email)), nullif(trim(p_phone),''), trim(p_message), coalesce(p_details,'{}'::jsonb), p_file_url)
  returning id into v_id;
  return v_id;
end $$;
revoke all on function public.submit_inquiry(text,text,text,text,text,jsonb,text) from public;
grant execute on function public.submit_inquiry(text,text,text,text,text,jsonb,text) to anon, authenticated;

create extension if not exists pg_net with schema extensions;

do $$ begin
  if not exists (select 1 from vault.secrets where name = 'notify_secret') then
    perform vault.create_secret(encode(extensions.gen_random_bytes(24),'hex'), 'notify_secret');
  end if;
end $$;

create or replace function public.fire_notify() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_kind text; v_secret text;
begin
  if tg_table_name = 'inquiries' then v_kind := 'inquiry';
  elsif tg_op = 'INSERT' then v_kind := 'order';
  elsif new.payment_ref is not null and new.payment_ref is distinct from old.payment_ref then v_kind := 'payment_ref';
  else return new;
  end if;
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'notify_secret';
  perform net.http_post(
    url := 'https://vkidjcyslnjyucyvykko.supabase.co/functions/v1/notify',
    headers := jsonb_build_object('Content-Type','application/json','x-notify-secret', v_secret),
    body := jsonb_build_object('kind', v_kind, 'id', new.id)
  );
  return new;
exception when others then
  return new; -- an alert problem must never block an order
end $$;
revoke all on function public.fire_notify() from public, anon, authenticated;

drop trigger if exists notify_order_insert on public.orders;
create trigger notify_order_insert after insert on public.orders
  for each row execute function public.fire_notify();
drop trigger if exists notify_order_payment on public.orders;
create trigger notify_order_payment after update of payment_ref on public.orders
  for each row execute function public.fire_notify();
drop trigger if exists notify_inquiry on public.inquiries;
create trigger notify_inquiry after insert on public.inquiries
  for each row execute function public.fire_notify();

create or replace function public.notify_secret_ok(p text) returns boolean
language sql security definer set search_path = public as $$
  select exists(select 1 from vault.decrypted_secrets where name='notify_secret' and decrypted_secret = p)
$$;
revoke all on function public.notify_secret_ok(text) from public, anon, authenticated;
grant execute on function public.notify_secret_ok(text) to service_role;

-- Mixtape is a desk piece; its catalogue code said toy.
update public.products set catalog_no = 'SH-DK-001' where slug = 'mixtape' and catalog_no = 'SH-TY-005';
