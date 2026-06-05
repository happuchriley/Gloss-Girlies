"use client"

import { useEffect, useRef, useState } from "react"
import { Upload } from "lucide-react"

import { adminUi } from "@/components/admin/admin-ui"
import { useCategoryCatalog } from "@/hooks/use-category-catalog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { ProductWithInventory } from "@/store/productStore"

export interface ProductFormData {
  name: string
  price: string
  image: string
  category: string
  description: string
  brand: string
  stock: string
  sku: string
}

const EMPTY_FORM: ProductFormData = {
  name: "",
  price: "",
  image: "",
  category: "",
  description: "",
  brand: "",
  stock: "",
  sku: "",
}

interface ProductFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingProduct: ProductWithInventory | null
  onSubmit: (data: ProductFormData) => void
}

function normalizeImageUrl(url: string): string {
  let normalized = url.replace(/\\/g, "/")
  if (normalized.startsWith("images/")) normalized = "/" + normalized
  if (/^[A-Z]:\\/.test(normalized)) {
    const filename = normalized.split("\\").pop() || normalized.split("/").pop()
    normalized = `/images/${filename}`
  }
  return normalized
}

export function ProductFormSheet({
  open,
  onOpenChange,
  editingProduct,
  onSubmit,
}: ProductFormSheetProps) {
  const { productCategories } = useCategoryCatalog()
  const [formData, setFormData] = useState<ProductFormData>(EMPTY_FORM)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        price: editingProduct.price.toString(),
        image: editingProduct.image,
        category: editingProduct.category,
        description: editingProduct.description,
        brand: editingProduct.brand,
        stock: editingProduct.stock.toString(),
        sku: editingProduct.sku || "",
      })
    } else {
      setFormData(EMPTY_FORM)
    }
  }, [open, editingProduct])

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file")
      return
    }
    setIsUploading(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append("file", file)
      uploadFormData.append("filename", file.name)
      const response = await fetch("/api/upload-image", { method: "POST", body: uploadFormData })
      if (!response.ok) throw new Error("Upload failed")
      const data = await response.json()
      setFormData((prev) => ({ ...prev, image: data.url }))
    } catch {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result as string }))
      }
      reader.readAsDataURL(file)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onOpenChange(false)
    setFormData(EMPTY_FORM)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={`w-full ${adminUi.sheetContent}`}>
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-6">
            <SheetHeader>
              <SheetTitle className="font-display text-xl">
                {editingProduct ? "Edit product" : "Add product"}
              </SheetTitle>
              <SheetDescription>
                {editingProduct
                  ? "Update details and save changes."
                  : "Fill in the details to list a new product."}
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="productName">Product name</Label>
              <Input
                id="productName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={adminUi.input}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productBrand">Brand</Label>
              <Input
                id="productBrand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className={adminUi.input}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="productPrice">Price (₵)</Label>
              <Input
                id="productPrice"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className={adminUi.input}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productStock">Stock</Label>
              <Input
                id="productStock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className={adminUi.input}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="productCategory">Category</Label>
              <select
                id="productCategory"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className={adminUi.select}
                required
              >
                <option value="">Select category</option>
                {productCategories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="productSku">SKU</Label>
              <Input
                id="productSku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="Auto-generated if empty"
                className={adminUi.input}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Image</Label>
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setIsDragging(false)
                const files = Array.from(e.dataTransfer.files)
                if (files[0]) handleFileUpload(files[0])
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
                isDragging
                  ? "border-pink-500 bg-pink-50"
                  : "border-pink-200 hover:border-pink-400 hover:bg-pink-50/50"
              } ${isUploading ? "pointer-events-none opacity-50" : ""}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                className="hidden"
              />
              <Upload className="mx-auto mb-2 h-8 w-8 text-pink-400" />
              <p className="text-sm text-neutral-600">
                {isUploading ? "Uploading…" : "Click or drag an image here"}
              </p>
            </div>
            <Input
              value={formData.image}
              onChange={(e) =>
                setFormData({ ...formData, image: normalizeImageUrl(e.target.value) })
              }
              placeholder="/images/product.jpg or https://…"
              className="rounded-xl border-pink-200"
              required
            />
            {formData.image && (
              <div className="relative h-36 overflow-hidden rounded-xl border border-pink-100 bg-pink-50/30">
                <img src={formData.image} alt="Preview" className="h-full w-full object-cover" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="productDescription">Description</Label>
            <textarea
              id="productDescription"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className={adminUi.textarea}
              required
            />
          </div>
            </div>
          </div>

          <div className={`flex gap-3 ${adminUi.sheetFooter}`}>
            <Button
              type="button"
              variant="outline"
              className={`flex-1 ${adminUi.outlineBtn}`}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className={`flex-1 ${adminUi.primaryBtn}`}>
              {editingProduct ? "Save changes" : "Add product"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
