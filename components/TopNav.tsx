'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FiSearch, FiShoppingCart, FiUser, FiMenu, FiHome } from 'react-icons/fi'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { useState, useEffect } from 'react'
import MobileMenu from './MobileMenu'

export default function TopNav() {
  const router = useRouter()
  const itemCount = useCartStore((state) => state.getItemCount())
  const { isAuthenticated, user } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Only show cart count and user info after hydration to avoid mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <>
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
            {/* Hamburger Menu (Mobile & Tablet) */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-50 active:bg-gray-100 rounded-lg transition-all duration-200 ease-in-out flex-shrink-0 touch-manipulation"
              aria-label="Open menu"
            >
              <FiMenu className="text-xl sm:text-2xl text-gray-600" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <img
                src="/images/Gloss Girlies.jpg"
                alt="Gloss Girlies Logo"
                className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full object-cover"
              />
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-pink-600 tracking-tight">
                Gloss Girlies
              </span>
            </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-2 sm:mx-4 md:mx-8 min-w-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 pl-8 sm:pl-10 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <button
                type="submit"
                className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-pink-600"
                aria-label="Search products"
              >
                <FiSearch className="text-sm sm:text-base" />
              </button>
            </div>
          </form>

          {/* Right Icons */}
          <div className="flex items-center gap-2 sm:gap-4 md:gap-6 flex-shrink-0">
            <Link href="/account" className="flex items-center gap-1 sm:gap-2 text-gray-700 hover:text-pink-600">
              <FiUser className="text-lg sm:text-xl" />
              <span className="hidden lg:inline">
                {mounted && isAuthenticated && user ? user.name.split(' ')[0] : 'Login'}
              </span>
            </Link>
            <Link href="/cart" className="relative flex items-center gap-1 sm:gap-2 text-gray-700 hover:text-pink-600">
              <FiShoppingCart className="text-lg sm:text-xl" />
              {mounted && itemCount > 0 && (
                <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-pink-600 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
              <span className="hidden md:inline">Cart</span>
            </Link>
          </div>
        </div>

        {/* Category Menu */}
        <div className="hidden lg:flex items-center gap-4 xl:gap-6 py-3 border-t border-gray-200 overflow-x-auto">
          <Link href="/" className="flex items-center gap-1.5 text-sm lg:text-base text-gray-700 hover:text-pink-600 whitespace-nowrap font-medium">
            <FiHome className="text-base" />
            Home
          </Link>
          <Link href="/categories/skincare" className="text-sm lg:text-base text-gray-700 hover:text-pink-600 whitespace-nowrap">
            Skincare
          </Link>
          <Link href="/categories/makeup" className="text-sm lg:text-base text-gray-700 hover:text-pink-600 whitespace-nowrap">
            Makeup
          </Link>
          <Link href="/categories/haircare" className="text-sm lg:text-base text-gray-700 hover:text-pink-600 whitespace-nowrap">
            Haircare
          </Link>
          <Link href="/categories/combos" className="text-sm lg:text-base text-gray-700 hover:text-pink-600 whitespace-nowrap">
            Combos
          </Link>
          <Link href="/new" className="text-sm lg:text-base text-gray-700 hover:text-pink-600 whitespace-nowrap">
            New
          </Link>
          <Link href="/reviews" className="text-sm lg:text-base text-gray-700 hover:text-pink-600 whitespace-nowrap">
            Reviews
          </Link>
        </div>
      </div>
      </nav>

      {/* Mobile Side Menu */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </>
  )
}

