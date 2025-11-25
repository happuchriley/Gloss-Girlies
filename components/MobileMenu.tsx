'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FiX, FiHome, FiGrid, FiShoppingBag, FiStar, FiUser, FiPackage } from 'react-icons/fi'
import { useAuthStore } from '@/store/authStore'
import { getCurrentYear } from '@/lib/dateUtils'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname()
  const { isAuthenticated, user } = useAuthStore()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      // Prevent body scroll on iOS
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
    } else {
      document.body.style.overflow = 'unset'
      document.body.style.position = 'unset'
      document.body.style.width = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
      document.body.style.position = 'unset'
      document.body.style.width = 'unset'
    }
  }, [isOpen])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const menuItems = [
    { href: '/', icon: FiHome, label: 'Home' },
    { href: '/categories', icon: FiGrid, label: 'Categories' },
    { href: '/categories/skincare', icon: FiPackage, label: 'Skincare' },
    { href: '/categories/makeup', icon: FiPackage, label: 'Makeup' },
    { href: '/categories/haircare', icon: FiPackage, label: 'Haircare' },
    { href: '/categories/combos', icon: FiPackage, label: 'Combos' },
    { href: '/new', icon: FiPackage, label: 'New Arrivals' },
    { href: '/reviews', icon: FiStar, label: 'Reviews' },
    { href: '/cart', icon: FiShoppingBag, label: 'Cart' },
    { href: '/account', icon: FiUser, label: isAuthenticated && user ? user.name : 'Login' },
  ]

  if (user?.role === 'admin') {
    menuItems.push({ href: '/admin', icon: FiPackage, label: 'Admin Dashboard' })
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black z-40 lg:hidden transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-25' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Side Menu */}
      <div
        ref={menuRef}
        className={`fixed left-0 top-0 bottom-0 w-72 sm:w-80 md:w-80 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100 bg-white flex-shrink-0">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-50 active:bg-gray-100 rounded-full transition-all duration-200 ease-in-out"
              aria-label="Close menu"
            >
              <FiX className="text-lg sm:text-xl text-gray-500" />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto py-3 sm:py-4 overscroll-contain pb-20">
            <ul className="space-y-1 px-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 sm:py-4 text-gray-700 rounded-lg mx-1 hover:bg-gray-50 active:bg-gray-100 hover:text-pink-600 transition-all duration-200 ease-in-out ${
                        isActive ? 'bg-pink-50 text-pink-600 font-medium' : 'font-normal'
                      }`}
                    >
                      <Icon className={`text-lg sm:text-xl flex-shrink-0 transition-colors duration-200 ${
                        isActive ? 'text-pink-600' : 'text-gray-400'
                      }`} />
                      <span className="text-sm sm:text-base">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-100 p-4 sm:p-5 bg-white flex-shrink-0 pb-20">
            <div className="text-xs sm:text-sm text-gray-400 text-center">
              <p className="font-medium text-gray-600 mb-1">Gloss Girlies</p>
              <p>&copy; {getCurrentYear()} All rights reserved</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

