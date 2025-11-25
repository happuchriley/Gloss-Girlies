'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useProductStore } from '@/store/productStore'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { FiShoppingCart } from 'react-icons/fi'

export default function ProductGrid() {
  const { products, initializeProducts } = useProductStore()
  const addItem = useCartStore((state) => state.addItem)
  const { isAdmin } = useAuthStore()

  useEffect(() => {
    initializeProducts()
  }, [initializeProducts])

  const handleAddToCart = (e: React.MouseEvent, product: typeof products[0]) => {
    e.preventDefault()
    if (isAdmin) {
      alert('Admin accounts cannot make purchases. Please use a regular customer account.')
      return
    }
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    })
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
      {products.filter(p => p.stock > 0).map((product) => (
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
          <div className="p-2 sm:p-3 md:p-4">
            <p className="text-[10px] sm:text-xs text-gray-500 mb-1 line-clamp-1">{product.brand}</p>
            <h3 className="text-xs sm:text-sm font-medium text-gray-800 mb-1 sm:mb-2 line-clamp-2 min-h-[2.5em]">
              {product.name}
            </h3>
            <div className="flex items-center justify-between gap-1 sm:gap-2">
              <p className="text-sm sm:text-base md:text-lg font-bold text-gray-900">₵{product.price}</p>
              <button
                type="button"
                onClick={(e) => handleAddToCart(e, product)}
                disabled={isAdmin}
                className={`p-1.5 sm:p-2 rounded-full transition-colors flex-shrink-0 ${
                  isAdmin 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-pink-600 text-white hover:bg-pink-700'
                }`}
                aria-label={isAdmin ? 'Admin accounts cannot add to cart' : `Add ${product.name} to cart`}
                title={isAdmin ? 'Admin accounts cannot make purchases' : ''}
              >
                <FiShoppingCart className="text-xs sm:text-sm" />
              </button>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

