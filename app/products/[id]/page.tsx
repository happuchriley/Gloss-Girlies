"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Minus, Plus, Star } from "lucide-react"

import { useProductStore } from "@/store/productStore"
import { useReviewStore } from "@/store/reviewStore"
import { useAuthStore } from "@/store/authStore"
import { getProductImages } from "@/lib/products/format"
import { formatPrice } from "@/lib/products/format"
import { getRelatedProducts } from "@/lib/products/filters"
import { ProductGallery } from "@/components/products/product-gallery"
import { RelatedProducts } from "@/components/products/related-products"
import { AddToCartButton } from "@/components/products/add-to-cart-button"
import { WishlistButton } from "@/components/products/wishlist-button"
import { PageTransition } from "@/components/layout/page-transition"
import BackButton from "@/components/BackButton"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function ProductDetailPage() {
  const params = useParams()
  const { products, getProductById, initializeProducts } = useProductStore()
  const { getReviewsByProduct, getAverageRating } = useReviewStore()
  const { isAdmin } = useAuthStore()
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    initializeProducts()
  }, [initializeProducts])

  const product = getProductById(params.id as string)

  if (!product) {
    return (
      <div className="container-app py-16 text-center">
        <h1 className="heading-display text-2xl font-semibold">Product not found</h1>
        <Button className="mt-6" asChild>
          <Link href="/">Back to shop</Link>
        </Button>
      </div>
    )
  }

  const images = getProductImages(product)
  const related = getRelatedProducts(products, product.id, product.category)
  const reviews = getReviewsByProduct(product.id) ?? []
  const averageRating = getAverageRating(product.id) ?? 0

  return (
    <PageTransition className="container-app py-6 md:py-10">
      <BackButton />

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery images={images} alt={product.name} />

        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {product.brand}
          </p>
          <div className="mt-2 flex items-start justify-between gap-4">
            <h1 className="heading-display mt-4 text-2xl font-semibold md:text-3xl">
              {product.name}
            </h1>
            <WishlistButton productId={product.id} />
          </div>

          {reviews.length > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(averageRating)
                        ? "fill-foreground text-foreground"
                        : "text-border"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {averageRating.toFixed(1)} ({reviews.length} reviews)
              </span>
            </div>
          )}

          <p className="mt-4 text-3xl font-semibold">
            {formatPrice(product.price)}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            {product.description}
          </p>

          <Separator className="my-6" />

          <div className="space-y-4">
            <label className="text-sm font-medium">Quantity</label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center text-lg font-medium">{quantity}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm">
              {product.stock > 0 ? (
                <span
                  className={
                    product.stock < 10 ? "text-muted-foreground" : "text-foreground"
                  }
                >
                  {product.stock} in stock
                </span>
              ) : (
                <span className="text-destructive">Out of stock</span>
              )}
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <AddToCartButton
              product={product}
              quantity={quantity}
              size="lg"
              variant="luxury"
              className="flex-1"
            />
            {!isAdmin && (
              <Button variant="outline" size="lg" asChild className="flex-1">
                <Link href="/checkout">Buy now</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      <RelatedProducts products={related} />

      {reviews.length > 0 && (
        <section className="mt-12 border-t border-border pt-10">
          <h2 className="heading-display mb-6 text-xl font-semibold">Reviews</h2>
          <div className="space-y-4">
            {reviews.slice(0, 5).map((review) => (
              <div key={review.id} className="surface-card p-4">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-3 w-3 ${
                        s <= review.rating
                          ? "fill-foreground text-foreground"
                          : "text-border"
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-2 text-sm text-foreground">{review.comment}</p>
              </div>
            ))}
          </div>
          <Button variant="link" className="mt-4 px-0" asChild>
            <Link href="/reviews">See all reviews</Link>
          </Button>
        </section>
      )}
    </PageTransition>
  )
}
