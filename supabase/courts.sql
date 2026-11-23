-- Arena Court (SH-TY-002). Run after the files are live on www.safehouse.rw.
update public.products set
  catalog_no = 'SH-TY-002',
  name = 'Arena Court',
  category = 'Toys',
  price = 25000,
  description = 'A half court for the desk, marked to real proportions: three-point line, key, free-throw circle and restricted area. Pro stanchion with a padded base, a backboard with the shooter''s square, a woven net and a ball. Slots together, no glue needed for the stand.',
  material = 'PLA',
  finish = 'Black floor, white lines, red key, white board',
  image_url = 'https://www.safehouse.rw/products/v3/arena-court/01.webp',
  gallery = array['https://www.safehouse.rw/products/v3/arena-court/01.webp','https://www.safehouse.rw/products/v3/arena-court/02.webp','https://www.safehouse.rw/products/v3/arena-court/03.webp','https://www.safehouse.rw/products/v3/arena-court/04.webp']::text[],
  glb_url = 'https://www.safehouse.rw/products/v3/arena-court/model.glb',
  personalise = '[]'::jsonb
where slug = 'arena-court';
insert into public.products (slug, catalog_no, name, category, price, description, material, finish, image_url, gallery, glb_url, personalise)
select 'arena-court', 'SH-TY-002', 'Arena Court', 'Toys', 25000, 'A half court for the desk, marked to real proportions: three-point line, key, free-throw circle and restricted area. Pro stanchion with a padded base, a backboard with the shooter''s square, a woven net and a ball. Slots together, no glue needed for the stand.', 'PLA', 'Black floor, white lines, red key, white board', 'https://www.safehouse.rw/products/v3/arena-court/01.webp', array['https://www.safehouse.rw/products/v3/arena-court/01.webp','https://www.safehouse.rw/products/v3/arena-court/02.webp','https://www.safehouse.rw/products/v3/arena-court/03.webp','https://www.safehouse.rw/products/v3/arena-court/04.webp']::text[], 'https://www.safehouse.rw/products/v3/arena-court/model.glb', '[]'::jsonb
where not exists (select 1 from public.products where slug = 'arena-court');
-- Full Court (SH-TY-003). Run after the files are live on www.safehouse.rw.
update public.products set
  catalog_no = 'SH-TY-003',
  name = 'Full Court',
  category = 'Toys',
  price = 28000,
  description = 'A full court for the shelf or desk, both halves marked to real proportions with a hoop at each end, woven nets and a ball at centre court.',
  material = 'PLA',
  finish = 'Black floor, white lines, blue keys, red centre',
  image_url = 'https://www.safehouse.rw/products/v3/full-court/01.webp',
  gallery = array['https://www.safehouse.rw/products/v3/full-court/01.webp','https://www.safehouse.rw/products/v3/full-court/02.webp','https://www.safehouse.rw/products/v3/full-court/03.webp','https://www.safehouse.rw/products/v3/full-court/04.webp']::text[],
  glb_url = 'https://www.safehouse.rw/products/v3/full-court/model.glb',
  personalise = '[]'::jsonb
where slug = 'full-court';
insert into public.products (slug, catalog_no, name, category, price, description, material, finish, image_url, gallery, glb_url, personalise)
select 'full-court', 'SH-TY-003', 'Full Court', 'Toys', 28000, 'A full court for the shelf or desk, both halves marked to real proportions with a hoop at each end, woven nets and a ball at centre court.', 'PLA', 'Black floor, white lines, blue keys, red centre', 'https://www.safehouse.rw/products/v3/full-court/01.webp', array['https://www.safehouse.rw/products/v3/full-court/01.webp','https://www.safehouse.rw/products/v3/full-court/02.webp','https://www.safehouse.rw/products/v3/full-court/03.webp','https://www.safehouse.rw/products/v3/full-court/04.webp']::text[], 'https://www.safehouse.rw/products/v3/full-court/model.glb', '[]'::jsonb
where not exists (select 1 from public.products where slug = 'full-court');
