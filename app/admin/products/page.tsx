"use client"

import { useEffect } from "react"

import { AdminProductsView } from "@/components/admin/admin-products-view"
import type { ProductFormData } from "@/components/admin/product-form-sheet"
import { PageTransition } from "@/components/layout/page-transition"
import { useProductStore } from "@/store/productStore"

export default function AdminProductsPage() {
  const { products, initializeProducts, addProduct, updateProduct, deleteProduct, updateStock, loading } =
    useProductStore()

  useEffect(() => {
    initializeProducts()
  }, [initializeProducts])

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

  return (
    <PageTransition className="container-app py-4 md:py-8">
      <AdminProductsView
        products={products ?? []}
        loading={loading}
        onAddProduct={(data) => addProduct(toProductData(data))}
        onUpdateProduct={(id, data) => updateProduct(id, toProductData(data))}
        onDeleteProduct={deleteProduct}
        onUpdateStock={updateStock}
      />
    </PageTransition>
  )
}
