# Phase 3 — Store & Product System ✅

## Migration

Run in Supabase SQL Editor:

`supabase/migrations/20250528_phase3_products.sql`

Adds `featured`, `images[]`, and search index on products.

## New routes

| Route | Description |
|-------|-------------|
| `/wishlist` | Saved products (guest: localStorage; user: Supabase) |
| `/search?q=` | Search with sort, brand, price filters |
| `/categories/[id]` | Category listing with filters |
| `/new` | New arrivals (newest sort) |

## Component library

```
components/products/
  product-card.tsx       # Pinterest-style card + wishlist + quick add
  product-grid.tsx
  product-filters.tsx
  product-gallery.tsx    # PDP image gallery
  related-products.tsx
  featured-section.tsx
  category-grid.tsx
  wishlist-button.tsx
  add-to-cart-button.tsx
```

## Hooks & utilities

- `hooks/use-product-catalog.ts` — load + filter products
- `lib/products/filters.ts` — search, sort, related products
- `store/wishlistStore.ts` — wishlist state

## Test checklist

- [ ] Home: categories, best sellers, featured grid
- [ ] PDP: gallery, quantity, add to bag, related products
- [ ] Search with filters
- [ ] Category pages (skincare, makeup, etc.)
- [ ] Wishlist toggle (guest + logged in)
- [ ] Cart summary → checkout

## Next: Phase 4

See [PHASE_4_CHECKOUT.md](./PHASE_4_CHECKOUT.md) — Paystack checkout is implemented.
