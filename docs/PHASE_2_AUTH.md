# Phase 2 — Database & Authentication ✅

## Run the migration

In **Supabase → SQL Editor**, run:

`supabase/migrations/20250527_phase2_auth_guest.sql`

This adds:

- Guest checkout columns on `orders`
- `wishlist` and `payments` tables (scaffold)
- `is_admin()` helper for RLS
- `track_guest_order()` RPC
- Updated RLS for guest orders

## Supabase Auth configuration

1. **Authentication → URL Configuration**
   - Site URL: `http://localhost:3000` (or production URL)
   - Redirect URLs: `http://localhost:3000/api/auth/callback`

2. **Email templates** — enable confirm signup if you want email verification

3. **Create admin user**
   ```sql
   UPDATE public.users SET role = 'admin' WHERE email = 'your-admin@email.com';
   ```

## Environment variables

Copy `.env.example` → `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # optional, for future server-only ops
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## What was built

| Feature | Implementation |
|---------|----------------|
| **Session guard** | `proxy.ts` — session refresh, `/admin` + protected routes |
| **Server auth** | `lib/supabase/server.ts`, `lib/auth/session.ts` |
| **Admin layout** | `app/admin/layout.tsx` — server-side role check |
| **Auth UI** | `components/auth/*` — login, register, forgot password |
| **Guest checkout** | Checkout without login; `guest_access_token` stored locally |
| **Guest tracking** | `POST /api/orders/track` + track-order page |
| **Auth callback** | `GET /api/auth/callback` — email confirm / OAuth |
| **Validation** | Zod schemas in `lib/auth/validation.ts` |
| **Error mapping** | `lib/auth/errors.ts` — safe user messages |

## Guest order flow

1. Customer checks out without signing in (email required).
2. Order saved with `is_guest = true` and `guest_access_token`.
3. Token saved in `localStorage` via `lib/guest/session.ts`.
4. Customer tracks at `/track-order` with order ID + email + token.

## Next: Phase 3

Product system refactor, wishlist UI, search & filters.
