"use client"

import Image from "next/image"
import Link from "next/link"

import { formatPrice } from "@/lib/products/format"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { CartItem } from "@/store/cartStore"

interface CheckoutSummaryProps {
  items: CartItem[]
  total: number
  paymentLabel?: string
}

export function CheckoutSummary({
  items,
  total,
  paymentLabel,
}: CheckoutSummaryProps) {
  return (
    <Card className="lg:sticky lg:top-24">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Order summary</CardTitle>
        <p className="text-sm text-muted-foreground">
          {items.length} item{items.length === 1 ? "" : "s"}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="max-h-52 space-y-3 overflow-y-auto pr-1">
          {items.map((item) => (
            <li key={item.id} className="flex gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
              </div>
              <p className="shrink-0 text-sm font-medium">
                {formatPrice(item.price * item.quantity)}
              </p>
            </li>
          ))}
        </ul>

        <Separator />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span className="font-medium text-emerald-600">Free</span>
          </div>
          {paymentLabel && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment</span>
              <span>{paymentLabel}</span>
            </div>
          )}
        </div>

        <Separator />

        <div className="flex justify-between text-base font-semibold">
          <span>Total</span>
          <span className="text-primary">{formatPrice(total)}</span>
        </div>

        <p className="text-xs text-muted-foreground">
          <Link href="/cart" className="underline-offset-4 hover:underline">
            Edit bag
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
