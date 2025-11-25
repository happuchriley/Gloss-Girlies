'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useProductStore } from '@/store/productStore'
import { FiEdit, FiPackage, FiAlertTriangle } from 'react-icons/fi'
import Link from 'next/link'

export default function AdminInventoryPage() {
  const router = useRouter()
  const { isAuthenticated, isAdmin } = useAuthStore()
  const { products, initializeProducts, updateStock } = useProductStore()
  const [editingStock, setEditingStock] = useState<{ id: string; stock: number } | null>(null)
  const [stockValue, setStockValue] = useState('')

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push('/account')
      return
    }
    initializeProducts()
  }, [isAuthenticated, isAdmin, router, initializeProducts])

  if (!isAuthenticated || !isAdmin) {
    return null
  }

  const lowStockProducts = (products || []).filter((p) => p && p.stock < 20)
  const outOfStockProducts = (products || []).filter((p) => p && p.stock === 0)

  const handleEditStock = (product: any) => {
    setEditingStock({ id: product.id, stock: product.stock })
    setStockValue(product.stock.toString())
  }

  const handleSaveStock = () => {
    if (editingStock && stockValue) {
      updateStock(editingStock.id, parseInt(stockValue) || 0)
      setEditingStock(null)
      setStockValue('')
    }
  }

  const handleCancelEdit = () => {
    setEditingStock(null)
    setStockValue('')
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      <div className="mb-6 sm:mb-8">
        <Link href="/admin" className="text-sm sm:text-base text-pink-600 hover:underline mb-2 inline-block">
          ← Back to Dashboard
        </Link>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Inventory Management</h1>
      </div>

      {/* Alerts */}
      {lowStockProducts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 mb-2">
            <FiAlertTriangle className="text-yellow-600 text-sm sm:text-base" />
            <h3 className="font-bold text-yellow-800 text-sm sm:text-base">Low Stock Alert</h3>
          </div>
          <p className="text-yellow-700 text-xs sm:text-sm">
            {lowStockProducts.length} product(s) have low stock (less than 20 units)
          </p>
        </div>
      )}

      {outOfStockProducts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 mb-2">
            <FiAlertTriangle className="text-red-600 text-sm sm:text-base" />
            <h3 className="font-bold text-red-800 text-sm sm:text-base">Out of Stock</h3>
          </div>
          <p className="text-red-700 text-xs sm:text-sm">
            {outOfStockProducts.length} product(s) are out of stock
          </p>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700">Image</th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700">Product Name</th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700 hidden md:table-cell">SKU</th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700 hidden lg:table-cell">Category</th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700">Current Stock</th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700">Status</th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(products || []).map((product) => {
                  const isLowStock = product.stock < 20
                  const isOutOfStock = product.stock === 0
                  const isEditing = editingStock?.id === product.id

                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="py-2 sm:py-3 px-2 sm:px-4">
                        <img src={product.image} alt={product.name} className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded" />
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4">
                        <div className="font-medium text-xs sm:text-sm max-w-[150px] sm:max-w-none truncate">{product.name}</div>
                        <div className="text-xs text-gray-500 md:hidden">{product.sku}</div>
                        <div className="text-xs text-gray-500 lg:hidden">{product.category}</div>
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-600 hidden md:table-cell">{product.sku}</td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm hidden lg:table-cell">{product.category}</td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4">
                        {isEditing ? (
                          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                            <input
                              type="number"
                              id={`stock-${editingStock?.id}`}
                              name={`stock-${editingStock?.id}`}
                              value={stockValue}
                              onChange={(e) => setStockValue(e.target.value)}
                              className="w-16 sm:w-20 px-2 py-1 text-xs sm:text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                              min="0"
                            />
                            <button
                              onClick={handleSaveStock}
                              className="text-green-600 hover:text-green-800 text-xs sm:text-sm"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-gray-600 hover:text-gray-800 text-xs sm:text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <span className={`text-xs sm:text-sm ${isOutOfStock ? 'text-red-600 font-bold' : isLowStock ? 'text-yellow-600 font-bold' : ''}`}>
                            {product.stock}
                          </span>
                        )}
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4">
                        {isOutOfStock ? (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                            Low Stock
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4">
                        {!isEditing && (
                          <button
                            onClick={() => handleEditStock(product)}
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs sm:text-sm"
                          >
                            <FiEdit className="text-xs sm:text-sm" />
                            <span className="hidden sm:inline">Update</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <FiPackage className="text-xl sm:text-2xl text-pink-600" />
            <div>
              <p className="text-gray-600 text-xs sm:text-sm">Total Products</p>
              <p className="text-xl sm:text-2xl font-bold">{(products || []).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <FiAlertTriangle className="text-xl sm:text-2xl text-yellow-600" />
            <div>
              <p className="text-gray-600 text-xs sm:text-sm">Low Stock Items</p>
              <p className="text-xl sm:text-2xl font-bold text-yellow-600">{lowStockProducts.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <FiAlertTriangle className="text-xl sm:text-2xl text-red-600" />
            <div>
              <p className="text-gray-600 text-xs sm:text-sm">Out of Stock</p>
              <p className="text-xl sm:text-2xl font-bold text-red-600">{outOfStockProducts.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

