# The Safehouse

Online storefront for **The Safehouse (Domus Tuta)** — a 3D printing studio in Kigali, Rwanda.
Customers browse made-to-order printed objects, order online, request custom prints, and track their order; the owner manages products and orders from a private admin dashboard.

**Live site:** https://project101-puce.vercel.app

## Features

- **Shop** — product catalogue loaded live from Supabase, with category filters and product detail pages
- **Cart & checkout** — pickup or delivery (flat 2,000 RWF), orders priced and saved on the server
- **Order tracking** — customers follow their order with the order number (`/order-status?order=SH-XXXXXXXX`)
- **Custom quote** — request form with STL file preview
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

Never commit `.env`, and never put the Supabase **service role** key in a `VITE_` variable.

## Database

Supabase tables: `products`, `orders`, `order_items`, plus the `product-images` storage bucket.
Order security (server-side pricing, private customer details, admin-only access) lives in [`supabase/orders-security.sql`](supabase/orders-security.sql) — run it once in the Supabase SQL Editor.

## Project structure

```
src/
  components/   shared UI (NavBar, Footer, ProductCard, CartDrawer, …)
  context/      cart and admin-auth state
  data/         Supabase product queries
  lib/          Supabase client, formatting, order emails, motion helpers
  pages/        routes (Home, Shop, ProductDetail, Cart, Checkout, OrderStatus, Admin, …)
supabase/       SQL to run in the Supabase dashboard
```

## Deployment

Every push to `main` deploys to production on Vercel. Check build status under the project's **Deployments** tab.
