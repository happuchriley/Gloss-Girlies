'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useProductStore } from '@/store/productStore'
import Link from 'next/link'
import { useCartStore } from '@/store/cartStore'
import { FiShoppingCart, FiFilter } from 'react-icons/fi'
import { useState, useMemo } from 'react'
import BackButton from '@/components/BackButton'

export default function CategoryPage() {
  const params = useParams()
  const categoryId = params.category as string
  const { products, initializeProducts } = useProductStore()
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'name'>('name')
  const [filterBrand, setFilterBrand] = useState<string>('')

  useEffect(() => {
    initializeProducts()
  }, [initializeProducts])
  
  const categoryProducts = useMemo(() => {
    let filtered = (products || []).filter(
      (p) => p && p.category && p.category.toLowerCase() === categoryId
    )
    
    if (filterBrand) {
      filtered = filtered.filter((p) => p.brand === filterBrand)
    }
    
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price
        case 'price-desc':
          return b.price - a.price
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })
    
    return sorted
  }, [categoryId, sortBy, filterBrand])

  const brands = useMemo(() => {
    const brandSet = new Set(
      (products || [])
        .filter((p) => p && p.category && p.category.toLowerCase() === categoryId)
        .map((p) => p.brand)
        .filter(Boolean)
    )
    return Array.from(brandSet).sort()
  }, [categoryId, products])

  const addItem = useCartStore((state) => state.addItem)

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
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 md:py-8">
      <div className="mb-4 sm:mb-6">
        <BackButton />
      </div>
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 capitalize">{categoryId}</h1>
      
      {/* Filters and Sort */}
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-4 sm:mb-6 flex flex-wrap items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2">
          <FiFilter className="text-gray-600 text-sm sm:text-base" />
          <span className="font-medium text-gray-700 text-xs sm:text-sm">Filters:</span>
        </div>
        
        <div className="w-full sm:w-auto">
          <label className="block text-xs sm:text-sm text-gray-600 mb-1">Brand</label>
          <select
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
            className="w-full sm:w-auto px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="">All Brands</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>
        
        <div className="w-full sm:w-auto sm:ml-auto">
          <label className="block text-xs sm:text-sm text-gray-600 mb-1">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full sm:w-auto px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="name">Name (A-Z)</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {categoryProducts.length === 0 ? (
        <p className="text-center text-gray-500 py-8 sm:py-16 text-sm sm:text-base">No products found in this category.</p>
      ) : (
        <>
          <p className="text-gray-600 mb-3 sm:mb-4 text-xs sm:text-sm">{categoryProducts.length} product(s) found</p>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          {categoryProducts.map((product) => (
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
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm sm:text-base md:text-lg font-bold text-gray-900">₵{product.price}</p>
                  <button
                    onClick={(e) => handleAddToCart(e, product)}
                    className="bg-pink-600 text-white p-1.5 sm:p-2 rounded-full hover:bg-pink-700 transition-colors flex-shrink-0"
                    aria-label="Add to cart"
                  >
                    <FiShoppingCart className="text-xs sm:text-sm" />
                  </button>
                </div>
              </div>
            </Link>
          ))}
          </div>
        </>
      )}
    </div>
  )
}

