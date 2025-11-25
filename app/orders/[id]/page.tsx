'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useOrderStore } from '@/store/orderStore'
import Link from 'next/link'
import { FiPackage, FiTruck, FiCheckCircle, FiMapPin, FiCreditCard, FiX } from 'react-icons/fi'
import { useState } from 'react'
import { formatDate } from '@/lib/dateUtils'
import BackButton from '@/components/BackButton'

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const { getOrderById, cancelOrder, initializeOrders } = useOrderStore()
  const [isCancelling, setIsCancelling] = useState(false)

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

  const order = getOrderById(params.id as string)

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Order not found</h1>
        <Link
          href="/orders"
          className="text-pink-600 hover:underline"
        >
          Back to Orders
        </Link>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <FiCheckCircle className="text-green-500 text-2xl" />
      case 'shipped':
        return <FiTruck className="text-blue-500 text-2xl" />
      case 'confirmed':
        return <FiPackage className="text-pink-500 text-2xl" />
      default:
        return <FiPackage className="text-gray-500 text-2xl" />
    }
  }

  const handleCancelOrder = () => {
    if (!user) return
    
    if (confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      setIsCancelling(true)
      const success = cancelOrder(order.id, user.id)
      if (success) {
        alert('Order cancelled successfully')
      } else {
        alert('Cannot cancel this order. It may have already been shipped or delivered.')
      }
      setIsCancelling(false)
    }
  }

  const canCancel = order.status === 'pending' || order.status === 'confirmed'

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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="mb-4">
          <BackButton label="Back to Orders" />
        </div>
        <h1 className="text-3xl font-bold">Order Details</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Order Status */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-4 mb-4">
              {getStatusIcon(order.status)}
              <div>
                <h2 className="text-xl font-bold">Order #{order.id}</h2>
                <p className="text-sm text-gray-500">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>
            </div>
            <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </div>
            
            {canCancel && (
              <button
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <FiX />
                {isCancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
            
            {order.trackingNumber && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500">Tracking Number</p>
                <p className="font-mono font-bold">{order.trackingNumber}</p>
              </div>
            )}
            {order.estimatedDelivery && (
              <div className="mt-2">
                <p className="text-sm text-gray-500">Estimated Delivery</p>
                <p className="font-medium">{formatDate(order.estimatedDelivery)}</p>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Order Items</h2>
            <div className="space-y-4">
              {(order.items || []).map((item) => (
                <div key={item.id} className="flex items-center gap-4 pb-4 border-b last:border-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  <p className="text-lg font-bold">₵{item.price * item.quantity}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <FiMapPin className="text-xl text-pink-600" />
              <h2 className="text-xl font-bold">Shipping Address</h2>
            </div>
            <div className="text-gray-700">
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p className="mt-2">Phone: {order.shippingAddress.phone}</p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₵{order.total}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₵{order.total}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center gap-3 mb-2">
                <FiCreditCard className="text-gray-500" />
                <span className="text-sm text-gray-500">Payment Method</span>
              </div>
              <p className="font-medium">
                {order.paymentMethod === 'card' ? 'Credit/Debit Card' : 'Cash on Delivery'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

