"use client"

import { useEffect } from "react"

import { AdminBlogView } from "@/components/admin/admin-blog-view"
import type { BlogFormData } from "@/components/admin/admin-blog-view"
import { PageTransition } from "@/components/layout/page-transition"
import { useBlogStore } from "@/store/blogStore"

export default function AdminBlogPage() {
  const { posts, loading, initializePosts, addPost, updatePost, deletePost } = useBlogStore()

  useEffect(() => {
    initializePosts({ includeDrafts: true })
  }, [initializePosts])

  return (
    <PageTransition className="container-app py-4 md:py-8">
      <AdminBlogView
        posts={posts}
        loading={loading}
        onAdd={(data: BlogFormData) =>
          addPost({
            title: data.title,
            slug: data.slug,
            excerpt: data.excerpt,
            content: data.content,
            image: data.image,
            published: data.published,
            authorName: data.authorName,
          })
        }
        onUpdate={(id, data) =>
          updatePost(id, {
            title: data.title,
            slug: data.slug,
            excerpt: data.excerpt,
            content: data.content,
            image: data.image,
            published: data.published,
            authorName: data.authorName,
          })
        }
        onDelete={deletePost}
      />
    </PageTransition>
  )
}
