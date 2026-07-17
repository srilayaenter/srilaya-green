# SriLaYa Green — Setup

A v1 storefront + checkout + basic admin for the bioenzyme products business, scaffolded to
mirror the design of the SriLaYa Naturals site. All product data and branding are placeholders —
replace before launch.

## What's included (v1)

- Homepage, product catalog, product detail, cart, checkout (COD + Razorpay), order tracking.
- Basic admin: login, product CRUD, order list/detail with shipment + status updates.

## What's deferred (see the design doc for full scope)

RBAC with multiple roles, MFA, offline/in-store POS, raw-material & production batch tracking,
P&L reporting, loyalty/referral, coupons, product reviews, wishlist, blog, bundles.

## 1. Install dependencies

```
npm install
```

## 2. Create a database

This project needs its own PostgreSQL database — **do not reuse the srilaya-ecommerce
(Naturals) database**, since this is a separate business with its own catalog and orders.

1. Create a new project at [supabase.com](https://supabase.com).
2. In Project Settings → Database, copy the pooled connection string into `DATABASE_URL`
   and the direct connection string into `DIRECT_URL`.

## 3. Configure environment variables

Copy `.env.example` to `.env` and fill in the values:

- `DATABASE_URL` / `DIRECT_URL` — from your new Supabase project.
- `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`.
- `NEXTAUTH_URL` — `http://localhost:3000` for local dev.
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — test keys from the
  [Razorpay dashboard](https://dashboard.razorpay.com/app/keys) are enough for local testing;
  the checkout page will show an error if these are missing when a customer chooses "Pay Online".
- `RESEND_API_KEY` / `EMAIL_FROM` — optional; without these, order confirmation emails are
  skipped and logged to the console instead of failing.

## 4. Run migrations and seed placeholder data

```
npm run prisma:migrate
npm run seed
```

This creates the schema, a placeholder bioenzyme catalog (5 categories, 5 products), and an
admin account. The seed script prints the admin email/password it used — override them via
`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` in `.env` before seeding if you want your own.

## 5. Run the dev server

```
npm run dev
```

Visit `http://localhost:3000` for the storefront and `http://localhost:3000/admin/login` for
the admin panel.

## Pre-launch checklist

- [ ] Replace placeholder product catalog and category images with real content.
- [ ] Replace the placeholder logo (`lib/brand.ts` → `logoUrl`) with a real brand asset.
- [ ] Switch Razorpay to live keys.
- [ ] Add a custom sending domain in Resend (placeholder uses the shared `resend.dev` domain).
- [ ] Set `NEXTAUTH_URL` to the production domain.
- [ ] Set `BRAND_GSTIN` if you need it printed anywhere customer-facing.
- [ ] Change the seeded admin password.
