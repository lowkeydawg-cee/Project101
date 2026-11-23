-- The Safehouse — add glb_url to products
-- Run once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
-- Safe to re-run (uses IF NOT EXISTS).
--
-- After running this, you can upload a .glb file for any product to
-- Supabase Storage (bucket: products-3d or any public bucket) and set
-- the public URL here:
--
--   update public.products
--   set glb_url = 'https://[project].supabase.co/storage/v1/object/public/products-3d/[filename].glb'
--   where slug = 'your-product-slug';
--
-- The storefront falls back to the product photo when glb_url is null.

alter table public.products
  add column if not exists glb_url text;
