'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { useOrderStore } from '@/store/orderStore'
import { FiUser, FiMail, FiPhone, FiLock, FiEdit, FiTrash2, FiPackage, FiSettings, FiSave, FiX } from 'react-icons/fi'
import Link from 'next/link'
import { formatDate } from '@/lib/dateUtils'
import BackButton from '@/components/BackButton'

export default function AccountSettingsPage() {
  const router = useRouter()
  const { user, isAuthenticated, updateUser, changePassword, deleteAccount, logout } = useAuthStore()
  const { getOrdersByUser } = useOrderStore()
  
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'orders' | 'delete'>('profile')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
  })
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/account')
      return
    }
    
    setProfileData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
    })
  }, [user, isAuthenticated, router])

  if (!isAuthenticated || !user) {
    return null
  }

  const userOrders = getOrdersByUser(user.id)

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const updates: Partial<typeof user> = {}
      if (profileData.name !== user.name) updates.name = profileData.name
      if (profileData.email !== user.email) updates.email = profileData.email
      if (profileData.phone !== (user.phone || '')) updates.phone = profileData.phone

      if (Object.keys(updates).length === 0) {
        setError('No changes to save')
        setLoading(false)
        return
      }

      const success = await updateUser(updates)
      if (success) {
        setSuccess('Profile updated successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Failed to update profile')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const success = await changePassword(passwordData.oldPassword, passwordData.newPassword)
      if (success) {
        setSuccess('Password changed successfully!')
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' })
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Current password is incorrect')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone and will delete all your data including orders, addresses, and reviews.')) {
      return
    }

    if (!confirm('This is your final warning. All your data will be permanently deleted. Are you absolutely sure?')) {
      return
    }

    setLoading(true)
    setError('')
    try {
      const success = await deleteAccount()
      if (success) {
        router.push('/')
      } else {
        setError('Failed to delete account. Admin accounts cannot be deleted.')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="mb-4">
            <BackButton label="Back to Account" />
          </div>
          </Link>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Account Settings</h1>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-4 sm:mb-6">
          <div className="flex flex-wrap border-b border-gray-200">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 sm:px-6 py-3 text-sm sm:text-base font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'border-b-2 border-pink-600 text-pink-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FiUser className="inline mr-2" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`px-4 sm:px-6 py-3 text-sm sm:text-base font-medium transition-colors ${
                activeTab === 'password'
                  ? 'border-b-2 border-pink-600 text-pink-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FiLock className="inline mr-2" />
              Password
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 sm:px-6 py-3 text-sm sm:text-base font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'border-b-2 border-pink-600 text-pink-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FiPackage className="inline mr-2" />
              Purchase History ({userOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('delete')}
              className={`px-4 sm:px-6 py-3 text-sm sm:text-base font-medium transition-colors ${
                activeTab === 'delete'
                  ? 'border-b-2 border-red-600 text-red-600'
                  : 'text-gray-600 hover:text-red-600'
              }`}
            >
              <FiTrash2 className="inline mr-2" />
              Delete Account
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            {/* Success/Error Messages */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4 text-sm sm:text-base">
                {success}
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm sm:text-base">
                {error}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileUpdate} className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiUser className="inline mr-2" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="settingsName"
                    name="settingsName"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiMail className="inline mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="settingsEmail"
                    name="settingsEmail"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiPhone className="inline mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="settingsPhone"
                    name="settingsPhone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Optional"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto bg-pink-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <FiSave />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <form onSubmit={handlePasswordChange} className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiLock className="inline mr-2" />
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="settingsOldPassword"
                    name="settingsOldPassword"
                    value={passwordData.oldPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="settingsNewPassword"
                    name="settingsNewPassword"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="settingsConfirmPassword"
                    name="settingsConfirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                    minLength={6}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto bg-pink-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <FiSave />
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                {userOrders.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <FiPackage className="text-4xl sm:text-5xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm sm:text-base">No orders yet</p>
                    <Link
                      href="/"
                      className="inline-block mt-4 text-pink-600 hover:underline text-sm sm:text-base"
                    >
                      Start Shopping →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userOrders.map((order) => (
                      <Link
                        key={order.id}
                        href={`/orders/${order.id}`}
                        className="block bg-gray-50 rounded-lg p-4 sm:p-6 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 sm:gap-3 mb-2">
                              <h3 className="text-base sm:text-lg font-bold truncate">Order #{order.id}</h3>
                              <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(order.status)}`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-500 mb-2">
                              Placed on {formatDate(order.createdAt)}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600 mb-2">
                              {order.items.length} item(s)
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {order.items.slice(0, 3).map((item) => (
                                <div key={item.id} className="flex items-center gap-2 bg-white rounded px-2 py-1">
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-8 h-8 object-cover rounded"
                                  />
                                  <span className="text-xs text-gray-700 truncate max-w-[100px] sm:max-w-none">
                                    {item.name}
                                  </span>
                                  <span className="text-xs text-gray-500">x{item.quantity}</span>
                                </div>
                              ))}
                              {order.items.length > 3 && (
                                <span className="text-xs text-gray-500 self-center">
                                  +{order.items.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-left sm:text-right flex-shrink-0">
                            <p className="text-base sm:text-lg font-bold text-gray-900">
                              ₵{order.total}
                            </p>
                            {order.trackingNumber && (
                              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                Tracking: {order.trackingNumber}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Delete Account Tab */}
            {activeTab === 'delete' && (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <FiTrash2 className="text-red-600 text-xl sm:text-2xl flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-red-800 mb-2">Delete Account</h3>
                      <p className="text-sm sm:text-base text-red-700 mb-4">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                      <ul className="text-xs sm:text-sm text-red-700 space-y-1 mb-4 list-disc list-inside">
                        <li>All your personal information will be permanently deleted</li>
                        <li>All your orders and order history will be removed</li>
                        <li>All your saved addresses will be deleted</li>
                        <li>All your reviews will be removed</li>
                        <li>Your cart will be cleared</li>
                      </ul>
                    </div>
                  </div>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={loading || user.role === 'admin'}
                    className="w-full sm:w-auto bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <FiTrash2 />
                    {loading ? 'Deleting...' : 'Delete My Account'}
                  </button>
                  {user.role === 'admin' && (
                    <p className="text-xs sm:text-sm text-red-600 mt-2">
                      Admin accounts cannot be deleted
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

