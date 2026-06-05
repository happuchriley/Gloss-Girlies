"use client"

import { useEffect } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { PageTransition } from "@/components/layout/page-transition"
import { ShopPageHeader } from "@/components/shop/shop-page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { isVideoMediaUrl } from "@/hooks/use-media-upload"
import { formatDate } from "@/lib/dateUtils"
import { useBlogStore } from "@/store/blogStore"

export default function BlogPage() {
  const { posts, loading, initializePosts } = useBlogStore()

  useEffect(() => {
    initializePosts()
  }, [initializePosts])

  return (
    <PageTransition className="container-app py-6 md:py-10">
      <ShopPageHeader
        eyebrow="Journal"
        title="Beauty blog"
        subtitle="Tips, routines, and Gloss Girlies updates — curated like your favourite mood board."
        align="center"
      />

      <div className="mx-auto mt-10 max-w-4xl">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        ) : posts.length === 0 ? (
          <Card className="rounded-2xl border-dashed border-pink-200 bg-pink-50/30">
            <CardContent className="py-16 text-center">
              <p className="text-neutral-600">New stories coming soon.</p>
              <Link
                href="/categories"
                className="mt-4 inline-block text-sm font-medium text-pink-600 hover:underline"
              >
                Shop the collection
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                <Card className="overflow-hidden rounded-2xl border-pink-100 transition-all hover:border-pink-300 hover:shadow-md hover:shadow-pink-100/50">
                  <CardContent className="flex flex-col gap-4 p-0 sm:flex-row">
                    {post.image && !isVideoMediaUrl(post.image) ? (
                      <div className="aspect-[16/10] w-full shrink-0 overflow-hidden bg-pink-50 sm:w-56">
                        <img
                          src={post.image}
                          alt=""
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-[16/10] w-full items-center justify-center bg-gradient-to-br from-pink-100 to-pink-50 sm:w-56">
                        <span className="font-display text-2xl text-pink-300">GG</span>
                      </div>
                    )}
                    <div className="flex flex-1 flex-col justify-center p-5 sm:py-6">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-pink-500">
                        {formatDate(post.createdAt)}
                      </p>
                      <h2 className="mt-1 font-display text-xl text-ink group-hover:text-pink-700">
                        {post.title}
                      </h2>
                      <p className="mt-2 line-clamp-2 text-sm text-neutral-600">{post.excerpt}</p>
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-pink-600">
                        Read more
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
