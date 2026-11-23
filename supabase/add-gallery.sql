-- The Safehouse — add gallery column to products
-- Run once: Supabase Dashboard → SQL Editor → New query → paste → Run.
-- Safe to re-run (uses IF NOT EXISTS).
--
-- gallery stores an ordered list of public image URLs (from Supabase Storage
-- or any CDN). Slide order = array order. When null or empty the storefront
-- falls back to image_url automatically.
--
-- To set a gallery for a product after uploading images:
--
--   update public.products
--   set gallery = ARRAY[
--     'https://[project].supabase.co/storage/v1/object/public/products/[img1].jpg',
--     'https://[project].supabase.co/storage/v1/object/public/products/[img2].jpg'
--   ]
--   where slug = 'your-product-slug';

alter table public.products
  add column if not exists gallery text[];
