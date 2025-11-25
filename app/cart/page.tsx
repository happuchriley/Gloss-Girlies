'use client'

import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag } from 'react-icons/fi'
import Link from 'next/link'
import Image from 'next/image'

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal } = useCartStore()
  const { isAdmin } = useAuthStore()

  // Restrict admins from accessing cart
  if (isAdmin) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-16 text-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm p-6 sm:p-8">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-xl sm:text-2xl font-bold mb-4">Admin Accounts Cannot Make Purchases</h1>
          <p className="text-gray-600 mb-6">
            Admin accounts are restricted from making purchases. Please use a regular customer account to shop.
          </p>
          <Link
            href="/admin"
            className="inline-block bg-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-pink-700 transition-colors"
          >
            Go to Admin Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-12 md:py-16 text-center">
        <FiShoppingBag className="text-4xl sm:text-5xl md:text-6xl text-gray-300 mx-auto mb-3 sm:mb-4" />
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">Your cart is empty</h1>
        <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8 px-4">Add some products to get started!</p>
        <Link
          href="/"
          className="inline-block bg-pink-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-pink-700 transition-colors text-sm sm:text-base"
        >
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 md:py-8">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 md:mb-8">Shopping Cart</h1>
      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          {(items || []).map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full sm:w-20 md:w-24 h-32 sm:h-20 md:h-24 object-cover rounded-lg sm:flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm sm:text-base text-gray-800 mb-1 sm:mb-2 line-clamp-2">{item.name}</h3>
                <p className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-4">₵{item.price}</p>
                <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                  <div className="flex items-center gap-1 sm:gap-2 border border-gray-300 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 sm:p-2 hover:bg-gray-50"
                      aria-label="Decrease quantity"
                    >
                      <FiMinus className="text-xs sm:text-sm" />
                    </button>
                    <span className="px-2 sm:px-3 py-1 text-sm sm:text-base">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 sm:p-2 hover:bg-gray-50"
                      aria-label="Increase quantity"
                    >
                      <FiPlus className="text-xs sm:text-sm" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700 p-1.5 sm:p-2"
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <FiTrash2 className="text-sm sm:text-base" />
                  </button>
                </div>
              </div>
              <div className="text-left sm:text-right flex-shrink-0">
                <p className="text-base sm:text-lg font-bold text-gray-900">
                  ₵{item.price * item.quantity}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 sticky top-20">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₵{getTotal()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₵{getTotal()}</span>
                </div>
              </div>
            </div>
            <Link
              href="/checkout"
              className="block w-full bg-pink-600 text-white py-3 rounded-lg font-medium hover:bg-pink-700 transition-colors text-center"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

