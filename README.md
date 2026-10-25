# The Safehouse

Online storefront for **The Safehouse (Domus Tuta)** — a 3D printing studio in Kigali, Rwanda.
Customers browse made-to-order printed objects, order online, request custom prints, and track their order; the owner manages products and orders from a private admin dashboard.

**Live site:** https://project101-puce.vercel.app

## Features

- **Scroll-driven hero** — the homepage hero is a 6-second print rendered frame by frame. Scrolling down prints the piece, scrolling up un-prints it. Phones and anyone who prefers less motion get a composed still instead, and never download the video
- **Shop** — product catalogue loaded live from Supabase, with category filters and product detail pages
- **Cart & checkout** — pickup or delivery (flat 2,000 RWF), orders priced and saved on the server
- **Order tracking** — customers follow their order with the order number (`/order-status?order=SH-XXXXXXXX`)
- **Custom quote** — request form with STL preview and upload; the request is emailed with a link to the model
- **Answers section** — the objections buyers actually raise, answered on the homepage
- **Link previews and search** — Open Graph card, sitemap, robots, per-page titles, and a LocalBusiness record so Google can place the studio in Kigali
- **Admin** (`/admin`) — add/edit/delete products with photo upload, view orders and update their production status
- **Order emails** — the shop and the customer each get an email when an order is placed (EmailJS)
- Light / dark theme

## Tech stack

| Layer | Tool |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, wouter |
| Backend | Supabase (Postgres, Storage, Auth) |
| Email | EmailJS |
| Hosting | Vercel (auto-deploys from `main`) |

## Running locally

```bash
npm install
cp .env.example .env   # then fill in the values
npm run dev            # http://localhost:5173
```

Other scripts: `npm run build` (type-check + production build), `npm run lint`, `npm run preview`.

## Environment variables

Set these in `.env` locally **and** in Vercel → Project → Settings → Environment Variables. Only `VITE_`-prefixed variables reach the browser.

| Variable | Required | Where to find it |
|---|---|---|
| `VITE_SUPABASE_URL` | yes | Supabase → Project Settings → API |
| `VITE_SUPABASE_ANON_KEY` | yes | Supabase → Project Settings → API (anon / publishable key) |
| `VITE_EMAILJS_SERVICE_ID` | for emails | EmailJS → Email Services |
| `VITE_EMAILJS_PUBLIC_KEY` | for emails | EmailJS → Account → API keys |
| `VITE_EMAILJS_ADMIN_TEMPLATE_ID` | for emails | EmailJS → Email Templates |
| `VITE_EMAILJS_CUSTOMER_TEMPLATE_ID` | for emails | EmailJS → Email Templates |
| `VITE_EMAILJS_INQUIRY_TEMPLATE_ID` | for forms | EmailJS → Email Templates (contact and custom quote) |

Never commit `.env`, and never put the Supabase **service role** key in a `VITE_` variable.

## Database

Supabase tables: `products`, `orders`, `order_items`, plus the `product-images` storage bucket.
Run these once each in the Supabase SQL Editor:

- [`supabase/orders-security.sql`](supabase/orders-security.sql) — server-side pricing, private customer details, admin-only access
- [`supabase/quote-files.sql`](supabase/quote-files.sql) — the `quote-files` bucket that holds STL uploads from the custom quote form

Also turn **off** Authentication → Sign In / Providers → "Allow new users to sign up". Any signed-in account can read the orders table, so public signup must stay closed.

## Project structure

```
src/
  components/   shared UI (NavBar, Footer, ProductCard, CartDrawer, …)
  context/      cart and admin-auth state
  data/         Supabase product queries
  lib/          Supabase client, site details, formatting, emails, page titles
  pages/        routes (Home, Shop, ProductDetail, Cart, Checkout, OrderStatus, Admin, …)
supabase/       SQL to run in the Supabase dashboard
```

## Things to change when they are real

Every business detail lives in one file: [`src/lib/site.ts`](src/lib/site.ts). Edit the top of that file and the footer, contact page, WhatsApp buttons, FAQ, search listing and link preview all follow.

- `email` — currently a placeholder domain, so mail to it bounces
- `whatsapp` / `phoneDisplay` — currently `+250 000 000 000`
- `SOCIAL.instagram` — currently a bare instagram.com link
- `url` — update when a custom domain is connected, then regenerate `public/sitemap.xml` and the URLs in `index.html`

Drop a 10 to 20 second clip at `public/studio-timelapse.mp4` and a studio section appears on the homepage by itself. Until that file exists the section renders nothing.

## Regenerating the hero

The hero is rendered from a Three.js scene, not filmed and not AI generated, which is why it holds to exactly three colours. The scene and the exact ffmpeg settings are in [`tools/hero/`](tools/hero/). If the piece or the palette changes, re-render and re-encode with every frame a keyframe (`-g 1 -keyint_min 1`), or scrubbing will stutter.

Assets it produces: `public/hero-build.mp4`, `public/hero-build.webm`, `public/hero-poster.jpg` (wide) and `public/hero-poster-mobile.jpg` (portrait).

## Deployment

Every push to `main` deploys to production on Vercel. Check build status under the project's **Deployments** tab.
