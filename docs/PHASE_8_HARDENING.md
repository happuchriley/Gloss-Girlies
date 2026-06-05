# Phase 8 — Performance & Security Hardening ✅

Phase 8 applies practical hardening at the platform and API layers.

## Security hardening

### 1) Global HTTP security headers

Updated `next.config.js` to add:

- `Strict-Transport-Security`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`
- `Cross-Origin-Opener-Policy`
- `Cross-Origin-Resource-Policy`
- App-level `Content-Security-Policy`

Also kept `poweredByHeader: false`.

### 2) API rate limiting for sensitive endpoints

Added `lib/security/rate-limit.ts`:

- lightweight in-memory limiter
- client IP extraction from forwarding headers
- reusable across route handlers

Applied limits to:

- `POST /api/orders/track` (anti-enumeration / brute-force reduction)
- `POST /api/payment/paystack/initialize` (payment abuse throttling)
- `POST /api/upload-image` (upload flood protection)

Routes now return `429` with `Retry-After` when limits are exceeded.

## Performance hardening

### 1) Better network reuse

- `next.config.js` updated to `httpAgentOptions.keepAlive: true` for improved request throughput.

### 2) Strict mode safety

- Enabled `reactStrictMode: true` to surface side-effect issues earlier during development and improve long-term runtime stability.

### 3) Removed problematic custom cache headers

- Removed custom `Cache-Control` overrides for Next internals (`/_next/static`, `/_next/image`) to avoid framework-level cache behavior conflicts and build/runtime warnings.

## Verification

- `npm run build` passes after hardening changes.

## Notes

- The current rate limiter is in-memory and instance-local. For multi-instance production deployments, replace with a centralized store (e.g., Redis/Upstash) for globally consistent limits.

## Next: Phase 9

See [PHASE_9_FINAL_CLEANUP.md](./PHASE_9_FINAL_CLEANUP.md) — final refactor and cleanup is implemented.
