export function generatePaystackReference(orderId: string): string {
  const suffix = `${Date.now()}${Math.random().toString(36).slice(2, 8)}`
  return `GG-${orderId.replace(/[^a-zA-Z0-9-]/g, "")}-${suffix}`
}
