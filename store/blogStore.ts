import { create } from "zustand"

import { formatSupabaseError, isMissingRelationError } from "@/lib/supabase/errors"
import { slugify } from "@/lib/slug"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  image: string
  published: boolean
  authorName: string
  createdAt: string
  updatedAt: string
}

interface BlogStore {
  posts: BlogPost[]
  loading: boolean
  initializePosts: (options?: { includeDrafts?: boolean }) => Promise<void>
  addPost: (post: Omit<BlogPost, "id" | "createdAt" | "updatedAt" | "slug"> & { slug?: string }) => Promise<boolean>
  updatePost: (id: string, post: Partial<BlogPost>) => Promise<boolean>
  deletePost: (id: string) => Promise<boolean>
  getPostBySlug: (slug: string) => BlogPost | undefined
}

function mapRow(row: Record<string, unknown>): BlogPost {
  return {
    id: String(row.id ?? ""),
    slug: String(row.slug ?? ""),
    title: String(row.title ?? ""),
    excerpt: String(row.excerpt ?? ""),
    content: String(row.content ?? ""),
    image: String(row.image ?? ""),
    published: Boolean(row.published),
    authorName: String(row.author_name ?? "Gloss Girlies"),
    createdAt: String(row.created_at ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
  }
}

export const useBlogStore = create<BlogStore>()((set, get) => ({
  posts: [],
  loading: false,

  initializePosts: async (options) => {
    if (!isSupabaseConfigured()) {
      set({ posts: [], loading: false })
      return
    }

    try {
      set({ loading: true })
      let query = supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false })

      if (!options?.includeDrafts) {
        query = query.eq("published", true)
      }

      const { data, error } = await query

      if (error) {
        if (isMissingRelationError(error, "blog_posts")) {
          if (process.env.NODE_ENV === "development") {
            console.warn(
              "[Gloss Girlies] blog_posts table not found. Run supabase/migrations/20250601_categories_blog.sql in Supabase SQL Editor."
            )
          }
        } else {
          console.error("Error fetching blog posts:", formatSupabaseError(error))
        }
        set({ posts: [], loading: false })
        return
      }

      set({
        posts: (data ?? []).map((row) => mapRow(row as Record<string, unknown>)),
        loading: false,
      })
    } catch (error) {
      console.error("Error initializing blog posts:", error)
      set({ posts: [], loading: false })
    }
  },

  addPost: async (post) => {
    const id = `blog-${Date.now()}`
    const slug = post.slug ?? slugify(post.title)
    const row = {
      id,
      slug,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      image: post.image,
      published: post.published,
      author_name: post.authorName,
    }

    if (isSupabaseConfigured()) {
      const { error } = await supabase.from("blog_posts").insert(row)
      if (error) {
        console.error("Error adding blog post:", error)
        return false
      }
    }

    const newPost = mapRow({ ...row, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    set({ posts: [newPost, ...get().posts] })
    return true
  },

  updatePost: async (id, updates) => {
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (updates.title) updateData.title = updates.title
    if (updates.slug) updateData.slug = updates.slug
    if (updates.excerpt !== undefined) updateData.excerpt = updates.excerpt
    if (updates.content !== undefined) updateData.content = updates.content
    if (updates.image !== undefined) updateData.image = updates.image
    if (updates.published !== undefined) updateData.published = updates.published
    if (updates.authorName) updateData.author_name = updates.authorName

    if (isSupabaseConfigured()) {
      const { error } = await supabase.from("blog_posts").update(updateData).eq("id", id)
      if (error) {
        console.error("Error updating blog post:", error)
        return false
      }
    }

    set({
      posts: get().posts.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })
    return true
  },

  deletePost: async (id) => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id)
      if (error) {
        console.error("Error deleting blog post:", error)
        return false
      }
    }

    set({ posts: get().posts.filter((p) => p.id !== id) })
    return true
  },

  getPostBySlug: (slug) => get().posts.find((p) => p.slug === slug),
}))
