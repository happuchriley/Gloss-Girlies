export function formatPrice(amount: number, currency = "GHS"): string {
  if (currency === "GHS") {
    return `₵${amount.toLocaleString("en-GH")}`
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount)
}

export function getProductImages(product: {
  image: string
  images?: string[]
}): string[] {
  const extras = (product.images ?? []).filter(Boolean)
  const primary = product.image ? [product.image] : []
  const merged = [...primary, ...extras.filter((u) => u !== product.image)]
  return merged
}
