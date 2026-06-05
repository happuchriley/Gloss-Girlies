"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { Search, TriangleAlert, Plus } from "lucide-react"

import { AdminDashboardNav } from "@/components/admin/admin-dashboard-nav"
import { PageTransition } from "@/components/layout/page-transition"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { formatPrice } from "@/lib/products/format"
import { useAuthStore } from "@/store/authStore"
import { useOrderStore } from "@/store/orderStore"
import { useProductStore } from "@/store/productStore"

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const { products, initializeProducts, loading: productsLoading } = useProductStore()
  const { orders, initializeOrders, loading: ordersLoading } = useOrderStore()
  const [query, setQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("ALL")

  useEffect(() => {
    initializeProducts()
    initializeOrders()
  }, [initializeProducts, initializeOrders])

  const metrics = useMemo(() => {
    const allOrders = orders ?? []
    const allProducts = products ?? []
    return {
      orders: allOrders.length,
      toFulfill: allOrders.filter((o) => ["pending", "confirmed"].includes(o?.status)).length,
      lowStock: allProducts.filter((p) => p && p.stock > 0 && p.stock < 20).length,
    }
  }, [orders, products])

  const loading = productsLoading || ordersLoading
  const catalog = products ?? []
  const categories = useMemo(() => {
    const counts = new Map<string, number>()
    for (const product of catalog) {
      const key = (product.category || "Uncategorized").toUpperCase()
      counts.set(key, (counts.get(key) || 0) + 1)
    }
    return [
      { label: "ALL", count: catalog.length },
      ...Array.from(counts.entries()).map(([label, count]) => ({ label, count })),
    ]
  }, [catalog])

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase()
    return catalog.filter((product) => {
      const inCategory =
        activeCategory === "ALL" ||
        (product.category || "Uncategorized").toUpperCase() === activeCategory
      if (!inCategory) return false
      if (!q) return true
      return (
        product.name.toLowerCase().includes(q) ||
        product.brand.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q)
      )
    })
  }, [catalog, query, activeCategory])

  const initials =
    user?.name
      ?.split(" ")
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "TM"

  return (
    <PageTransition className="container-app py-4 md:py-8">
      <section className="section-ash rounded-xl px-4 pb-6 pt-4 md:border md:border-pink-100">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-brand text-3xl font-semibold text-white">
          {initials}
        </div>
        <p className="label-editorial mt-4 text-center">Store Admin</p>
        <h1 className="mt-1 text-center font-display text-4xl text-ink">{user?.name ?? "The Misfits"}</h1>
        <p className="mt-1 text-center text-sm text-neutral-600">
          {user?.email ?? "theemisfits1@gmail.com"}
        </p>

        <div className="mx-auto mt-6 grid max-w-sm grid-cols-3 gap-3 text-center">
          <Stat label="Orders" value={metrics.orders} />
          <Stat label="To Fulfill" value={metrics.toFulfill} />
          <Stat label="Low Stock" value={metrics.lowStock} />
        </div>
      </section>

      <AdminDashboardNav className="mt-4" />

      <Card className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70">
        <CardContent className="flex items-start gap-3 py-4">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
          <p className="text-sm text-amber-900">
            Admin two-factor authentication is required.{" "}
            <Link className="font-semibold underline" href="/admin/profile">
              Set it up in Settings.
            </Link>
          </p>
        </CardContent>
      </Card>

      <section className="surface-card mt-4 p-4">
        <h2 className="font-display text-4xl text-ink">Products</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Manage your catalog — search, filter, and edit pieces.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            asChild
            className="h-9 rounded-md bg-brand px-4 text-xs uppercase tracking-[0.08em] text-white hover:bg-brand-dark"
          >
            <Link href="/admin/products">
              <Plus className="h-3.5 w-3.5" />
              Add product
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-9 rounded-md border-pink-200 text-xs">
            <Link href="/admin/products">Open full manager</Link>
          </Button>
        </div>

        <div className="mt-4 border-b border-pink-100 pb-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="rounded-md border-pink-200 pl-9"
            />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((category) => {
            const active = activeCategory === category.label
            return (
              <button
                key={category.label}
                type="button"
                onClick={() => setActiveCategory(category.label)}
                className={
                  active
                    ? "shrink-0 rounded-md bg-brand px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-white"
                    : "shrink-0 rounded-md border border-pink-200 bg-brand-light px-3 py-1.5 text-xs font-medium uppercase tracking-[0.08em] text-neutral-600"
                }
              >
                {category.label} <span className="opacity-70">{category.count}</span>
              </button>
            )
          })}
        </div>

        <div className="mt-4 space-y-3">
          {loading ? (
            <>
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </>
          ) : filteredProducts.length === 0 ? (
            <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-500">
              No products found for this filter.
            </p>
          ) : (
            filteredProducts.slice(0, 8).map((product) => (
              <Link
                key={product.id}
                href="/admin/products"
                className="block rounded-lg border border-pink-100 bg-white p-3 transition-colors hover:bg-brand-light/50"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{product.name}</p>
                    <p className="text-xs uppercase tracking-[0.08em] text-neutral-500">
                      {product.category} · {product.brand}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-ink">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </PageTransition>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-2xl font-medium text-ink">{value}</p>
      <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">{label}</p>
    </div>
  )
}

