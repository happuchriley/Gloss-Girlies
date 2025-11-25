'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useOrderStore } from '@/store/orderStore'
import Link from 'next/link'
import { FiPackage, FiTruck, FiCheckCircle, FiXCircle, FiEdit } from 'react-icons/fi'
import { formatDate } from '@/lib/dateUtils'

export default function AdminOrdersPage() {
  const router = useRouter()
  const { isAuthenticated, isAdmin } = useAuthStore()
  const { orders, updateOrderStatus, initializeOrders } = useOrderStore()
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push('/account')
      return
    }
    initializeOrders()
  }, [isAuthenticated, isAdmin, router, initializeOrders])

  if (!isAuthenticated || !isAdmin) {
    return null
  }

  const filteredOrders = filterStatus === 'all' 
    ? (orders || [])
    : (orders || []).filter((o) => o && o.status === filterStatus)

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

  const handleStatusChange = (orderId: string, newStatus: string) => {
    if (confirm(`Change order status to ${newStatus}?`)) {
      updateOrderStatus(orderId, newStatus as any)
    }
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <Link href="/admin" className="text-sm sm:text-base text-pink-600 hover:underline mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Order Management</h1>
        </div>
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-auto px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700">Order ID</th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700 hidden sm:table-cell">Customer</th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700">Items</th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700">Total</th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700">Status</th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700 hidden md:table-cell">Date</th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500 text-sm sm:text-base">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  (filteredOrders || []).map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="py-2 sm:py-3 px-2 sm:px-4 whitespace-nowrap">
                        <Link href={`/admin/orders/${order.id}`} className="text-pink-600 hover:underline font-mono text-xs sm:text-sm">
                          {order.id.length > 12 ? `${order.id.substring(0, 12)}...` : order.id}
                        </Link>
                        <div className="text-xs text-gray-500 sm:hidden mt-1">{order.shippingAddress.fullName}</div>
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 hidden sm:table-cell">
                        <div>
                          <p className="font-medium text-xs sm:text-sm">{order.shippingAddress.fullName}</p>
                          <p className="text-xs text-gray-500">{order.shippingAddress.phone}</p>
                        </div>
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 whitespace-nowrap">
                        <p className="text-xs sm:text-sm">{order.items.length} item(s)</p>
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 whitespace-nowrap font-bold text-xs sm:text-sm">₵{order.total}</td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-600 hidden md:table-cell whitespace-nowrap">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="text-xs sm:text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500 w-full sm:w-auto"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

