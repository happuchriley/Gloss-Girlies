'use client'

import { useEffect } from 'react'
import HeroBanner from '@/components/HeroBanner'
import ProductGrid from '@/components/ProductGrid'
import CategorySection from '@/components/CategorySection'
import { useProductStore } from '@/store/productStore'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { FiShoppingCart } from 'react-icons/fi'
import Link from 'next/link'

export default function Home() {
  const { products, initializeProducts } = useProductStore()
  const { isAuthenticated } = useAuthStore()
  const addItem = useCartStore((state) => state.addItem)

  // Defer product loading to prioritize LCP
  useEffect(() => {
    // Delay product loading slightly to prioritize hero image
    const timer = setTimeout(() => {
      initializeProducts()
    }, 100)
    return () => clearTimeout(timer)
  }, [initializeProducts])
  
  const handleAddToCart = (e: React.MouseEvent, product: typeof products[0]) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    })
  }

  // Get best sellers (top 4 products by price - in real app, this would be by sales)
  const bestSellers = (products || [])
    .filter(p => p && p.stock > 0)
    .sort((a, b) => (b?.price || 0) - (a?.price || 0))
    .slice(0, 4)

  return (
    <div>
      <HeroBanner />
      
      {/* Login/Register CTA for non-authenticated users */}
      {!isAuthenticated && (
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white py-4 sm:py-6">
          <div className="container mx-auto px-2 sm:px-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <p className="text-sm sm:text-base font-medium text-center sm:text-left">
                Join Gloss Girlies for exclusive deals and faster checkout!
              </p>
              <div className="flex gap-2 sm:gap-3">
                <Link
                  href="/account?tab=login"
                  className="bg-white text-pink-600 px-4 sm:px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm sm:text-base whitespace-nowrap"
                >
                  Login
                </Link>
                <Link
                  href="/account?tab=register"
                  className="bg-pink-700 text-white px-4 sm:px-6 py-2 rounded-lg font-medium hover:bg-pink-800 transition-colors text-sm sm:text-base whitespace-nowrap border border-white/20"
                >
                  Register
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Defer category section to prioritize LCP */}
      <div style={{ contentVisibility: 'auto' }}>
        <CategorySection />
      </div>
      
      {/* Best Sellers - Defer loading */}
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 md:py-8" style={{ contentVisibility: 'auto' }}>
        <div className="flex items-center justify-between mb-4 sm:mb-6 px-2 sm:px-0">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Best Sellers</h2>
          <Link href="/categories" className="text-sm sm:text-base text-pink-600 hover:underline font-medium">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          {bestSellers.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow relative"
            >
              <div className="aspect-square relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
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
                    className="bg-pink-600 text-white p-1.5 sm:p-2 rounded-full hover:bg-pink-700 transition-colors flex-shrink-0"
                    aria-label={`Add ${product.name} to cart`}
                  >
                    <FiShoppingCart className="text-xs sm:text-sm" />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Products - Defer loading */}
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 md:py-8" style={{ contentVisibility: 'auto' }}>
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 px-2 sm:px-0">Featured Products</h2>
        <ProductGrid />
      </div>
    </div>
  )
}

