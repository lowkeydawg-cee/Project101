-- ─────────────────────────────────────────────────────────────────────────
--  Launch catalogue: the first five Safehouse products.
--
--  HOW TO RUN: Supabase dashboard → SQL Editor → New query → paste this
--  whole file → Run. Safe to run twice: a product whose slug already exists
--  is skipped, not duplicated.
--
--  The pictures are preview renders served from the website itself
--  (public/products/preview). The shop labels them "Preview render".
--  When you have a photo of the real print, open the product in the admin
--  page, upload the photo and save: the label disappears by itself.
--
--  Prices come from the Safehouse costing sheet. Change any of them later in
--  the admin page. Checkout always charges the price stored here.
-- ─────────────────────────────────────────────────────────────────────────

insert into public.products
  (slug, catalog_no, name, category, price, description, material, finish, image_url)
select v.slug, v.catalog_no, v.name, v.category, v.price, v.description, v.material, v.finish, v.image_url
from (values
  (
    'everyday-stand',
    'SH-EO-001',
    'Everyday Stand',
    'Everyday',
    9000,
    'A low, solid phone stand for the desk or the bedside. Holds any phone upright or sideways, with or without a case, at an easy angle for calls, videos and recipes.',
    'PLA',
    'Matte black, bronze line',
    'https://www.safehouse.rw/products/preview/sh-eo-001-everyday-stand.jpg'
  ),
  (
    'order-desk',
    'SH-EO-002',
    'Order Desk',
    'Everyday',
    20000,
    'A stepped desk organiser with three compartments: tall for pens and pencils, low for clips, cards and small things. Keeps a workspace clear without taking much of it.',
    'PLA',
    'Matte black, bronze rim',
    'https://www.safehouse.rw/products/preview/sh-eo-002-order-desk.jpg'
  ),
  (
    'signature-nameplate',
    'SH-PC-001',
    'Signature Nameplate',
    'Signature',
    12000,
    'A desk nameplate with your name raised in bronze on matte black. After you order, we message you on WhatsApp to confirm the exact name and spelling before it prints.',
    'PLA',
    'Matte black, raised bronze letters',
    'https://www.safehouse.rw/products/preview/sh-pc-001-signature-nameplate.jpg'
  ),
  (
    'connect-display',
    'SH-BC-001',
    'Connect Display',
    'Business',
    18000,
    'A counter stand with your QR code printed into it, for MoMo payments, your menu, Instagram or website. After you order, send us the link or payment code on WhatsApp and we build the code into the print.',
    'PLA',
    'Matte black, ivory code, bronze edge',
    'https://www.safehouse.rw/products/preview/sh-bc-001-connect-display.jpg'
  ),
  (
    'brand-signature',
    'SH-BC-002',
    'Brand Signature',
    'Business',
    30000,
    'Your logo as a standing sign for a reception desk, shop counter or office. After you order, send us your logo on WhatsApp or by email and we confirm the design with you before printing.',
    'PLA',
    'Matte black, raised bronze logo',
    'https://www.safehouse.rw/products/preview/sh-bc-002-brand-signature.jpg'
  )
) as v(slug, catalog_no, name, category, price, description, material, finish, image_url)
where not exists (select 1 from public.products p where p.slug = v.slug);

-- Shows what is in the shop now, newest first.
select catalog_no, name, category, price, image_url
from public.products
order by created_at desc;
