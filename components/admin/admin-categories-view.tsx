"use client"

import { useState } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"

import { AdminHeader } from "@/components/admin/admin-header"
import { adminUi } from "@/components/admin/admin-ui"
import { Button } from "@/components/ui/button"
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
import type { ShopCategory } from "@/config/categories"
import { slugify } from "@/lib/slug"

interface CategoryFormData {
  name: string
  description: string
  id: string
}

const EMPTY: CategoryFormData = { name: "", description: "", id: "" }

interface AdminCategoriesViewProps {
  categories: ShopCategory[]
  loading?: boolean
  backHref?: string
  onAdd?: (data: Omit<CategoryFormData, "id"> & { id?: string }) => Promise<boolean | void>
  onUpdate?: (id: string, data: Partial<CategoryFormData>) => Promise<boolean | void>
  onDelete?: (id: string) => Promise<boolean | void>
}

export function AdminCategoriesView({
  categories,
  loading = false,
  backHref = "/admin",
  onAdd,
  onUpdate,
  onDelete,
}: AdminCategoriesViewProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<ShopCategory | null>(null)
  const [form, setForm] = useState<CategoryFormData>(EMPTY)

  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY)
    setSheetOpen(true)
  }

  const openEdit = (category: ShopCategory) => {
    setEditing(category)
    setForm({
      name: category.name,
      description: category.description,
      id: category.id,
    })
    setSheetOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editing && onUpdate) {
      await onUpdate(editing.id, {
        name: form.name,
        description: form.description,
      })
    } else if (onAdd) {
      await onAdd({
        name: form.name,
        description: form.description,
        id: form.id || slugify(form.name).replace(/-/g, ""),
      })
    }
    setSheetOpen(false)
    setForm(EMPTY)
    setEditing(null)
  }

  return (
    <>
      <AdminHeader
        title="Categories"
        subtitle="Add and manage shop categories shown across the storefront."
        backHref={backHref}
        action={
          <Button onClick={openAdd} className={adminUi.primaryBtn}>
            <Plus className="h-4 w-4" />
            Add category
          </Button>
        }
      />

      <Card className={adminUi.card}>
        <CardHeader className={adminUi.cardHeader}>
          <CardTitle className={adminUi.cardTitle}>
            {categories.length} categor{categories.length === 1 ? "y" : "ies"}
          </CardTitle>
          <CardDescription>
            Categories appear in navigation, the shop grid, and product forms.
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-pink-50 p-0">
          {loading ? (
            <p className="p-6 text-sm text-neutral-500">Loading categories…</p>
          ) : categories.length === 0 ? (
            <p className="p-6 text-sm text-neutral-500">No categories yet.</p>
          ) : (
            categories.map((category) => (
              <div
                key={category.id}
                className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"
              >
                <div>
                  <p className="font-medium text-ink">{category.name}</p>
                  <p className={`font-mono text-xs ${adminUi.accentLink}`}>/{category.id}</p>
                  <p className="mt-1 text-sm text-neutral-500">{category.description}</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={adminUi.ghostIconBtn}
                    onClick={() => openEdit(category)}
                    aria-label="Edit category"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => {
                      if (confirm(`Delete category "${category.name}"?`)) {
                        onDelete?.(category.id)
                      }
                    }}
                    aria-label="Delete category"
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
        <SheetContent className={adminUi.sheetContentMd}>
          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-6">
              <SheetHeader>
                <SheetTitle className="font-display">
                  {editing ? "Edit category" : "Add category"}
                </SheetTitle>
                <SheetDescription>
                  {editing
                    ? "Update the category name or description."
                    : "Create a new category for products and shop navigation."}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="catName">Name</Label>
              <Input
                id="catName"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                    id: editing ? form.id : slugify(e.target.value).replace(/-/g, ""),
                  })
                }
                className={adminUi.input}
                required
              />
            </div>
            {!editing && (
              <div className="space-y-2">
                <Label htmlFor="catId">URL slug</Label>
                <Input
                  id="catId"
                  value={form.id}
                  onChange={(e) => setForm({ ...form, id: e.target.value })}
                  className="rounded-xl border-pink-200 font-mono text-sm"
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="catDesc">Description</Label>
              <textarea
                id="catDesc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className={adminUi.textarea}
                required
              />
            </div>
              </div>
            </div>
            <div className={adminUi.sheetFooter}>
              <Button type="submit" className={`w-full ${adminUi.primaryBtn}`}>
                {editing ? "Save changes" : "Add category"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  )
}
