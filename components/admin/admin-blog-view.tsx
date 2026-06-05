"use client"

import { useEffect, useState } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"

import { AdminHeader } from "@/components/admin/admin-header"
import { adminUi } from "@/components/admin/admin-ui"
import { MediaDropzone } from "@/components/admin/media-dropzone"
import { Button } from "@/components/ui/button"
import { insertMediaIntoContent } from "@/lib/blog/content"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { formatDate } from "@/lib/dateUtils"
import { slugify } from "@/lib/slug"
import type { BlogPost } from "@/store/blogStore"

export interface BlogFormData {
  title: string
  slug: string
  excerpt: string
  content: string
  image: string
  published: boolean
  authorName: string
}

const EMPTY: BlogFormData = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  image: "",
  published: false,
  authorName: "Gloss Girlies",
}

interface AdminBlogViewProps {
  posts: BlogPost[]
  loading?: boolean
  backHref?: string
  onAdd?: (data: BlogFormData) => Promise<boolean | void>
  onUpdate?: (id: string, data: Partial<BlogFormData>) => Promise<boolean | void>
  onDelete?: (id: string) => Promise<boolean | void>
}

export function AdminBlogView({
  posts,
  loading = false,
  backHref = "/admin",
  onAdd,
  onUpdate,
  onDelete,
}: AdminBlogViewProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<BlogPost | null>(null)
  const [form, setForm] = useState<BlogFormData>(EMPTY)

  useEffect(() => {
    if (!sheetOpen) return
    if (editing) {
      setForm({
        title: editing.title,
        slug: editing.slug,
        excerpt: editing.excerpt,
        content: editing.content,
        image: editing.image,
        published: editing.published,
        authorName: editing.authorName,
      })
    } else {
      setForm(EMPTY)
    }
  }, [sheetOpen, editing])

  const openAdd = () => {
    setEditing(null)
    setSheetOpen(true)
  }

  const openEdit = (post: BlogPost) => {
    setEditing(post)
    setSheetOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editing && onUpdate) {
      await onUpdate(editing.id, form)
    } else if (onAdd) {
      await onAdd(form)
    }
    setSheetOpen(false)
    setEditing(null)
  }

  return (
    <>
      <AdminHeader
        title="Blog"
        subtitle="Write and publish beauty tips, launches, and store updates."
        backHref={backHref}
        action={
          <Button onClick={openAdd} className={adminUi.primaryBtn}>
            <Plus className="h-4 w-4" />
            New post
          </Button>
        }
      />

      <Card className={adminUi.card}>
        <CardHeader className={adminUi.cardHeader}>
          <CardTitle className={adminUi.cardTitle}>
            {posts.length} post{posts.length === 1 ? "" : "s"}
          </CardTitle>
          <CardDescription>Published posts appear at /blog.</CardDescription>
        </CardHeader>
        <CardContent className={`${adminUi.listDivide} p-0`}>
          {loading ? (
            <p className="p-6 text-sm text-neutral-500">Loading posts…</p>
          ) : posts.length === 0 ? (
            <p className="p-6 text-sm text-neutral-500">No blog posts yet.</p>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-ink">{post.title}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                        post.published
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {post.published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <p className={`font-mono text-xs ${adminUi.accentLink}`}>/blog/{post.slug}</p>
                  <p className="mt-1 line-clamp-1 text-sm text-neutral-500">{post.excerpt}</p>
                  <p className="mt-1 text-xs text-neutral-400">
                    {formatDate(post.createdAt)} · {post.authorName}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={adminUi.ghostIconBtn}
                    onClick={() => openEdit(post)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => {
                      if (confirm(`Delete "${post.title}"?`)) onDelete?.(post.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className={`w-full ${adminUi.sheetContent}`}>
          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-6">
              <SheetHeader>
                <SheetTitle className="font-display">
                  {editing ? "Edit post" : "New blog post"}
                </SheetTitle>
                <SheetDescription>Write content for the Gloss Girlies blog.</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="blogTitle">Title</Label>
              <Input
                id="blogTitle"
                value={form.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value,
                    slug: editing ? form.slug : slugify(e.target.value),
                  })
                }
                className={adminUi.input}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="blogSlug">Slug</Label>
              <Input
                id="blogSlug"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className={`${adminUi.input} font-mono text-sm`}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="blogExcerpt">Excerpt</Label>
              <textarea
                id="blogExcerpt"
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                rows={2}
                className={adminUi.textarea}
                required
              />
            </div>
            <MediaDropzone
              label="Cover image"
              hint="Hero image shown at the top of the post."
              value={form.image}
              onChange={(url) => setForm({ ...form, image: url })}
              allowVideo={false}
            />

            <div className="space-y-2">
              <Label htmlFor="blogContent">Content</Label>
              <textarea
                id="blogContent"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={10}
                className={adminUi.textarea}
                required
              />
            </div>

            <MediaDropzone
              label="Insert pictures"
              hint="Uploads are added into the post body. You can add multiple images one at a time."
              value=""
              onChange={() => {}}
              showUrlField={false}
              insertOnly
              allowVideo={false}
              onUploaded={({ url }) =>
                setForm((current) => ({
                  ...current,
                  content: insertMediaIntoContent(current.content, url, "image"),
                }))
              }
            />
            <div className="space-y-2">
              <Label htmlFor="blogAuthor">Author</Label>
              <Input
                id="blogAuthor"
                value={form.authorName}
                onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                className={adminUi.input}
              />
            </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                  className="rounded border-pink-300"
                />
                Publish immediately
              </label>
              </div>
            </div>
            <div className={adminUi.sheetFooter}>
              <Button type="submit" className={`w-full ${adminUi.primaryBtn}`}>
                {editing ? "Save post" : "Create post"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  )
}
