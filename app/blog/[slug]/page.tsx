"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"

import { BlogContent, BlogCoverMedia } from "@/components/blog/blog-content"
import { PageTransition } from "@/components/layout/page-transition"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate } from "@/lib/dateUtils"
import { useBlogStore } from "@/store/blogStore"

export default function BlogPostPage() {
  const params = useParams()
  const slug = params.slug as string
  const { posts, loading, initializePosts, getPostBySlug } = useBlogStore()

  useEffect(() => {
    initializePosts()
  }, [initializePosts])

  const post = getPostBySlug(slug)

  if (!loading && !post) {
    return (
      <PageTransition className="container-app py-16 text-center">
        <h1 className="font-display text-2xl text-ink">Post not found</h1>
        <Link href="/blog" className="mt-4 inline-block text-pink-600 hover:underline">
          Back to blog
        </Link>
      </PageTransition>
    )
  }

  if (!post) return null

  return (
    <PageTransition className="container-app py-6 md:py-10">
      <article className="mx-auto max-w-3xl">
        <Link href="/blog" className="text-sm text-pink-600 hover:underline">
          ← Back to blog
        </Link>

        <header className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-pink-50 via-white to-pink-100/40 px-6 py-10 sm:px-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-pink-500">
            {formatDate(post.createdAt)} · {post.authorName}
          </p>
          <h1 className="mt-3 font-display text-3xl text-ink sm:text-4xl">{post.title}</h1>
          {post.excerpt && (
            <p className="mt-4 text-sm leading-relaxed text-neutral-600">{post.excerpt}</p>
          )}
        </header>

        <BlogCoverMedia src={post.image} alt={post.title} />

        <Card className="mt-8 rounded-2xl border-pink-100">
          <CardContent className="prose prose-neutral max-w-none p-6 sm:p-8">
            <BlogContent content={post.content} />
          </CardContent>
        </Card>
      </article>
    </PageTransition>
  )
}
