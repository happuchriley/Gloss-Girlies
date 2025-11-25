'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useProductStore } from '@/store/productStore'
import { useCartStore } from '@/store/cartStore'
import { FiShoppingCart } from 'react-icons/fi'
import Link from 'next/link'
import BackButton from '@/components/BackButton'

function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const { products, initializeProducts } = useProductStore()
  const addItem = useCartStore((state) => state.addItem)

  useEffect(() => {
    initializeProducts()
  }, [initializeProducts])

  const filteredProducts = query
    ? (products || []).filter(
        (product) =>
          product &&
          (product.name?.toLowerCase().includes(query.toLowerCase()) ||
          product.brand?.toLowerCase().includes(query.toLowerCase()) ||
          product.category?.toLowerCase().includes(query.toLowerCase()) ||
          product.description?.toLowerCase().includes(query.toLowerCase()))
      )
    : []

  const handleAddToCart = (e: React.MouseEvent, product: typeof products[0]) => {
    e.preventDefault()
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        {query ? `Search Results for "${query}"` : 'Search Products'}
      </h1>

      {!query ? (
        <div className="text-center py-16">
          <p className="text-gray-500">Enter a search term to find products</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">No products found for "{query}"</p>
          <Link
            href="/"
            className="text-pink-600 hover:underline"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {(filteredProducts || []).map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="aspect-square relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
                <h3 className="text-sm font-medium text-gray-800 mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-gray-900">₵{product.price}</p>
                  <button
                    onClick={(e) => handleAddToCart(e, product)}
                    className="bg-pink-600 text-white p-2 rounded-full hover:bg-pink-700 transition-colors"
                  >
                    <FiShoppingCart className="text-sm" />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Search Products</h1>
        <div className="text-center py-16">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}

