-- Mixtape (SH-TY-005). Run after the files are live on www.safehouse.rw.
update public.products set
  catalog_no = 'SH-TY-005',
  name = 'Mixtape',
  category = 'Desk',
  price = 15000,
  description = 'A cassette at real size, leaning on its own stand. Both reels really turn, your words are handwritten on the label, and the QR on the back opens your song.',
  material = 'PLA',
  finish = 'Black shell and stand, red label, white reels',
  image_url = 'https://www.safehouse.rw/products/v3/mixtape/01.webp',
  gallery = array['https://www.safehouse.rw/products/v3/mixtape/01.webp','https://www.safehouse.rw/products/v3/mixtape/02.webp','https://www.safehouse.rw/products/v3/mixtape/03.webp','https://www.safehouse.rw/products/v3/mixtape/04.webp']::text[],
  glb_url = 'https://www.safehouse.rw/products/v3/mixtape/model.glb',
  personalise = '[{"key": "title", "label": "Label text (handwritten)", "max": 16, "required": true}, {"key": "link", "label": "Song link (Spotify, Deezer, YouTube, Apple Music)", "max": 300, "required": true}]'::jsonb
where slug = 'mixtape';
insert into public.products (slug, catalog_no, name, category, price, description, material, finish, image_url, gallery, glb_url, personalise)
select 'mixtape', 'SH-TY-005', 'Mixtape', 'Desk', 15000, 'A cassette at real size, leaning on its own stand. Both reels really turn, your words are handwritten on the label, and the QR on the back opens your song.', 'PLA', 'Black shell and stand, red label, white reels', 'https://www.safehouse.rw/products/v3/mixtape/01.webp', array['https://www.safehouse.rw/products/v3/mixtape/01.webp','https://www.safehouse.rw/products/v3/mixtape/02.webp','https://www.safehouse.rw/products/v3/mixtape/03.webp','https://www.safehouse.rw/products/v3/mixtape/04.webp']::text[], 'https://www.safehouse.rw/products/v3/mixtape/model.glb', '[{"key": "title", "label": "Label text (handwritten)", "max": 16, "required": true}, {"key": "link", "label": "Song link (Spotify, Deezer, YouTube, Apple Music)", "max": 300, "required": true}]'::jsonb
where not exists (select 1 from public.products where slug = 'mixtape');
