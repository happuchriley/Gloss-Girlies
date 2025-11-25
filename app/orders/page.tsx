'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useOrderStore } from '@/store/orderStore'
import Link from 'next/link'
import { FiPackage, FiTruck, FiCheckCircle, FiXCircle } from 'react-icons/fi'
import { formatDate } from '@/lib/dateUtils'
import { useRouter } from 'next/navigation'

export default function OrdersPage() {
  const { isAuthenticated, user } = useAuthStore()
  const { getOrdersByUser, initializeOrders } = useOrderStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/account')
      return
    }
    initializeOrders()
  }, [isAuthenticated, user, router, initializeOrders])

  if (!isAuthenticated || !user) {
    return null
  }

  const orders = getOrdersByUser(user.id)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <FiCheckCircle className="text-green-500" />
      case 'shipped':
        return <FiTruck className="text-blue-500" />
      case 'confirmed':
        return <FiPackage className="text-pink-500" />
      case 'cancelled':
        return <FiXCircle className="text-red-500" />
      default:
        return <FiPackage className="text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'shipped':
        return 'bg-blue-100 text-blue-800'
      case 'confirmed':
        return 'bg-pink-100 text-pink-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 md:py-8">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 md:mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-8 sm:py-12 md:py-16">
          <FiPackage className="text-4xl sm:text-5xl md:text-6xl text-gray-300 mx-auto mb-3 sm:mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">No orders yet</h2>
          <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8 px-4">Start shopping to see your orders here</p>
          <Link
            href="/"
            className="inline-block bg-pink-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-pink-700 transition-colors text-sm sm:text-base"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {(orders || []).map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block bg-white rounded-lg shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-bold mb-1 truncate">Order #{order.id}</h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Placed on {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className={`flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(order.status)} flex-shrink-0`}>
                  {getStatusIcon(order.status)}
                  <span className="capitalize">{order.status}</span>
                </div>
              </div>

              <div className="space-y-2 mb-3 sm:mb-4">
                {(order.items || []).slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center gap-2 sm:gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium truncate">{item.name}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-xs sm:text-sm font-medium flex-shrink-0">₵{item.price * item.quantity}</p>
                  </div>
                ))}
                {order.items && order.items.length > 3 && (
                  <p className="text-xs sm:text-sm text-gray-500">+{order.items.length - 3} more items</p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 pt-3 sm:pt-4 border-t">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Total Amount</p>
                  <p className="text-base sm:text-lg font-bold">₵{order.total}</p>
                </div>
                <span className="text-sm sm:text-base text-pink-600 font-medium">View Details →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

