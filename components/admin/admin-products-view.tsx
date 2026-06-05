"use client"

import { useMemo, useState } from "react"
import { AlertTriangle, Pencil, Plus, Trash2 } from "lucide-react"

import { AdminHeader } from "@/components/admin/admin-header"
import { adminUi } from "@/components/admin/admin-ui"
import {
  ProductFormSheet,
  type ProductFormData,
} from "@/components/admin/product-form-sheet"
import { StockBadge } from "@/components/admin/stock-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { formatPrice } from "@/lib/products/format"
import type { ProductWithInventory } from "@/store/productStore"

interface AdminProductsViewProps {
  products: ProductWithInventory[]
  loading?: boolean
  preview?: boolean
  backHref?: string
  onAddProduct?: (data: ProductFormData) => void | Promise<boolean | void>
  onUpdateProduct?: (id: string, data: ProductFormData) => void | Promise<boolean | void>
  onDeleteProduct?: (id: string) => void | Promise<boolean | void>
  onUpdateStock?: (id: string, stock: number) => void | Promise<boolean | void>
}

export function AdminProductsView({
  products,
  loading = false,
  preview = false,
  backHref = "/admin",
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateStock,
}: AdminProductsViewProps) {
  const [localProducts, setLocalProducts] = useState<ProductWithInventory[] | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductWithInventory | null>(null)
  const [editingStockId, setEditingStockId] = useState<string | null>(null)
  const [stockValue, setStockValue] = useState("")
  const [query, setQuery] = useState("")

  const catalog = localProducts ?? products

  const { lowStock, outOfStock } = useMemo(() => {
    return {
      lowStock: catalog.filter((p) => p.stock > 0 && p.stock < 20),
      outOfStock: catalog.filter((p) => p.stock === 0),
    }
  }, [catalog])

  const filteredProducts = useMemo(() => {
    if (!query.trim()) return catalog
    const q = query.trim().toLowerCase()
    return catalog.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q))
    )
  }, [catalog, query])

  const applyLocal = (next: ProductWithInventory[]) => {
    setLocalProducts(next)
  }

  const openAdd = () => {
    setEditingProduct(null)
    setSheetOpen(true)
  }

  const openEdit = (product: ProductWithInventory) => {
    setEditingProduct(product)
    setSheetOpen(true)
  }

  const toProductData = (data: ProductFormData) => ({
    name: data.name,
    price: parseFloat(data.price),
    image: data.image,
    category: data.category,
    description: data.description,
    brand: data.brand,
    stock: parseInt(data.stock) || 0,
    sku: data.sku,
  })

  const handleFormSubmit = async (data: ProductFormData) => {
    const productData = toProductData(data)
    if (preview) {
      if (editingProduct) {
        applyLocal(
          catalog.map((p) =>
            p.id === editingProduct.id ? { ...p, ...productData } : p
          )
        )
      } else {
        applyLocal([
          {
            ...productData,
            id: `preview-${Date.now()}`,
            sku: productData.sku || `SKU-${Date.now()}`,
          },
          ...catalog,
        ])
      }
    } else if (editingProduct && onUpdateProduct) {
      await onUpdateProduct(editingProduct.id, data)
    } else if (onAddProduct) {
      await onAddProduct(data)
    }
    setEditingProduct(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product? This cannot be undone.")) return
    if (preview) {
      applyLocal(catalog.filter((p) => p.id !== id))
    } else if (onDeleteProduct) {
      await onDeleteProduct(id)
    }
  }

  const saveStock = async (id: string) => {
    const stock = parseInt(stockValue) || 0
    if (preview) {
      applyLocal(catalog.map((p) => (p.id === id ? { ...p, stock } : p)))
    } else if (onUpdateStock) {
      await onUpdateStock(id, stock)
    }
    setEditingStockId(null)
    setStockValue("")
  }

  return (
    <>
      <AdminHeader
        title="Products & inventory"
        subtitle="Manage catalog, pricing, and stock levels."
        backHref={backHref}
        action={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className={`${adminUi.input} sm:w-56`}
            />
            <Button
              onClick={openAdd}
              className={`w-full sm:w-auto ${adminUi.primaryBtn}`}
            >
              <Plus className="h-4 w-4" />
              Add product
            </Button>
          </div>
        }
      />

      {(lowStock.length > 0 || outOfStock.length > 0) && (
        <div className="mb-6 space-y-2">
          {outOfStock.length > 0 && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                <strong>{outOfStock.length}</strong> product
                {outOfStock.length === 1 ? " is" : "s are"} out of stock.
              </span>
            </div>
          )}
          {lowStock.length > 0 && (
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                <strong>{lowStock.length}</strong> product
                {lowStock.length === 1 ? " has" : "s have"} low stock (under 20 units).
              </span>
            </div>
          )}
        </div>
      )}

      <Card className={adminUi.card}>
        <CardHeader className={adminUi.cardHeader}>
          <CardTitle className={adminUi.cardTitle}>
            {filteredProducts.length} product{filteredProducts.length === 1 ? "" : "s"}
          </CardTitle>
          <CardDescription>
            {preview
              ? "Preview mode — edits stay on this page only."
              : "Stock auto-updates when orders are confirmed. Click stock to edit manually."}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-neutral-500">No products found.</p>
              <Button onClick={openAdd} className={`mt-4 ${adminUi.primaryBtn}`}>
                <Plus className="h-4 w-4" />
                Add your first product
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-3 p-4 md:hidden">
                {filteredProducts.map((product) => {
                  const isEditingStock = editingStockId === product.id
                  return (
                    <div key={product.id} className="rounded-xl border border-pink-100 bg-white p-4">
                      <div className="flex items-start gap-3">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-12 w-12 rounded-xl border border-pink-100 object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-pink-100 bg-pink-50 text-xs text-pink-400">
                            IMG
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-ink">{product.name}</p>
                          <p className="text-xs text-neutral-500">
                            {product.brand} · {product.category}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-ink">
                            {formatPrice(product.price)}
                          </p>
                        </div>
                        <StockBadge stock={product.stock} />
                      </div>

                      <div className="mt-3">
                        {isEditingStock ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <Input
                              type="number"
                              min={0}
                              value={stockValue}
                              onChange={(e) => setStockValue(e.target.value)}
                              className="h-8 w-20 rounded-lg border-pink-200 text-xs"
                            />
                            <Button
                              size="sm"
                              className={`h-8 text-xs ${adminUi.primaryBtn}`}
                              onClick={() => saveStock(product.id)}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 text-xs"
                              onClick={() => setEditingStockId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingStockId(product.id)
                              setStockValue(String(product.stock))
                            }}
                            className={`rounded-lg px-2 py-1 text-sm font-medium transition-colors hover:bg-pink-100 ${
                              product.stock === 0
                                ? "text-red-600"
                                : product.stock < 20
                                  ? "text-amber-700"
                                  : "text-ink"
                            }`}
                          >
                            Stock: {product.stock}
                          </button>
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 ${adminUi.ghostIconBtn}`}
                          onClick={() => openEdit(product)}
                          aria-label="Edit product"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(product.id)}
                          aria-label="Delete product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="hidden overflow-x-auto md:block">
              <table className="min-w-[820px] text-sm">
                <thead>
                  <tr className="border-b border-pink-100 bg-pink-50/20 text-left text-xs uppercase tracking-wider text-neutral-500">
                    <th className="px-4 py-3 font-medium sm:px-6">Product</th>
                    <th className="hidden px-4 py-3 font-medium md:table-cell sm:px-6">Category</th>
                    <th className="px-4 py-3 font-medium sm:px-6">Price</th>
                    <th className="px-4 py-3 font-medium sm:px-6">Stock</th>
                    <th className="hidden px-4 py-3 font-medium lg:table-cell sm:px-6">Status</th>
                    <th className="px-4 py-3 font-medium sm:px-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-50">
                  {filteredProducts.map((product) => {
                    const isEditingStock = editingStockId === product.id
                    return (
                      <tr key={product.id} className="transition-colors hover:bg-pink-50/30">
                        <td className="px-4 py-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="h-12 w-12 rounded-xl border border-pink-100 object-cover"
                              />
                            ) : (
                              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-pink-100 bg-pink-50 text-xs text-pink-400">
                                IMG
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="truncate font-medium text-ink">{product.name}</p>
                              <p className="text-xs text-neutral-500">{product.brand}</p>
                            </div>
                          </div>
                        </td>
                        <td className="hidden px-4 py-4 text-neutral-600 md:table-cell sm:px-6">
                          {product.category}
                        </td>
                        <td className="px-4 py-4 font-semibold sm:px-6">
                          {formatPrice(product.price)}
                        </td>
                        <td className="px-4 py-4 sm:px-6">
                          {isEditingStock ? (
                            <div className="flex items-center gap-1.5">
                              <Input
                                type="number"
                                min={0}
                                value={stockValue}
                                onChange={(e) => setStockValue(e.target.value)}
                                className="h-8 w-16 rounded-lg border-pink-200 text-xs"
                              />
                              <Button
                                size="sm"
                                className={`h-8 text-xs ${adminUi.primaryBtn}`}
                                onClick={() => saveStock(product.id)}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 text-xs"
                                onClick={() => setEditingStockId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingStockId(product.id)
                                setStockValue(String(product.stock))
                              }}
                              className={`rounded-lg px-2 py-1 text-sm font-medium transition-colors hover:bg-pink-100 ${
                                product.stock === 0
                                  ? "text-red-600"
                                  : product.stock < 20
                                    ? "text-amber-700"
                                    : "text-ink"
                              }`}
                            >
                              {product.stock}
                            </button>
                          )}
                        </td>
                        <td className="hidden px-4 py-4 lg:table-cell sm:px-6">
                          <StockBadge stock={product.stock} />
                        </td>
                        <td className="px-4 py-4 sm:px-6">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-8 w-8 ${adminUi.ghostIconBtn}`}
                              onClick={() => openEdit(product)}
                              aria-label="Edit product"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:bg-red-50"
                              onClick={() => handleDelete(product.id)}
                              aria-label="Delete product"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <ProductFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        editingProduct={editingProduct}
        onSubmit={handleFormSubmit}
      />
    </>
  )
}
