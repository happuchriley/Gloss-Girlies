"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Heart } from "lucide-react"

import { useWishlistStore } from "@/store/wishlistStore"
import { useProductStore } from "@/store/productStore"
import { ProductGrid } from "@/components/products/product-grid"
import { ShopPageHeader } from "@/components/shop/shop-page-header"
import { PageTransition } from "@/components/layout/page-transition"
import { Button } from "@/components/ui/button"

export default function WishlistPage() {
  const { productIds, loading, initializeWishlist, getWishlistProducts } =
    useWishlistStore()
  const { products, initializeProducts, loading: productsLoading } =
    useProductStore()

  useEffect(() => {
    initializeProducts()
    initializeWishlist()
  }, [initializeProducts, initializeWishlist])

  const wishlistProducts = getWishlistProducts(products)

  return (
    <PageTransition className="container-app py-6 md:py-10">
      <ShopPageHeader
        eyebrow="Saved"
        title="Your wishlist"
        subtitle={`${productIds.length} pin${productIds.length === 1 ? "" : "s"} saved for later`}
        align="center"
      />

      <div className="mt-10">
        {productIds.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-pink-200 bg-pink-50/40 py-16 text-center">
            <Heart className="mx-auto h-10 w-10 text-pink-300" />
            <p className="mt-4 text-neutral-600">Your wishlist is empty</p>
            <Button className="mt-6 rounded-full bg-ink hover:bg-neutral-800" asChild>
              <Link href="/categories">Discover products</Link>
            </Button>
          </div>
        ) : (
          <ProductGrid
            products={wishlistProducts}
            loading={loading || productsLoading}
          />
        )}
      </div>
    </PageTransition>
  )
}
