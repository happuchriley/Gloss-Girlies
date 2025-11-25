'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useRouter, useSearchParams } from 'next/navigation'
import { useOrderStore } from '@/store/orderStore'
import { useCartStore } from '@/store/cartStore'
import { FiUser, FiMail, FiLock, FiPhone, FiSettings, FiPackage, FiEdit, FiSave, FiTrash2, FiX } from 'react-icons/fi'
import Link from 'next/link'
import { formatDate } from '@/lib/dateUtils'
import BackButton from '@/components/BackButton'

function AccountPageContent() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const [isLogin, setIsLogin] = useState(tabParam === 'register' ? false : true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false)
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  // All hooks must be called at the top level
  const { login, register, forgotPassword, isAuthenticated, user, logout, updateUser, changePassword, deleteAccount } = useAuthStore()
  const { getOrdersByUser, initializeOrders } = useOrderStore()
  const router = useRouter()
  
  useEffect(() => {
    if (isAuthenticated && user) {
      initializeOrders()
    }
  }, [isAuthenticated, user, initializeOrders])
  
  const handleLogout = async () => {
    // Clear cart store immediately (non-blocking)
    useCartStore.setState({ items: [] })
    useCartStore.getState().clearCart().catch(() => {
      // Ignore errors - already cleared local state
    })
    
    // Logout with timeout to prevent hanging
    try {
      const logoutPromise = logout()
      const timeoutPromise = new Promise<void>((resolve) => setTimeout(() => resolve(), 2000))
      await Promise.race([logoutPromise, timeoutPromise])
    } catch (error) {
      console.error('Error during logout:', error)
    }
    
    // Always redirect, even if logout had errors
    router.push('/account')
  }

  // Handle tab parameter from URL
  useEffect(() => {
    if (tabParam === 'register') {
      setIsLogin(false)
    } else if (tabParam === 'login') {
      setIsLogin(true)
    }
  }, [tabParam])
  
  // Account settings state (only used when authenticated)
  const [activeSection, setActiveSection] = useState<'profile' | 'password' | 'orders' | 'delete'>('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
  })
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [settingsError, setSettingsError] = useState('')
  const [settingsSuccess, setSettingsSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        const success = await login(email, password, rememberMe)
        if (success) {
          router.push('/')
        } else {
          setError('Invalid email or password')
        }
      } else {
        if (!name.trim()) {
          setError('Name is required')
          return
        }
        const success = await register(name, email, password, phone)
        if (success) {
          router.push('/')
        } else {
          setError('Email already exists')
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Update profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
      })
    }
  }, [user])

  const userOrders = user ? getOrdersByUser(user.id) : []

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    
    setSettingsError('')
    setSettingsSuccess('')
    setSettingsLoading(true)

    try {
      const updates: Partial<typeof user> = {}
      if (profileData.name !== user.name) updates.name = profileData.name
      if (profileData.email !== user.email) updates.email = profileData.email
      if (profileData.phone !== (user.phone || '')) updates.phone = profileData.phone

      if (Object.keys(updates).length === 0) {
        setSettingsError('No changes to save')
        setSettingsLoading(false)
        return
      }

      const success = await updateUser(updates)
      if (success) {
        setSettingsSuccess('Profile updated successfully!')
        setIsEditing(false)
        setTimeout(() => setSettingsSuccess(''), 3000)
      } else {
        setSettingsError('Failed to update profile')
      }
    } catch (err) {
      setSettingsError('An error occurred. Please try again.')
    } finally {
      setSettingsLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setSettingsError('')
    setSettingsSuccess('')

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSettingsError('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setSettingsError('Password must be at least 6 characters')
      return
    }

    setSettingsLoading(true)
    try {
      const success = await changePassword(passwordData.oldPassword, passwordData.newPassword)
      if (success) {
        setSettingsSuccess('Password changed successfully!')
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' })
        setTimeout(() => setSettingsSuccess(''), 3000)
      } else {
        setSettingsError('Current password is incorrect')
      }
    } catch (err) {
      setSettingsError('An error occurred. Please try again.')
    } finally {
      setSettingsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone and will delete all your data including orders, addresses, and reviews.')) {
      return
    }

    if (!confirm('This is your final warning. All your data will be permanently deleted. Are you absolutely sure?')) {
      return
    }

    setSettingsLoading(true)
    setSettingsError('')
    try {
      const success = await deleteAccount()
      if (success) {
        router.push('/')
      } else {
        setSettingsError('Failed to delete account. Admin accounts cannot be deleted.')
      }
    } catch (err) {
      setSettingsError('An error occurred. Please try again.')
    } finally {
      setSettingsLoading(false)
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

  if (isAuthenticated && user) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 md:py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 md:mb-8">My Account</h1>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm mb-4 sm:mb-6">
            <div className="flex flex-wrap border-b border-gray-200">
              <button
                onClick={() => setActiveSection('profile')}
                className={`px-4 sm:px-6 py-3 text-sm sm:text-base font-medium transition-colors ${
                  activeSection === 'profile'
                    ? 'border-b-2 border-pink-600 text-pink-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FiUser className="inline mr-2" />
                Profile
              </button>
              <button
                onClick={() => setActiveSection('password')}
                className={`px-4 sm:px-6 py-3 text-sm sm:text-base font-medium transition-colors ${
                  activeSection === 'password'
                    ? 'border-b-2 border-pink-600 text-pink-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FiLock className="inline mr-2" />
                Password
              </button>
              <button
                onClick={() => setActiveSection('orders')}
                className={`px-4 sm:px-6 py-3 text-sm sm:text-base font-medium transition-colors ${
                  activeSection === 'orders'
                    ? 'border-b-2 border-pink-600 text-pink-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FiPackage className="inline mr-2" />
                Purchase History ({userOrders.length})
              </button>
              <button
                onClick={() => setActiveSection('delete')}
                className={`px-4 sm:px-6 py-3 text-sm sm:text-base font-medium transition-colors ${
                  activeSection === 'delete'
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
              {settingsSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4 text-sm sm:text-base">
                  {settingsSuccess}
                </div>
              )}
              {settingsError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm sm:text-base">
                  {settingsError}
                </div>
              )}

              {/* Profile Section */}
              {activeSection === 'profile' && (
                <div>
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <FiUser className="text-xl sm:text-2xl text-pink-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-base sm:text-lg md:text-xl font-bold truncate">{user.name}</h2>
                        <p className="text-sm sm:text-base text-gray-600 truncate">{user.email}</p>
                        {user.phone && <p className="text-sm sm:text-base text-gray-600 truncate">{user.phone}</p>}
                      </div>
                    </div>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm sm:text-base"
                      >
                        <FiEdit />
                        Edit Profile
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <form onSubmit={handleProfileUpdate} className="space-y-4 sm:space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FiUser className="inline mr-2" />
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="profileName"
                          name="profileName"
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
                          id="profileEmail"
                          name="profileEmail"
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
                          id="profilePhone"
                          name="profilePhone"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                          placeholder="Optional"
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={settingsLoading}
                          className="flex-1 bg-pink-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <FiSave />
                          {settingsLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false)
                            setProfileData({
                              name: user.name,
                              email: user.email,
                              phone: user.phone || '',
                            })
                            setSettingsError('')
                            setSettingsSuccess('')
                          }}
                          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                        >
                          <FiX />
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-xs sm:text-sm text-gray-500 mb-1">Full Name</p>
                          <p className="text-sm sm:text-base font-medium">{user.name}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-xs sm:text-sm text-gray-500 mb-1">Email</p>
                          <p className="text-sm sm:text-base font-medium">{user.email}</p>
                        </div>
                        {user.phone && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-xs sm:text-sm text-gray-500 mb-1">Phone</p>
                            <p className="text-sm sm:text-base font-medium">{user.phone}</p>
                          </div>
                        )}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-xs sm:text-sm text-gray-500 mb-1">Account Type</p>
                          <p className="text-sm sm:text-base font-medium">{user.role === 'admin' ? 'Administrator' : 'Customer'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Password Section */}
              {activeSection === 'password' && (
                <form onSubmit={handlePasswordChange} className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiLock className="inline mr-2" />
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="oldPassword"
                      name="oldPassword"
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
                      id="newPassword"
                      name="newPassword"
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
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      required
                      minLength={6}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={settingsLoading}
                    className="w-full sm:w-auto bg-pink-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <FiSave />
                    {settingsLoading ? 'Changing...' : 'Change Password'}
                  </button>
                </form>
              )}

              {/* Orders Section */}
              {activeSection === 'orders' && (
                <div>
                  <div className="mb-4 sm:mb-6">
                    <BackButton />
                  </div>
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
                      {(userOrders || []).map((order) => (
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

              {/* Delete Account Section */}
              {activeSection === 'delete' && (
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
                      disabled={settingsLoading || user.role === 'admin'}
                      className="w-full sm:w-auto bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <FiTrash2 />
                      {settingsLoading ? 'Deleting...' : 'Delete My Account'}
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

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Quick Actions</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <Link
                href="/orders"
                className="block bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center flex items-center justify-center gap-2"
              >
                <FiPackage className="text-lg" />
                View All Orders
              </Link>
              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  className="block bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors text-center"
                >
                  Admin Dashboard
                </Link>
              )}
              <Link
                href="/"
                className="block bg-pink-600 text-white py-3 rounded-lg font-medium hover:bg-pink-700 transition-colors text-center"
              >
                Continue Shopping
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="block w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-12 md:py-16">
      <div className="max-w-md mx-auto">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 md:mb-8 text-center">
          {isLogin ? 'Login' : 'Register'}
        </h1>
        
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex gap-4 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true)
                setError('')
              }}
              className={`flex-1 py-2 font-medium ${
                isLogin
                  ? 'border-b-2 border-pink-600 text-pink-600'
                  : 'text-gray-600'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false)
                setError('')
              }}
              className={`flex-1 py-2 font-medium ${
                !isLogin
                  ? 'border-b-2 border-pink-600 text-pink-600'
                  : 'text-gray-600'
              }`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  id="loginEmail"
                  name="loginEmail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone (Optional)
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    id="registerPhone"
                    name="registerPhone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  id="loginPassword"
                  name="loginPassword"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                  minLength={6}
                />
              </div>
              {isLogin && (
                <div className="mt-2 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      name="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-pink-600 hover:text-pink-700 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-600 text-white py-3 rounded-lg font-medium hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
            </button>
          </form>

          {/* Forgot Password Modal */}
          {showForgotPassword && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Reset Password</h2>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false)
                      setForgotPasswordEmail('')
                      setForgotPasswordSuccess(false)
                      setError('')
                    }}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Close"
                  >
                    <FiX className="text-xl" />
                  </button>
                </div>

                {forgotPasswordSuccess ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                      <p className="text-sm">
                        Password reset email sent! Please check your inbox and follow the instructions to reset your password.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false)
                        setForgotPasswordEmail('')
                        setForgotPasswordSuccess(false)
                      }}
                      className="w-full bg-pink-600 text-white py-2 rounded-lg font-medium hover:bg-pink-700 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault()
                      setError('')
                      setForgotPasswordLoading(true)

                      try {
                        const success = await forgotPassword(forgotPasswordEmail)
                        if (success) {
                          setForgotPasswordSuccess(true)
                        } else {
                          setError('Failed to send reset email. Please check your email address.')
                        }
                      } catch (err) {
                        setError('An error occurred. Please try again.')
                      } finally {
                        setForgotPasswordLoading(false)
                      }
                    }}
                    className="space-y-4"
                  >
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                        {error}
                      </div>
                    )}

                    <div>
                      <label htmlFor="forgotPasswordEmail" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="forgotPasswordEmail"
                        name="forgotPasswordEmail"
                        value={forgotPasswordEmail}
                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="Enter your email"
                        required
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotPassword(false)
                          setForgotPasswordEmail('')
                          setError('')
                        }}
                        className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={forgotPasswordLoading}
                        className="flex-1 bg-pink-600 text-white py-2 rounded-lg font-medium hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {forgotPasswordLoading ? 'Sending...' : 'Send Reset Link'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-12 md:py-16">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-6"></div>
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <AccountPageContent />
    </Suspense>
  )
}

