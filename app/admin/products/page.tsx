'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useProductStore, ProductWithInventory } from '@/store/productStore'
import { FiEdit, FiTrash2, FiPlus, FiX, FiUpload, FiImage } from 'react-icons/fi'
import Link from 'next/link'
import { categories } from '@/data/products'

export default function AdminProductsPage() {
  const router = useRouter()
  const { isAuthenticated, isAdmin } = useAuthStore()
  const { products, initializeProducts, addProduct, updateProduct, deleteProduct } = useProductStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductWithInventory | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    category: '',
    description: '',
    brand: '',
    stock: '',
    sku: '',
  })
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

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

  const handleOpenModal = (product?: ProductWithInventory) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name,
        price: product.price.toString(),
        image: product.image,
        category: product.category,
        description: product.description,
        brand: product.brand,
        stock: product.stock.toString(),
        sku: product.sku || '',
      })
    } else {
      setEditingProduct(null)
      setFormData({
        name: '',
        price: '',
        image: '',
        category: '',
        description: '',
        brand: '',
        stock: '',
        sku: '',
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
    setIsDragging(false)
  }

  // Normalize image URL (convert backslashes to forward slashes)
  const normalizeImageUrl = (url: string): string => {
    // Replace backslashes with forward slashes
    let normalized = url.replace(/\\/g, '/')
    // Ensure it starts with / if it's a local path
    if (normalized.startsWith('images/')) {
      normalized = '/' + normalized
    }
    // If it's a Windows path like C:\ or D:\, convert to /images/ format
    if (/^[A-Z]:\\/.test(normalized)) {
      const filename = normalized.split('\\').pop() || normalized.split('/').pop()
      normalized = `/images/${filename}`
    }
    return normalized
  }

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    setIsUploading(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('filename', file.name)

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: uploadFormData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      setFormData(prev => ({ ...prev, image: data.url }))
    } catch (error) {
      console.error('Error uploading image:', error)
      // Fallback: use base64 data URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }))
      }
      reader.readAsDataURL(file)
    } finally {
      setIsUploading(false)
    }
  }

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const productData = {
      name: formData.name,
      price: parseFloat(formData.price),
      image: formData.image,
      category: formData.category,
      description: formData.description,
      brand: formData.brand,
      stock: parseInt(formData.stock) || 0,
      sku: formData.sku,
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, productData)
    } else {
      addProduct(productData)
    }

    handleCloseModal()
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id)
    }
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <Link href="/admin" className="text-sm sm:text-base text-pink-600 hover:underline mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Product Management</h1>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-pink-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center"
        >
          <FiPlus />
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700">Image</th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700">Name</th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700 hidden md:table-cell">Brand</th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700 hidden lg:table-cell">Category</th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700">Price</th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700">Stock</th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700 hidden xl:table-cell">SKU</th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(products || []).map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="py-2 sm:py-3 px-2 sm:px-4">
                      <img src={product.image} alt={product.name} className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded" />
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4">
                      <div className="font-medium text-xs sm:text-sm max-w-[150px] sm:max-w-none truncate">{product.name}</div>
                      <div className="text-xs text-gray-500 md:hidden">{product.brand}</div>
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm hidden md:table-cell">{product.brand}</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm hidden lg:table-cell">{product.category}</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium">₵{product.price}</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4">
                      <span className={`text-xs sm:text-sm ${product.stock < 20 ? 'text-red-600 font-bold' : ''}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-600 hidden xl:table-cell">{product.sku}</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal(product)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          aria-label="Edit product"
                        >
                          <FiEdit className="text-sm sm:text-base" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          aria-label="Delete product"
                        >
                          <FiTrash2 className="text-sm sm:text-base" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button type="button" onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700" aria-label="Close modal">
                <FiX className="text-xl" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                  <input
                    type="text"
                    id="productName"
                    name="productName"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand *</label>
                  <input
                    type="text"
                    id="productBrand"
                    name="productBrand"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (₵) *</label>
                  <input
                    type="number"
                    id="productPrice"
                    name="productPrice"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock *</label>
                  <input
                    type="number"
                    id="productStock"
                    name="productStock"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    id="productCategory"
                    name="productCategory"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                  <input
                    type="text"
                    id="productSku"
                    name="productSku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Auto-generated if empty"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image *</label>
                
                {/* Drag and Drop Zone */}
                <div
                  ref={dropZoneRef}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragging
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-300 hover:border-pink-400 hover:bg-gray-50'
                  } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <FiUpload className="mx-auto text-3xl text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-1">
                    {isUploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                </div>

                {/* Or use URL */}
                <div className="mt-3">
                  <p className="text-xs text-gray-600 mb-2 text-center">OR enter image URL:</p>
                  <input
                    type="text"
                    id="productImage"
                    name="productImage"
                    value={formData.image}
                    onChange={(e) => {
                      const normalized = normalizeImageUrl(e.target.value)
                      setFormData({ ...formData, image: normalized })
                    }}
                    placeholder="https://example.com/image.jpg or /images/product.jpg"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tip: Use <code className="bg-gray-100 px-1 rounded">/images/1.jpg</code> for local images
                  </p>
                </div>
                {formData.image && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-600 mb-2">Image Preview:</p>
                    <div className="relative w-full max-w-xs h-48 border border-gray-300 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={formData.image}
                        alt="Product preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          const parent = target.parentElement
                          if (parent && !parent.querySelector('.error-message')) {
                            const errorDiv = document.createElement('div')
                            errorDiv.className = 'error-message flex items-center justify-center h-full text-red-500 text-sm'
                            errorDiv.textContent = 'Image failed to load'
                            parent.appendChild(errorDiv)
                          }
                        }}
                        onLoad={(e) => {
                          const target = e.target as HTMLImageElement
                          const parent = target.parentElement
                          const errorMsg = parent?.querySelector('.error-message')
                          if (errorMsg) errorMsg.remove()
                        }}
                      />
                    </div>
                  </div>
                )}
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs font-medium text-blue-900 mb-2">How to get image URLs:</p>
                  <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                    <li><strong>External URLs:</strong> Use direct image links (e.g., https://example.com/image.jpg)</li>
                    <li><strong>Local images:</strong> Place images in <code className="bg-blue-100 px-1 rounded">/public/images/</code> and use <code className="bg-blue-100 px-1 rounded">/images/filename.jpg</code></li>
                    <li><strong>Image hosting:</strong> Upload to Imgur, Cloudinary, or similar services and copy the direct link</li>
                    <li><strong>CDN:</strong> Use services like Cloudflare Images, AWS S3, or Supabase Storage</li>
                  </ul>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  id="productDescription"
                  name="productDescription"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 transition-colors"
                >
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

