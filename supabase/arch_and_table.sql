-- House Frame Table Number (SH-BC-005). Run after the files are live on www.safehouse.rw.
update public.products set
  catalog_no = 'SH-BC-005',
  name = 'House Frame Table Number',
  category = 'Business',
  price = 5000,
  description = 'A table number in the shape of the Safehouse house, standing in a solid base. The plate lifts out for cleaning. Order one per table and tell us each number.',
  material = 'PLA',
  finish = 'Matte black, grey number and frame',
  image_url = 'https://www.safehouse.rw/products/v3/table-number/01.webp',
  gallery = array['https://www.safehouse.rw/products/v3/table-number/01.webp','https://www.safehouse.rw/products/v3/table-number/02.webp','https://www.safehouse.rw/products/v3/table-number/03.webp','https://www.safehouse.rw/products/v3/table-number/04.webp']::text[],
  glb_url = 'https://www.safehouse.rw/products/v3/table-number/model.glb',
  personalise = '[{"key": "number", "label": "Table number", "max": 3, "required": true}]'::jsonb
where slug = 'table-number';
insert into public.products (slug, catalog_no, name, category, price, description, material, finish, image_url, gallery, glb_url, personalise)
select 'table-number', 'SH-BC-005', 'House Frame Table Number', 'Business', 5000, 'A table number in the shape of the Safehouse house, standing in a solid base. The plate lifts out for cleaning. Order one per table and tell us each number.', 'PLA', 'Matte black, grey number and frame', 'https://www.safehouse.rw/products/v3/table-number/01.webp', array['https://www.safehouse.rw/products/v3/table-number/01.webp','https://www.safehouse.rw/products/v3/table-number/02.webp','https://www.safehouse.rw/products/v3/table-number/03.webp','https://www.safehouse.rw/products/v3/table-number/04.webp']::text[], 'https://www.safehouse.rw/products/v3/table-number/model.glb', '[{"key": "number", "label": "Table number", "max": 3, "required": true}]'::jsonb
where not exists (select 1 from public.products where slug = 'table-number');
-- Signal Arch Wi-Fi Stand (SH-BC-004). Run after the files are live on www.safehouse.rw.
update public.products set
  catalog_no = 'SH-BC-004',
  name = 'Signal Arch Wi-Fi Stand',
  category = 'Business',
  price = 15000,
  description = 'The Wi-Fi symbol, standing on your counter. Guests scan the QR on the front to join your network: it shows your network name, and the password stays inside the code. For cafés, hotels, offices and short-stay apartments.',
  material = 'PLA',
  finish = 'Matte black, white QR panel, grey mark',
  image_url = 'https://www.safehouse.rw/products/v3/wifi-stand/01.webp',
  gallery = array['https://www.safehouse.rw/products/v3/wifi-stand/01.webp','https://www.safehouse.rw/products/v3/wifi-stand/02.webp','https://www.safehouse.rw/products/v3/wifi-stand/03.webp','https://www.safehouse.rw/products/v3/wifi-stand/04.webp']::text[],
  glb_url = 'https://www.safehouse.rw/products/v3/wifi-stand/model.glb',
  personalise = '[{"key": "ssid", "label": "Wi-Fi network name", "max": 32, "required": true}, {"key": "password", "label": "Wi-Fi password (leave empty if open)", "max": 63, "required": false}]'::jsonb
where slug = 'wifi-stand';
insert into public.products (slug, catalog_no, name, category, price, description, material, finish, image_url, gallery, glb_url, personalise)
select 'wifi-stand', 'SH-BC-004', 'Signal Arch Wi-Fi Stand', 'Business', 15000, 'The Wi-Fi symbol, standing on your counter. Guests scan the QR on the front to join your network: it shows your network name, and the password stays inside the code. For cafés, hotels, offices and short-stay apartments.', 'PLA', 'Matte black, white QR panel, grey mark', 'https://www.safehouse.rw/products/v3/wifi-stand/01.webp', array['https://www.safehouse.rw/products/v3/wifi-stand/01.webp','https://www.safehouse.rw/products/v3/wifi-stand/02.webp','https://www.safehouse.rw/products/v3/wifi-stand/03.webp','https://www.safehouse.rw/products/v3/wifi-stand/04.webp']::text[], 'https://www.safehouse.rw/products/v3/wifi-stand/model.glb', '[{"key": "ssid", "label": "Wi-Fi network name", "max": 32, "required": true}, {"key": "password", "label": "Wi-Fi password (leave empty if open)", "max": 63, "required": false}]'::jsonb
where not exists (select 1 from public.products where slug = 'wifi-stand');
