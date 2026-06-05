"use client"

import { useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Minus, Plus, Trash2, ShoppingBag, Sparkles } from "lucide-react"

import { useCartStore } from "@/store/cartStore"
import { useAuthStore } from "@/store/authStore"
import { formatPrice } from "@/lib/products/format"
import { toast } from "@/lib/toast"
import { PageTransition } from "@/components/layout/page-transition"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal, initializeCart, loading } =
    useCartStore()
  const { isAdmin } = useAuthStore()

  useEffect(() => {
    initializeCart()
  }, [initializeCart])

  if (isAdmin) {
    return (
      <div className="container-app py-16 text-center">
        <Card className="mx-auto max-w-md overflow-hidden rounded-3xl border-pink-100">
          <CardContent className="p-8">
            <h1 className="font-display text-xl font-semibold">Admin accounts cannot purchase</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Use a customer account to shop, or manage the store from the dashboard.
            </p>
            <Button className="mt-6 rounded-full bg-pink-600 hover:bg-pink-500" asChild>
              <Link href="/admin">Admin dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container-app py-16 text-center">
        <div className="mx-auto max-w-sm rounded-3xl bg-gradient-to-br from-pink-50 to-white px-8 py-12">
          <ShoppingBag className="mx-auto h-12 w-12 text-pink-300" />
          <h1 className="mt-4 font-display text-2xl text-ink">Your bag is empty</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Pin something beautiful — your next favorite is waiting.
          </p>
          <Button className="mt-8 rounded-full bg-ink hover:bg-neutral-800" asChild>
            <Link href="/categories">Start shopping</Link>
          </Button>
        </div>
      </div>
    )
  }

  const total = getTotal()

  return (
    <PageTransition className="container-app py-6 md:py-10">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-pink-50 via-white to-pink-50/50 px-6 py-8 sm:px-8">
        <div className="flex items-center gap-2 text-pink-600">
          <Sparkles className="h-4 w-4" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em]">Your bag</p>
        </div>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">Almost yours</h1>
        <p className="mt-1 text-sm text-neutral-600">
          {items.length} item{items.length === 1 ? "" : "s"} saved for checkout
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden rounded-2xl border-pink-100 shadow-sm transition-shadow hover:shadow-md hover:shadow-pink-100/50"
            >
              <CardContent className="flex gap-4 p-4 sm:p-5">
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-pink-50 sm:h-32 sm:w-32">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-pink-300">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div>
                    <Link
                      href={`/products/${item.id}`}
                      className="line-clamp-2 font-medium text-ink hover:text-pink-600"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 text-lg font-semibold text-pink-700">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center rounded-full border border-pink-200 bg-white">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        aria-label="Decrease"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        aria-label="Increase"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-neutral-400 hover:text-destructive"
                      onClick={() => {
                        void removeItem(item.id).then(() => {
                          toast.success("Removed from your bag", item.name)
                        })
                      }}
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="h-fit overflow-hidden rounded-2xl border-pink-100 lg:sticky lg:top-24">
          <CardContent className="space-y-4 p-6">
            <h2 className="font-display text-lg">Order summary</h2>
            <Separator className="bg-pink-100" />
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Subtotal</span>
              <span className="font-semibold text-ink">{formatPrice(total)}</span>
            </div>
            <p className="text-xs text-neutral-500">
              Shipping and taxes calculated at checkout
            </p>
            <Button
              size="lg"
              className="w-full rounded-full bg-ink hover:bg-neutral-800"
              asChild
              disabled={loading}
            >
              <Link href="/checkout">Proceed to checkout</Link>
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-full border-pink-200 hover:bg-pink-50"
              asChild
            >
              <Link href="/categories">Continue shopping</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  )
}
