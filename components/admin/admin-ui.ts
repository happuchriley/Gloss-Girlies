/** Shared Tailwind classes for admin pages — matches storefront system tokens. */
export const adminUi = {
  card: "surface-card overflow-hidden",
  cardHeader: "border-b border-pink-100 bg-surface",
  cardTitle: "font-display text-xl",
  primaryBtn: "rounded-md bg-brand text-white hover:bg-brand-dark",
  outlineBtn: "rounded-md border-pink-200",
  input: "rounded-md border-pink-200",
  textarea:
    "flex w-full rounded-md border border-pink-200 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30",
  select:
    "flex h-10 w-full rounded-md border border-pink-200 bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30",
  row: "transition-colors hover:bg-brand-light/40",
  listDivide: "divide-y divide-pink-100",
  sheetContent:
    "flex h-full max-h-[100dvh] flex-col gap-0 overflow-hidden border-pink-100 p-0 sm:max-w-xl",
  sheetContentMd:
    "flex h-full max-h-[100dvh] flex-col gap-0 overflow-hidden border-pink-100 p-0 sm:max-w-md",
  sheetFooter:
    "shrink-0 border-t border-pink-100 bg-background px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]",
  accentLink: "text-brand hover:text-brand-dark hover:underline",
  ghostIconBtn: "text-brand hover:bg-brand-light",
  mobileCard: "rounded-xl border border-pink-100 bg-white p-4",
  tableHeader:
    "border-b border-pink-100 bg-surface text-left text-xs uppercase tracking-wider text-neutral-500",
  infoTile: "rounded-xl border border-pink-100 bg-brand-light/30 p-4",
  infoTileLabel: "text-xs text-brand",
} as const
