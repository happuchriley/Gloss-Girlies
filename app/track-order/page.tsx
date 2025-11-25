'use client'

import { useState, useEffect } from 'react'
import { useOrderStore } from '@/store/orderStore'
import { FiPackage, FiSearch, FiTruck, FiCheckCircle, FiClock, FiMapPin } from 'react-icons/fi'
import Link from 'next/link'
import { formatDate } from '@/lib/dateUtils'
import BackButton from '@/components/BackButton'

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const { getOrderById, orders, initializeOrders } = useOrderStore()
  const [order, setOrder] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    initializeOrders()
  }, [initializeOrders])

  const handleTrack = async () => {
    setError('')
    setOrder(null)
    setLoading(true)

    try {
      // Try to find by order ID first
      if (orderId.trim()) {
        const foundOrder = getOrderById(orderId.trim())
        if (foundOrder) {
          setOrder(foundOrder)
          setLoading(false)
          return
        }
      }

      // Try to find by tracking number
      if (trackingNumber.trim()) {
        const foundOrder = orders.find((o) => 
          o.trackingNumber && o.trackingNumber.toUpperCase() === trackingNumber.trim().toUpperCase()
        )
        if (foundOrder) {
          setOrder(foundOrder)
          setLoading(false)
          return
        }
      }

      setError('Order not found. Please check your Order ID or Tracking Number.')
    } catch (err) {
      setError('An error occurred while tracking your order.')
    } finally {
      setLoading(false)
    }
  }

  const getTrackingSteps = (status: string) => {
    const steps = [
      { key: 'pending', label: 'Order Placed', icon: FiPackage, completed: true },
      { key: 'confirmed', label: 'Order Confirmed', icon: FiCheckCircle, completed: status !== 'pending' },
      { key: 'shipped', label: 'Shipped', icon: FiTruck, completed: ['shipped', 'delivered'].includes(status) },
      { key: 'delivered', label: 'Delivered', icon: FiCheckCircle, completed: status === 'delivered' },
    ]
    return steps
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <BackButton />
      </div>
      <h1 className="text-3xl font-bold mb-8">Track Your Order</h1>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <FiSearch className="text-2xl text-pink-600" />
            <h2 className="text-xl font-bold">Enter Order Details</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 mb-2">
                Order ID
              </label>
              <input
                type="text"
                id="orderId"
                name="orderId"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g., ORD-1234567890"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div className="text-center text-gray-500">OR</div>

            <div>
              <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Tracking Number
              </label>
              <input
                type="text"
                id="trackingNumber"
                name="trackingNumber"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                placeholder="e.g., TRKABC123"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleTrack}
              disabled={loading}
              className="w-full bg-pink-600 text-white py-3 rounded-lg font-medium hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FiClock className="animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <FiSearch />
                  Track Order
                </>
              )}
            </button>
          </div>
        </div>

        {order && (
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <FiPackage className="text-2xl text-pink-600" />
              <div>
                <h2 className="text-xl font-bold">Order #{order.id}</h2>
                <p className="text-sm text-gray-500">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>
            </div>

            {/* Tracking Steps */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-bold mb-4">Tracking Information</h3>
              <div className="relative">
                {getTrackingSteps(order.status).map((step, index) => {
                  const StepIcon = step.icon
                  const isActive = step.completed
                  const isLast = index === getTrackingSteps(order.status).length - 1
                  
                  return (
                    <div key={step.key} className="flex items-start gap-4 mb-6">
                      <div className="flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isActive ? 'bg-pink-600 text-white' : 'bg-gray-200 text-gray-400'
                        }`}>
                          <StepIcon className="text-xl" />
                        </div>
                        {!isLast && (
                          <div className={`w-0.5 h-16 ${isActive ? 'bg-pink-600' : 'bg-gray-200'}`} />
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <p className={`font-medium ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                          {step.label}
                        </p>
                        {step.key === 'pending' && (
                          <p className="text-sm text-gray-500 mt-1">
                            {formatDate(order.createdAt)}
                          </p>
                        )}
                        {step.key === 'shipped' && order.trackingNumber && (
                          <p className="text-sm text-gray-500 mt-1">
                            Tracking: {order.trackingNumber}
                          </p>
                        )}
                        {step.key === 'delivered' && order.estimatedDelivery && (
                          <p className="text-sm text-gray-500 mt-1">
                            Delivered on {formatDate(order.estimatedDelivery)}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 border-t pt-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Order Status</p>
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              {order.trackingNumber && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Tracking Number</p>
                  <p className="font-mono font-bold text-lg">{order.trackingNumber}</p>
                </div>
              )}

              {order.estimatedDelivery && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Estimated Delivery</p>
                  <p className="font-medium">
                    {formatDate(order.estimatedDelivery)}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                <p className="font-bold text-lg">₵{order.total.toFixed(2)}</p>
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="border-t pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <FiMapPin className="text-pink-600" />
                  <h3 className="font-bold">Shipping Address</h3>
                </div>
                <div className="text-sm text-gray-700">
                  <p className="font-medium">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                  <p>
                    {order.shippingAddress.city}
                    {order.shippingAddress.state && `, ${order.shippingAddress.state}`}
                    {`, ${order.shippingAddress.country}`}
                  </p>
                  <p className="mt-2">Phone: {order.shippingAddress.phone}</p>
                </div>
              </div>
            )}

            {/* Order Items */}
            {order.items && order.items.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="font-bold mb-3">Order Items</h3>
                <div className="space-y-3">
                  {order.items.map((item: any, index: number) => (
                    <div key={index} className="flex items-center gap-3">
                      <img
                        src={item.image || '/images/placeholder.jpg'}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity} × ₵{item.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-bold">₵{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t pt-6">
              <Link
                href={`/orders/${order.id}`}
                className="inline-block bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors"
              >
                View Full Order Details
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

