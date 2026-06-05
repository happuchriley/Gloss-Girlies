# Supabase Backend Setup

One SQL file sets up the full Gloss Girlies backend: auth profiles, products, cart, guest checkout, Paystack payments, wishlist, inventory tracking, categories, and blog.

## Prerequisites

Create `.env.local` from `.env.example` with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://zeyvvnviontbfnkhdhqm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Project reference: `zeyvvnviontbfnkhdhqm`

Find keys in [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Settings** → **API**.

## Step 1: Run the backend SQL

1. Open **SQL Editor** in your Supabase project
2. Click **New query**
3. Copy the full contents of **`supabase/backend.sql`**
4. Paste and click **Run**

You should see: **Success. No rows returned**

This file is idempotent — safe to re-run if you already applied older `schema.sql` or migration files.

## Step 2: Verify tables

```bash
npm run verify-supabase
```

Expected tables:

| Table | Purpose |
|-------|---------|
| `users` | Profiles linked to `auth.users` |
| `products` | Product catalog |
| `cart_items` | Signed-in shopping carts |
| `addresses` | Saved shipping addresses |
| `orders` | Orders (registered + guest) |
| `order_items` | Line items per order |
| `reviews` | Product reviews |
| `wishlist` | Saved products per user |
| `payments` | Paystack payment records |
| `inventory_movements` | Stock change audit log |
| `shop_categories` | Admin-managed categories |
| `blog_posts` | Blog content |

## Step 3: Seed demo accounts

```bash
npm run seed:demo-users
```

Creates:

| Role | Email | Password |
|------|-------|----------|
| Customer | `demo@glossgirlies.com` | `Demo123!` |
| Admin | `admin@glossgirlies.com` | `Admin123!` |

Requires `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.

## Step 4: Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Manual admin setup (alternative to seed script)

1. **Authentication** → **Users** → **Add user**
2. Email: `admin@glossgirlies.com`, auto-confirm enabled
3. In SQL Editor:

```sql
INSERT INTO public.users (id, email, name, role)
SELECT id, email, 'Admin', 'admin'
FROM auth.users
WHERE email = 'admin@glossgirlies.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

## Troubleshooting

### `Error fetching categories` / missing `shop_categories`

Run `supabase/backend.sql` in the SQL Editor, then `npm run verify-supabase`.

### Row Level Security policy violation

Re-run `supabase/backend.sql` — it refreshes all RLS policies.

### Table does not exist

Confirm you ran the full `backend.sql` file (not an older `schema.sql` only).

### Connection errors

Check `.env.local` URL and keys, then restart `npm run dev`.

## File reference

| File | Use |
|------|-----|
| **`supabase/backend.sql`** | **Run this** — complete backend |
| `supabase/migrations/*.sql` | Historical migrations (included in `backend.sql`) |
| `supabase/complete-schema.sql` | Legacy base schema |
| `scripts/seed-demo-users.js` | Demo customer + admin accounts |
