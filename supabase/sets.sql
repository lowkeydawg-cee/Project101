-- Café Set (SH-SET-001). Run after the files are live on www.safehouse.rw.
update public.products set
  catalog_no = 'SH-SET-001',
  name = 'Café Set',
  category = 'Business',
  price = 55000,
  description = 'Everything a café counter needs in one order: the Signal Arch Wi-Fi stand, a Connect Display with your MoMo code or menu, and six House Frame table numbers. 63,000 RWF if bought separately.',
  material = 'PLA',
  finish = 'Matte black, white QR panels, grey details',
  image_url = 'https://www.safehouse.rw/products/v3/cafe-set/01.webp',
  gallery = array['https://www.safehouse.rw/products/v3/cafe-set/01.webp','https://www.safehouse.rw/products/v3/cafe-set/02.webp','https://www.safehouse.rw/products/v3/cafe-set/03.webp','https://www.safehouse.rw/products/v3/cafe-set/04.webp']::text[],
  glb_url = 'https://www.safehouse.rw/products/v3/cafe-set/model.glb',
  personalise = '[{"key": "ssid", "label": "Wi-Fi network name", "max": 32, "required": true}, {"key": "password", "label": "Wi-Fi password (leave empty if open)", "max": 63, "required": false}, {"key": "link", "label": "MoMo code or menu link for the pay stand", "max": 200, "required": true}, {"key": "tables", "label": "Six table numbers (e.g. 1-6 or 1,2,3,4,5,VIP)", "max": 40, "required": true}]'::jsonb
where slug = 'cafe-set';
insert into public.products (slug, catalog_no, name, category, price, description, material, finish, image_url, gallery, glb_url, personalise)
select 'cafe-set', 'SH-SET-001', 'Café Set', 'Business', 55000, 'Everything a café counter needs in one order: the Signal Arch Wi-Fi stand, a Connect Display with your MoMo code or menu, and six House Frame table numbers. 63,000 RWF if bought separately.', 'PLA', 'Matte black, white QR panels, grey details', 'https://www.safehouse.rw/products/v3/cafe-set/01.webp', array['https://www.safehouse.rw/products/v3/cafe-set/01.webp','https://www.safehouse.rw/products/v3/cafe-set/02.webp','https://www.safehouse.rw/products/v3/cafe-set/03.webp','https://www.safehouse.rw/products/v3/cafe-set/04.webp']::text[], 'https://www.safehouse.rw/products/v3/cafe-set/model.glb', '[{"key": "ssid", "label": "Wi-Fi network name", "max": 32, "required": true}, {"key": "password", "label": "Wi-Fi password (leave empty if open)", "max": 63, "required": false}, {"key": "link", "label": "MoMo code or menu link for the pay stand", "max": 200, "required": true}, {"key": "tables", "label": "Six table numbers (e.g. 1-6 or 1,2,3,4,5,VIP)", "max": 40, "required": true}]'::jsonb
where not exists (select 1 from public.products where slug = 'cafe-set');
-- Front Desk Set (SH-SET-002). Run after the files are live on www.safehouse.rw.
update public.products set
  catalog_no = 'SH-SET-002',
  name = 'Front Desk Set',
  category = 'Business',
  price = 32000,
  description = 'For a reception or front desk: the Signal Arch Wi-Fi stand, the Reception Card Holder and a Signature Nameplate with your name. 37,000 RWF if bought separately.',
  material = 'PLA',
  finish = 'Matte black, white QR panel, grey details',
  image_url = 'https://www.safehouse.rw/products/v3/desk-set/01.webp',
  gallery = array['https://www.safehouse.rw/products/v3/desk-set/01.webp','https://www.safehouse.rw/products/v3/desk-set/02.webp','https://www.safehouse.rw/products/v3/desk-set/03.webp','https://www.safehouse.rw/products/v3/desk-set/04.webp']::text[],
  glb_url = 'https://www.safehouse.rw/products/v3/desk-set/model.glb',
  personalise = '[{"key": "ssid", "label": "Wi-Fi network name", "max": 32, "required": true}, {"key": "password", "label": "Wi-Fi password (leave empty if open)", "max": 63, "required": false}, {"key": "name", "label": "Name for the nameplate", "max": 32, "required": true}, {"key": "title", "label": "Title (optional)", "max": 40, "required": false}]'::jsonb
where slug = 'desk-set';
insert into public.products (slug, catalog_no, name, category, price, description, material, finish, image_url, gallery, glb_url, personalise)
select 'desk-set', 'SH-SET-002', 'Front Desk Set', 'Business', 32000, 'For a reception or front desk: the Signal Arch Wi-Fi stand, the Reception Card Holder and a Signature Nameplate with your name. 37,000 RWF if bought separately.', 'PLA', 'Matte black, white QR panel, grey details', 'https://www.safehouse.rw/products/v3/desk-set/01.webp', array['https://www.safehouse.rw/products/v3/desk-set/01.webp','https://www.safehouse.rw/products/v3/desk-set/02.webp','https://www.safehouse.rw/products/v3/desk-set/03.webp','https://www.safehouse.rw/products/v3/desk-set/04.webp']::text[], 'https://www.safehouse.rw/products/v3/desk-set/model.glb', '[{"key": "ssid", "label": "Wi-Fi network name", "max": 32, "required": true}, {"key": "password", "label": "Wi-Fi password (leave empty if open)", "max": 63, "required": false}, {"key": "name", "label": "Name for the nameplate", "max": 32, "required": true}, {"key": "title", "label": "Title (optional)", "max": 40, "required": false}]'::jsonb
where not exists (select 1 from public.products where slug = 'desk-set');
