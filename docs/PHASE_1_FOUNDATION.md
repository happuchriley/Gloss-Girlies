# Phase 1 — Foundation & Architecture ✅

Pinterest-inspired premium e-commerce foundation for Gloss Girlies.

## Visual direction

Inspired by modern luxury fashion e-commerce (Pinterest references: minimal layouts, editorial typography, generous whitespace, soft shadows, refined rose + champagne accents).

- **Display font:** Cormorant Garamond  
- **Body font:** DM Sans  
- **Light theme:** Warm cream background, charcoal text, rose primary  
- **Dark theme:** Deep charcoal background, cream text  

## Stack added

| Package | Purpose |
|---------|---------|
| `framer-motion` | Page & UI animations |
| `next-themes` | Dark/light mode (class-based) |
| `shadcn/ui` + Radix | Accessible UI primitives |
| `lucide-react` | Icons |
| `class-variance-authority`, `clsx`, `tailwind-merge` | Component variants |
| `tailwindcss-animate` | Motion utilities |

## Folder structure

```
components/
  ui/              # shadcn: button, input, card, sheet, etc.
  layout/          # SiteHeader, SiteFooter, MobileBottomNav, SiteShell
  providers/       # ThemeProvider, AppProviders
config/
  site.ts          # Brand, nav links, footer links
lib/
  utils.ts         # cn() helper
  fonts.ts         # next/font configuration
docs/
  PHASE_1_FOUNDATION.md
.env.example       # All env vars (Phases 2–5 placeholders)
```

## Usage

### Theme toggle

Built into the header. Uses `next-themes` with `class` strategy on `<html>`.

### Layout shell

`SiteShell` wraps all pages via `app/layout.tsx`:
- `SiteHeader` — announcement bar, search, cart, categories  
- `SiteFooter` — premium dark footer  
- `MobileBottomNav` — Framer Motion active indicator  

### New UI components

```tsx
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PageTransition } from '@/components/layout/page-transition'
```

### Page wrapper (optional)

```tsx
import { PageTransition } from '@/components/layout/page-transition'

export default function Page() {
  return (
    <PageTransition className="container-app py-8">
      {/* content */}
    </PageTransition>
  )
}
```

## Environment

Copy `.env.example` → `.env.local` and fill Supabase keys before Phase 2.

## Next: Phase 2

- PostgreSQL schema design  
- Supabase Auth (registration, login, reset, RBAC)  
- Middleware route protection  
- Guest checkout architecture  

## Commands

```bash
npm run dev      # http://localhost:3000
npm run build
npm run verify-supabase
```
