'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FiHome, FiGrid, FiShoppingBag, FiStar } from 'react-icons/fi'

export default function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', icon: FiHome, label: 'Home' },
    { href: '/categories', icon: FiGrid, label: 'Categories' },
    { href: '/cart', icon: FiShoppingBag, label: 'Cart' },
    { href: '/reviews', icon: FiStar, label: 'Reviews' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[60] lg:hidden shadow-lg">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full ${
                isActive ? 'text-pink-600' : 'text-gray-600'
              }`}
            >
              <Icon className="text-xl mb-1" />
              <span className="text-xs">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

