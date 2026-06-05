# Deploy Gloss Girlies on Vercel

## 1. Import the project

1. Push this repo to GitHub (if not already).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Framework preset: **Next.js** (auto-detected).
4. Root directory: `.` (default).

No `netlify.toml` is required — Vercel uses `vercel.json` and native Next.js support.

## 2. Environment variables

Add these in **Vercel → Project → Settings → Environment Variables** for **Production**, **Preview**, and **Development** as needed.

### Required — Supabase

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://zeyvvnviontbfnkhdhqm.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Dashboard → Settings → API → anon |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only — payments, guest orders, admin |

### Required — App URL

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_APP_URL` | Production URL, e.g. `https://glossgirlies.vercel.app` or your custom domain |
| `NEXT_PUBLIC_API_URL` | Same host + `/api`, e.g. `https://glossgirlies.vercel.app/api` |

`NEXT_PUBLIC_APP_URL` drives Paystack callback URLs, SMS tracking links, and auth redirects.

### Paystack (card / mobile money / bank)

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | `pk_test_...` or `pk_live_...` |
| `PAYSTACK_SECRET_KEY` | `sk_test_...` or `sk_live_...` — **server only** |

**Paystack dashboard setup:**

1. [Paystack Dashboard](https://dashboard.paystack.com) → **Settings** → **API Keys & Webhooks**
2. **Webhook URL:** `https://YOUR_DOMAIN/api/payment/paystack/webhook`
3. Enable event: **`charge.success`**
4. **Callback URL** is set automatically from `NEXT_PUBLIC_APP_URL` → `/checkout/success`

### BMS SMS (mNotify)

| Variable | Notes |
|----------|--------|
| `BMS_SMS_API_KEY` | From [mNotify apps](https://apps.mnotify.net) or [BMS Africa](https://bms.africa) |
| `BMS_SMS_SENDER_ID` | Registered sender ID (max 11 chars), e.g. `GlossGirlie` |
| `ADMIN_PHONE` | Ghana format `233XXXXXXXXX` — admin alert on new orders |
| `BMS_SMS_ENABLED` | Optional — set `false` to disable SMS without removing keys |
| `BMS_SMS_API_BASE_URL` | Optional — default `https://api.mnotify.com/api` |

SMS is sent on:

- COD order placed (customer + admin)
- Paystack payment confirmed (customer + admin)
- Admin order status updates (via admin API)

### Optional — demo accounts (disable in production)

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS` | `false` |

## 3. Supabase Auth URLs

In Supabase → **Authentication** → **URL Configuration**, add:

| Setting | Value |
|---------|--------|
| Site URL | `https://YOUR_DOMAIN` |
| Redirect URLs | `https://YOUR_DOMAIN/api/auth/callback` |

Include preview URLs if you test on Vercel preview deployments:

`https://*.vercel.app/api/auth/callback`

## 4. Deploy

```bash
# CLI (optional)
npx vercel
npx vercel --prod
```

Or push to `main` — Vercel deploys automatically when Git is connected.

## 5. Verify after deploy

```bash
npm run verify-supabase
npm run verify-integrations
```

Test checklist:

- [ ] Browse products and add to cart
- [ ] Guest checkout → Paystack test payment → success page
- [ ] Paystack webhook receives `charge.success` in dashboard logs
- [ ] Customer receives BMS SMS confirmation
- [ ] Admin receives SMS alert (if `ADMIN_PHONE` set)
- [ ] COD order triggers SMS without Paystack

## Local development

Copy `.env.example` to `.env.local` and fill the same variables. Use Paystack **test** keys locally.
