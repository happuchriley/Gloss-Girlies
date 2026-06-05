import type { createAdminClient } from "@/lib/supabase/admin"

type AdminClient = NonNullable<ReturnType<typeof createAdminClient>>

export interface OrderStockItem {
  product_id: string
  quantity: number
}

export class InsufficientStockError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "InsufficientStockError"
  }
}

export async function validateOrderStock(
  admin: AdminClient,
  items: OrderStockItem[]
): Promise<void> {
  if (items.length === 0) return

  const productIds = Array.from(new Set(items.map((i) => i.product_id)))
  const { data: products, error } = await admin
    .from("products")
    .select("id, name, stock")
    .in("id", productIds)

  if (error) throw new Error("Failed to validate inventory")

  const stockMap = new Map(
    (products ?? []).map((p) => [p.id, { name: p.name, stock: Number(p.stock) || 0 }])
  )

  const needed = new Map<string, number>()
  for (const item of items) {
    needed.set(item.product_id, (needed.get(item.product_id) ?? 0) + item.quantity)
  }

  for (const [productId, qty] of Array.from(needed.entries())) {
    const product = stockMap.get(productId)
    if (!product) throw new InsufficientStockError(`Product ${productId} is unavailable`)
    if (product.stock < qty) {
      throw new InsufficientStockError(
        `Not enough stock for ${product.name}. Available: ${product.stock}, requested: ${qty}`
      )
    }
  }
}

async function logMovement(
  admin: AdminClient,
  productId: string,
  orderId: string,
  changeAmount: number,
  quantityAfter: number,
  reason: string
) {
  await admin.from("inventory_movements").insert({
    product_id: productId,
    order_id: orderId,
    change_amount: changeAmount,
    quantity_after: quantityAfter,
    reason,
  })
}

export async function deductOrderStock(
  admin: AdminClient,
  orderId: string
): Promise<boolean> {
  const { data: order } = await admin
    .from("orders")
    .select("inventory_adjusted")
    .eq("id", orderId)
    .maybeSingle()

  if (!order || order.inventory_adjusted) return false

  const { data: items, error: itemsError } = await admin
    .from("order_items")
    .select("product_id, quantity")
    .eq("order_id", orderId)

  if (itemsError || !items?.length) return false

  await validateOrderStock(admin, items)

  for (const item of items) {
    const { data: product, error: fetchError } = await admin
      .from("products")
      .select("stock")
      .eq("id", item.product_id)
      .single()

    if (fetchError || !product) {
      throw new Error(`Failed to read stock for product ${item.product_id}`)
    }

    const current = Number(product.stock) || 0
    const next = Math.max(0, current - item.quantity)

    const { error: updateError } = await admin
      .from("products")
      .update({ stock: next, updated_at: new Date().toISOString() })
      .eq("id", item.product_id)

    if (updateError) throw new Error("Failed to update product stock")

    await logMovement(
      admin,
      item.product_id,
      orderId,
      -item.quantity,
      next,
      "order_confirmed"
    )
  }

  await admin
    .from("orders")
    .update({ inventory_adjusted: true, updated_at: new Date().toISOString() })
    .eq("id", orderId)

  return true
}

export async function restoreOrderStock(
  admin: AdminClient,
  orderId: string
): Promise<boolean> {
  const { data: order } = await admin
    .from("orders")
    .select("inventory_adjusted")
    .eq("id", orderId)
    .maybeSingle()

  if (!order?.inventory_adjusted) return false

  const { data: items, error: itemsError } = await admin
    .from("order_items")
    .select("product_id, quantity")
    .eq("order_id", orderId)

  if (itemsError || !items?.length) return false

  for (const item of items) {
    const { data: product, error: fetchError } = await admin
      .from("products")
      .select("stock")
      .eq("id", item.product_id)
      .single()

    if (fetchError || !product) continue

    const current = Number(product.stock) || 0
    const next = current + item.quantity

    await admin
      .from("products")
      .update({ stock: next, updated_at: new Date().toISOString() })
      .eq("id", item.product_id)

    await logMovement(
      admin,
      item.product_id,
      orderId,
      item.quantity,
      next,
      "order_cancelled"
    )
  }

  await admin
    .from("orders")
    .update({ inventory_adjusted: false, updated_at: new Date().toISOString() })
    .eq("id", orderId)

  return true
}

const DEDUCT_STATUSES = new Set(["confirmed", "shipped", "delivered"])

export async function syncInventoryForStatusChange(
  admin: AdminClient,
  orderId: string,
  previousStatus: string,
  nextStatus: string
): Promise<void> {
  const wasCommitted = DEDUCT_STATUSES.has(previousStatus)
  const isCommitted = DEDUCT_STATUSES.has(nextStatus)

  if (!wasCommitted && isCommitted) {
    await deductOrderStock(admin, orderId)
  } else if (wasCommitted && nextStatus === "cancelled") {
    await restoreOrderStock(admin, orderId)
  } else if (previousStatus === "pending" && nextStatus === "cancelled") {
    // No stock was deducted yet
    return
  }
}
