'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useProductStore } from '@/store/productStore'
import { useOrderStore } from '@/store/orderStore'
import Link from 'next/link'
import { FiPackage, FiShoppingBag, FiUsers, FiDollarSign, FiTrendingUp, FiBox } from 'react-icons/fi'
import { formatDate } from '@/lib/dateUtils'

export default function AdminDashboard() {
  const router = useRouter()
  const { isAuthenticated, isAdmin, user } = useAuthStore()
  const { products, initializeProducts } = useProductStore()
  const { orders, initializeOrders } = useOrderStore()

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push('/account')
      return
    }
    initializeProducts()
    initializeOrders()
  }, [isAuthenticated, isAdmin, router, initializeProducts, initializeOrders])

  if (!isAuthenticated || !isAdmin) {
    return null
  }

  const totalRevenue = (orders || []).reduce((sum, order) => sum + (order?.total || 0), 0)
  const totalOrders = (orders || []).length
  const totalProducts = (products || []).length
  const lowStockProducts = (products || []).filter((p) => p && p.stock < 20).length
  const pendingOrders = (orders || []).filter((o) => o && o.status === 'pending').length

  const stats = [
    {
      title: 'Total Revenue',
      value: `₵${totalRevenue.toLocaleString()}`,
      icon: FiDollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Total Orders',
      value: totalOrders.toString(),
      icon: FiShoppingBag,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Products',
      value: totalProducts.toString(),
      icon: FiPackage,
      color: 'bg-pink-500',
    },
    {
      title: 'Low Stock',
      value: lowStockProducts.toString(),
      icon: FiTrendingUp,
      color: 'bg-red-500',
    },
    {
      title: 'Pending Orders',
      value: pendingOrders.toString(),
      icon: FiBox,
      color: 'bg-yellow-500',
    },
  ]

  return (
    <div className="container mx-auto px-2 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Welcome back, {user?.name}</p>
        </div>
        <Link
          href="/"
          className="text-sm sm:text-base text-pink-600 hover:underline"
        >
          View Store →
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white text-xl" />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Link
          href="/admin/products"
          className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <FiPackage className="text-3xl text-pink-600 mb-4" />
          <h2 className="text-xl font-bold mb-2">Manage Products</h2>
          <p className="text-gray-600">Add, edit, or delete products</p>
        </Link>

        <Link
          href="/admin/inventory"
          className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <FiBox className="text-3xl text-pink-600 mb-4" />
          <h2 className="text-xl font-bold mb-2">Inventory Management</h2>
          <p className="text-gray-600">Track and update stock levels</p>
        </Link>

        <Link
          href="/admin/orders"
          className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <FiShoppingBag className="text-3xl text-pink-600 mb-4" />
          <h2 className="text-xl font-bold mb-2">Manage Orders</h2>
          <p className="text-gray-600">View and update order status</p>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="mt-6 sm:mt-8 bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold mb-4">Recent Orders</h2>
        {(!orders || orders.length === 0) ? (
          <p className="text-gray-500 text-sm sm:text-base">No orders yet</p>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Order ID</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700 hidden sm:table-cell">Customer</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Total</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Status</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700 hidden md:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(orders || []).slice(0, 5).map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm">
                        <Link href={`/admin/orders/${order.id}`} className="text-pink-600 hover:underline font-mono">
                          {order.id.length > 12 ? `${order.id.substring(0, 12)}...` : order.id}
                        </Link>
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm hidden sm:table-cell">
                        {order?.shippingAddress?.fullName || 'N/A'}
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-medium">
                        ₵{order.total}
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'confirmed' ? 'bg-pink-100 text-pink-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden md:table-cell">
                        {formatDate(order.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

