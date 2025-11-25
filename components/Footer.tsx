'use client'

import Link from 'next/link'
import { FiMail, FiPhone, FiHelpCircle } from 'react-icons/fi'
import { getCurrentYear } from '@/lib/dateUtils'

export default function Footer() {
  // Use a static year to avoid hydration mismatch
  const currentYear = getCurrentYear()
  
  return (
    <footer className="bg-gray-900 text-gray-300 mt-8 sm:mt-12 md:mt-16">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Gloss Girlies</h3>
            <p className="text-xs sm:text-sm mb-3 sm:mb-4">
              Your one-stop destination for beauty and cosmetics. Discover the latest trends in skincare, makeup, and haircare.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <FiMail className="text-pink-400" />
                <span>support@glossgirlies.com</span>
              </div>
              <div className="flex items-center gap-2">
                <FiPhone className="text-pink-400" />
                <span>1800-123-4567</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-pink-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-pink-400 transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/new" className="hover:text-pink-400 transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="hover:text-pink-400 transition-colors">
                  Reviews
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-pink-400 transition-colors">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-bold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="hover:text-pink-400 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/help/faq" className="hover:text-pink-400 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/help/contact" className="hover:text-pink-400 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/policies/returns" className="hover:text-pink-400 transition-colors">
                  Return Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/shipping" className="hover:text-pink-400 transition-colors">
                  Shipping Info
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/policies/terms" className="hover:text-pink-400 transition-colors">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link href="/policies/privacy" className="hover:text-pink-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/cancellation" className="hover:text-pink-400 transition-colors">
                  Cancellation Policy
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-pink-400 transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm">
          <p>&copy; {currentYear} Gloss Girlies. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

