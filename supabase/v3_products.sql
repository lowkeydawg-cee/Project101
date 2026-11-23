-- The Safehouse v3 catalogue: 5 redesigned products + new SH-BC-003.
-- Run AFTER supabase/migrations/20261122_personalised_orders.sql and AFTER public/products/v3 is live.

-- Connect Display (SH-BC-001). Run after the files are live on www.safehouse.rw.
update public.products set
  catalog_no = 'SH-BC-001',
  name = 'Connect Display',
  category = 'Business',
  price = 18000,
  description = 'A counter stand with your QR code printed into it, for MoMo payments, your menu, Instagram or website.',
  material = 'PLA',
  finish = 'Matte black, white QR panel, grey mark',
  image_url = 'https://www.safehouse.rw/products/v3/connect-display/01.webp',
  gallery = array['https://www.safehouse.rw/products/v3/connect-display/01.webp','https://www.safehouse.rw/products/v3/connect-display/02.webp','https://www.safehouse.rw/products/v3/connect-display/03.webp','https://www.safehouse.rw/products/v3/connect-display/04.webp']::text[],
  glb_url = 'https://www.safehouse.rw/products/v3/connect-display/model.glb',
  personalise = '[{"key": "link", "label": "Link or payment code for the QR", "max": 200, "required": true}]'::jsonb
where slug = 'connect-display';
insert into public.products (slug, catalog_no, name, category, price, description, material, finish, image_url, gallery, glb_url, personalise)
select 'connect-display', 'SH-BC-001', 'Connect Display', 'Business', 18000, 'A counter stand with your QR code printed into it, for MoMo payments, your menu, Instagram or website.', 'PLA', 'Matte black, white QR panel, grey mark', 'https://www.safehouse.rw/products/v3/connect-display/01.webp', array['https://www.safehouse.rw/products/v3/connect-display/01.webp','https://www.safehouse.rw/products/v3/connect-display/02.webp','https://www.safehouse.rw/products/v3/connect-display/03.webp','https://www.safehouse.rw/products/v3/connect-display/04.webp']::text[], 'https://www.safehouse.rw/products/v3/connect-display/model.glb', '[{"key": "link", "label": "Link or payment code for the QR", "max": 200, "required": true}]'::jsonb
where not exists (select 1 from public.products where slug = 'connect-display');

-- Signature Nameplate (SH-PC-001). Run after the files are live on www.safehouse.rw.
update public.products set
  catalog_no = 'SH-PC-001',
  name = 'Signature Nameplate',
  category = 'Signature',
  price = 12000,
  description = 'A desk nameplate with your name in raised grey on matte black, finished with the Safehouse mark.',
  material = 'PLA',
  finish = 'Matte black, grey lettering',
  image_url = 'https://www.safehouse.rw/products/v3/signature-nameplate/01.webp',
  gallery = array['https://www.safehouse.rw/products/v3/signature-nameplate/01.webp','https://www.safehouse.rw/products/v3/signature-nameplate/02.webp','https://www.safehouse.rw/products/v3/signature-nameplate/03.webp','https://www.safehouse.rw/products/v3/signature-nameplate/04.webp']::text[],
  glb_url = 'https://www.safehouse.rw/products/v3/signature-nameplate/model.glb',
  personalise = '[{"key": "name", "label": "Name", "max": 32, "required": true}, {"key": "title", "label": "Title", "max": 40, "required": false}]'::jsonb
where slug = 'signature-nameplate';
insert into public.products (slug, catalog_no, name, category, price, description, material, finish, image_url, gallery, glb_url, personalise)
select 'signature-nameplate', 'SH-PC-001', 'Signature Nameplate', 'Signature', 12000, 'A desk nameplate with your name in raised grey on matte black, finished with the Safehouse mark.', 'PLA', 'Matte black, grey lettering', 'https://www.safehouse.rw/products/v3/signature-nameplate/01.webp', array['https://www.safehouse.rw/products/v3/signature-nameplate/01.webp','https://www.safehouse.rw/products/v3/signature-nameplate/02.webp','https://www.safehouse.rw/products/v3/signature-nameplate/03.webp','https://www.safehouse.rw/products/v3/signature-nameplate/04.webp']::text[], 'https://www.safehouse.rw/products/v3/signature-nameplate/model.glb', '[{"key": "name", "label": "Name", "max": 32, "required": true}, {"key": "title", "label": "Title", "max": 40, "required": false}]'::jsonb
where not exists (select 1 from public.products where slug = 'signature-nameplate');

-- Brand Signature (SH-BC-002). Run after the files are live on www.safehouse.rw.
update public.products set
  catalog_no = 'SH-BC-002',
  name = 'Brand Signature',
  category = 'Business',
  price = 30000,
  description = 'Your logo as a standing sign for a reception desk, shop counter or office. After you order, send us your logo on WhatsApp or by email and we confirm the design with you before printing.',
  material = 'PLA',
  finish = 'Matte black, grey logo',
  image_url = 'https://www.safehouse.rw/products/v3/brand-signature/01.webp',
  gallery = array['https://www.safehouse.rw/products/v3/brand-signature/01.webp','https://www.safehouse.rw/products/v3/brand-signature/02.webp','https://www.safehouse.rw/products/v3/brand-signature/03.webp','https://www.safehouse.rw/products/v3/brand-signature/04.webp']::text[],
  glb_url = 'https://www.safehouse.rw/products/v3/brand-signature/model.glb',
  personalise = '[]'::jsonb
where slug = 'brand-signature';
insert into public.products (slug, catalog_no, name, category, price, description, material, finish, image_url, gallery, glb_url, personalise)
select 'brand-signature', 'SH-BC-002', 'Brand Signature', 'Business', 30000, 'Your logo as a standing sign for a reception desk, shop counter or office. After you order, send us your logo on WhatsApp or by email and we confirm the design with you before printing.', 'PLA', 'Matte black, grey logo', 'https://www.safehouse.rw/products/v3/brand-signature/01.webp', array['https://www.safehouse.rw/products/v3/brand-signature/01.webp','https://www.safehouse.rw/products/v3/brand-signature/02.webp','https://www.safehouse.rw/products/v3/brand-signature/03.webp','https://www.safehouse.rw/products/v3/brand-signature/04.webp']::text[], 'https://www.safehouse.rw/products/v3/brand-signature/model.glb', '[]'::jsonb
where not exists (select 1 from public.products where slug = 'brand-signature');

-- Everyday Stand (SH-EO-001). Run after the files are live on www.safehouse.rw.
update public.products set
  catalog_no = 'SH-EO-001',
  name = 'Everyday Stand',
  category = 'Everyday',
  price = 9000,
  description = 'A low, solid phone stand for the desk or the bedside, with a cable notch in the lip.',
  material = 'PLA',
  finish = 'Matte black, grey line',
  image_url = 'https://www.safehouse.rw/products/v3/everyday-stand/01.webp',
  gallery = array['https://www.safehouse.rw/products/v3/everyday-stand/01.webp','https://www.safehouse.rw/products/v3/everyday-stand/02.webp','https://www.safehouse.rw/products/v3/everyday-stand/03.webp','https://www.safehouse.rw/products/v3/everyday-stand/04.webp']::text[],
  glb_url = 'https://www.safehouse.rw/products/v3/everyday-stand/model.glb',
  personalise = '[]'::jsonb
where slug = 'everyday-stand';
insert into public.products (slug, catalog_no, name, category, price, description, material, finish, image_url, gallery, glb_url, personalise)
select 'everyday-stand', 'SH-EO-001', 'Everyday Stand', 'Everyday', 9000, 'A low, solid phone stand for the desk or the bedside, with a cable notch in the lip.', 'PLA', 'Matte black, grey line', 'https://www.safehouse.rw/products/v3/everyday-stand/01.webp', array['https://www.safehouse.rw/products/v3/everyday-stand/01.webp','https://www.safehouse.rw/products/v3/everyday-stand/02.webp','https://www.safehouse.rw/products/v3/everyday-stand/03.webp','https://www.safehouse.rw/products/v3/everyday-stand/04.webp']::text[], 'https://www.safehouse.rw/products/v3/everyday-stand/model.glb', '[]'::jsonb
where not exists (select 1 from public.products where slug = 'everyday-stand');

-- Order Desk (SH-EO-002). Run after the files are live on www.safehouse.rw.
update public.products set
  catalog_no = 'SH-EO-002',
  name = 'Order Desk',
  category = 'Everyday',
  price = 20000,
  description = 'A stepped desk organiser: tall for pens, middle for cards, low for clips.',
  material = 'PLA',
  finish = 'Matte black, grey rim',
  image_url = 'https://www.safehouse.rw/products/v3/order-desk/01.webp',
  gallery = array['https://www.safehouse.rw/products/v3/order-desk/01.webp','https://www.safehouse.rw/products/v3/order-desk/02.webp','https://www.safehouse.rw/products/v3/order-desk/03.webp','https://www.safehouse.rw/products/v3/order-desk/04.webp']::text[],
  glb_url = 'https://www.safehouse.rw/products/v3/order-desk/model.glb',
  personalise = '[]'::jsonb
where slug = 'order-desk';
insert into public.products (slug, catalog_no, name, category, price, description, material, finish, image_url, gallery, glb_url, personalise)
select 'order-desk', 'SH-EO-002', 'Order Desk', 'Everyday', 20000, 'A stepped desk organiser: tall for pens, middle for cards, low for clips.', 'PLA', 'Matte black, grey rim', 'https://www.safehouse.rw/products/v3/order-desk/01.webp', array['https://www.safehouse.rw/products/v3/order-desk/01.webp','https://www.safehouse.rw/products/v3/order-desk/02.webp','https://www.safehouse.rw/products/v3/order-desk/03.webp','https://www.safehouse.rw/products/v3/order-desk/04.webp']::text[], 'https://www.safehouse.rw/products/v3/order-desk/model.glb', '[]'::jsonb
where not exists (select 1 from public.products where slug = 'order-desk');

-- Reception Card Holder (SH-BC-003). Run after the files are live on www.safehouse.rw.
update public.products set
  catalog_no = 'SH-BC-003',
  name = 'Reception Card Holder',
  category = 'Business',
  price = 10000,
  description = 'A solid card holder for reception desks and counters. Holds about fifty standard business cards, leaning back so the top card is easy to read.',
  material = 'PLA',
  finish = 'Matte black, grey line and mark',
  image_url = 'https://www.safehouse.rw/products/v3/card-holder/01.webp',
  gallery = array['https://www.safehouse.rw/products/v3/card-holder/01.webp','https://www.safehouse.rw/products/v3/card-holder/02.webp','https://www.safehouse.rw/products/v3/card-holder/03.webp','https://www.safehouse.rw/products/v3/card-holder/04.webp']::text[],
  glb_url = 'https://www.safehouse.rw/products/v3/card-holder/model.glb',
  personalise = '[]'::jsonb
where slug = 'card-holder';
insert into public.products (slug, catalog_no, name, category, price, description, material, finish, image_url, gallery, glb_url, personalise)
select 'card-holder', 'SH-BC-003', 'Reception Card Holder', 'Business', 10000, 'A solid card holder for reception desks and counters. Holds about fifty standard business cards, leaning back so the top card is easy to read.', 'PLA', 'Matte black, grey line and mark', 'https://www.safehouse.rw/products/v3/card-holder/01.webp', array['https://www.safehouse.rw/products/v3/card-holder/01.webp','https://www.safehouse.rw/products/v3/card-holder/02.webp','https://www.safehouse.rw/products/v3/card-holder/03.webp','https://www.safehouse.rw/products/v3/card-holder/04.webp']::text[], 'https://www.safehouse.rw/products/v3/card-holder/model.glb', '[]'::jsonb
where not exists (select 1 from public.products where slug = 'card-holder');

-- remove the 0 RWF Supabase test product
delete from public.products where slug = 'POSTER N01.' and price = 0;
