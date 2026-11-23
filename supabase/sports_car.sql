-- Safehouse GT (SH-TY-001). Run after the files are live on www.safehouse.rw.
update public.products set
  catalog_no = 'SH-TY-001',
  name = 'Safehouse GT',
  category = 'Toys',
  price = 12000,
  description = 'An original pocket supercar, about 9 cm long. The wheels turn on real axles, the canopy lifts off, and every part is printed in solid colour, so nothing is painted to chip off.',
  material = 'PLA',
  finish = 'Red body, black canopy and tyres, white rims',
  image_url = 'https://www.safehouse.rw/products/v3/sports-car/01.webp',
  gallery = array['https://www.safehouse.rw/products/v3/sports-car/01.webp','https://www.safehouse.rw/products/v3/sports-car/02.webp','https://www.safehouse.rw/products/v3/sports-car/03.webp','https://www.safehouse.rw/products/v3/sports-car/04.webp']::text[],
  glb_url = 'https://www.safehouse.rw/products/v3/sports-car/model.glb',
  personalise = '[]'::jsonb
where slug = 'sports-car';
insert into public.products (slug, catalog_no, name, category, price, description, material, finish, image_url, gallery, glb_url, personalise)
select 'sports-car', 'SH-TY-001', 'Safehouse GT', 'Toys', 12000, 'An original pocket supercar, about 9 cm long. The wheels turn on real axles, the canopy lifts off, and every part is printed in solid colour, so nothing is painted to chip off.', 'PLA', 'Red body, black canopy and tyres, white rims', 'https://www.safehouse.rw/products/v3/sports-car/01.webp', array['https://www.safehouse.rw/products/v3/sports-car/01.webp','https://www.safehouse.rw/products/v3/sports-car/02.webp','https://www.safehouse.rw/products/v3/sports-car/03.webp','https://www.safehouse.rw/products/v3/sports-car/04.webp']::text[], 'https://www.safehouse.rw/products/v3/sports-car/model.glb', '[]'::jsonb
where not exists (select 1 from public.products where slug = 'sports-car');
