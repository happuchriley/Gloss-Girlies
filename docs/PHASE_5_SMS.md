# Phase 5 — BMS SMS Notifications ✅

Order updates are sent via **BMS Africa / mNotify** (Bulk Messaging Solution API).

## Environment

```env
BMS_SMS_API_KEY=your_mnotify_api_key
BMS_SMS_SENDER_ID=GlossGirlie   # max 11 chars, registered in mNotify dashboard
ADMIN_PHONE=233XXXXXXXXX          # optional: SMS when a new order is placed
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

Get API keys from [mNotify apps](https://apps.mnotify.net) or [BMS Africa](https://bms.africa).

Optional:

| Variable | Description |
|----------|-------------|
| `BMS_SMS_API_BASE_URL` | Default `https://api.mnotify.com/api` |
| `BMS_SMS_ENABLED` | Set `false` to disable sending |

## When SMS is sent

| Trigger | Event | Recipient |
|---------|--------|-----------|
| Order placed (COD) | `order_confirmed` | Customer + optional admin |
| Paystack payment success | `order_confirmed` | Customer + optional admin |
| Admin sets status → confirmed | `order_confirmed` | Customer |
| Admin sets status → shipped | `order_shipped` | Customer |
| Admin sets status → delivered | `order_delivered` | Customer |
| Admin sets status → cancelled | `order_cancelled` | Customer |

Phone numbers are taken from the shipping address (normalized to Ghana `233…` format).

## API

| Route | Auth | Purpose |
|-------|------|---------|
| `POST /api/notifications/order` | Internal | Order placed emails + customer SMS |
| `POST /api/notifications/sms` | Admin session | Status-change SMS |

## Implementation

```
lib/sms/
  config.ts      # env helpers
  client.ts      # mNotify POST /sms/quick
  phone.ts       # 233 normalization
  messages.ts    # SMS copy templates
  order-sms.ts   # sendOrderSms()
lib/notifications/dispatch-order.ts
```

## Test checklist

- [ ] Register sender ID in mNotify dashboard
- [ ] Add `BMS_SMS_API_KEY` and `BMS_SMS_SENDER_ID` to `.env.local`
- [ ] Place COD order with Ghana phone → confirmation SMS
- [ ] Paystack test payment → confirmation SMS
- [ ] Admin: mark order **shipped** → shipping SMS
- [ ] Invalid phone → API logs failure, order still succeeds

## Next: Phase 6

See [PHASE_6_ADMIN.md](./PHASE_6_ADMIN.md) — admin dashboard refactor is implemented.
