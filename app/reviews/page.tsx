"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Star, ImageIcon, Send, MessageSquare } from "lucide-react"

import { useProductStore } from "@/store/productStore"
import { useReviewStore } from "@/store/reviewStore"
import { useAuthStore } from "@/store/authStore"
import { formatDate } from "@/lib/dateUtils"
import { ShopPageHeader } from "@/components/shop/shop-page-header"
import { PageTransition } from "@/components/layout/page-transition"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function StarRating({
  value,
  onChange,
  readOnly = false,
}: {
  value: number
  onChange?: (n: number) => void
  readOnly?: boolean
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          className={readOnly ? "cursor-default" : "transition-transform hover:scale-110"}
          aria-label={readOnly ? undefined : `Rate ${star} stars`}
        >
          <Star
            className={`h-5 w-5 ${
              star <= value
                ? "fill-pink-500 text-pink-500"
                : "text-pink-200"
            }`}
          />
        </button>
      ))}
    </div>
  )
}

function ReviewsContent() {
  const searchParams = useSearchParams()
  const { products, initializeProducts } = useProductStore()
  const { reviews, addReview, getReviewsByProduct } = useReviewStore()
  const { user } = useAuthStore()
  const [selectedProduct, setSelectedProduct] = useState(searchParams.get("product") || "")
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    initializeProducts()
  }, [initializeProducts])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct || rating === 0 || !comment.trim()) return
    if (!user) return

    setSubmitting(true)
    const success = await addReview({
      productId: selectedProduct,
      userId: user.id,
      rating,
      comment,
      images: imagePreviews,
      videos: [],
    })
    setSubmitting(false)

    if (success) {
      setSelectedProduct("")
      setRating(0)
      setComment("")
      setImagePreviews([])
    }
  }

  const displayReviews = selectedProduct
    ? getReviewsByProduct(selectedProduct)
    : reviews

  return (
    <PageTransition className="container-app py-6 md:py-10">
      <ShopPageHeader
        eyebrow="Community"
        title="Reviews & glow checks"
        subtitle="Real experiences from Gloss Girlies shoppers — share yours after you try something."
        align="center"
      />

      <Card className="mt-10 overflow-hidden rounded-2xl border-pink-100">
        <CardHeader className="border-b border-pink-100 bg-pink-50/40">
          <CardTitle className="font-display text-xl">Write a review</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {!user ? (
            <div className="rounded-2xl border border-pink-200 bg-pink-50/50 p-6 text-center">
              <p className="text-sm text-neutral-600">Sign in to leave a review.</p>
              <Button className="mt-4 rounded-full" asChild>
                <Link href="/account?tab=login">Sign in</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="reviewProduct">Product</Label>
                <select
                  id="reviewProduct"
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  aria-label="Select product to review"
                  className="flex h-10 w-full rounded-md border border-pink-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                >
                  <option value="">Choose a product…</option>
                  {(products || []).map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Rating</Label>
                <StarRating value={rating} onChange={setRating} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reviewComment">Your review</Label>
                <textarea
                  id="reviewComment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  placeholder="Share your experience…"
                  className="flex w-full rounded-md border border-pink-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-pink-200 bg-pink-50/30 p-6 transition-colors hover:border-brand hover:bg-brand-light/50">
                <ImageIcon className="h-6 w-6 text-brand" />
                <span className="mt-2 text-xs font-medium text-neutral-600">Add photos</span>
                <span className="mt-1 text-[10px] text-muted-foreground">JPEG, PNG, or WebP</span>
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
              </label>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {imagePreviews.map((src, i) => (
                    <div key={`img-${i}`} className="relative aspect-square overflow-hidden rounded-md border border-pink-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImagePreviews((p) => p.filter((_, j) => j !== i))}
                        className="absolute right-1 top-1 rounded-full bg-ink px-1.5 text-xs text-white"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <Button
                type="submit"
                className="w-full rounded-md bg-brand hover:bg-brand-dark"
                disabled={submitting}
              >
                <Send className="h-4 w-4" />
                {submitting ? "Submitting…" : "Submit review"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <section className="mt-12">
        <h2 className="flex items-center gap-2 font-display text-2xl text-ink">
          <MessageSquare className="h-5 w-5 text-pink-500" />
          {selectedProduct
            ? `Reviews for ${products.find((p) => p.id === selectedProduct)?.name ?? "product"}`
            : "All reviews"}
        </h2>

        {displayReviews.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-pink-200 bg-pink-50/40 py-16 text-center">
            <p className="text-neutral-600">No reviews yet. Be the first to share your glow!</p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {displayReviews.map((review) => {
              const product = products.find((p) => p.id === review.productId)
              return (
                <Card key={review.id} className="rounded-2xl border-pink-100">
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-ink">{product?.name ?? "Product"}</h3>
                        <p className="mt-1 text-xs text-neutral-500">
                          {review.userName} · {formatDate(review.date)}
                        </p>
                      </div>
                      <StarRating value={review.rating} readOnly />
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-neutral-700">{review.comment}</p>
                    {review.images?.length > 0 && (
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        {review.images.map((img, i) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img key={i} src={img} alt="" className="aspect-square rounded-xl object-cover" />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>
    </PageTransition>
  )
}

export default function ReviewsPage() {
  return (
    <Suspense
      fallback={
        <div className="container-app py-12">
          <div className="h-32 animate-pulse rounded-3xl bg-pink-50" />
        </div>
      }
    >
      <ReviewsContent />
    </Suspense>
  )
}
