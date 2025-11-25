'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { FiLock, FiCheckCircle, FiX } from 'react-icons/fi'
import BackButton from '@/components/BackButton'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { resetPassword } = useAuthStore()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    // Check if we have a valid session from the reset link
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          setIsValidSession(true)
        } else {
          setError('Invalid or expired reset link. Please request a new password reset.')
        }
      } catch (err) {
        setError('Error validating reset link. Please try again.')
      } finally {
        setCheckingSession(false)
      }
    }

    checkSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const success = await resetPassword(password)
      if (success) {
        setSuccess(true)
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/account')
        }, 2000)
      } else {
        setError('Failed to reset password. The link may have expired. Please request a new one.')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-12 md:py-16">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm p-6 text-center">
          <p className="text-gray-600">Validating reset link...</p>
        </div>
      </div>
    )
  }

  if (!isValidSession) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-12 md:py-16">
        <div className="max-w-md mx-auto">
          <BackButton />
          <div className="bg-white rounded-lg shadow-sm p-6 mt-4">
            <div className="text-center">
              <FiX className="text-4xl text-red-500 mx-auto mb-4" />
              <h1 className="text-xl font-bold mb-2">Invalid Reset Link</h1>
              <p className="text-gray-600 mb-4">{error || 'This password reset link is invalid or has expired.'}</p>
              <button
                onClick={() => router.push('/account')}
                className="bg-pink-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-pink-700 transition-colors"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-12 md:py-16">
        <div className="max-w-md mx-auto">
          <BackButton />
          <div className="bg-white rounded-lg shadow-sm p-6 mt-4">
            <div className="text-center">
              <FiCheckCircle className="text-4xl text-green-500 mx-auto mb-4" />
              <h1 className="text-xl font-bold mb-2">Password Reset Successful!</h1>
              <p className="text-gray-600 mb-4">Your password has been reset. Redirecting to login...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-12 md:py-16">
      <div className="max-w-md mx-auto">
        <BackButton />
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 md:mb-8 text-center">
          Reset Password
        </h1>

        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                <FiLock className="inline mr-2" />
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
                minLength={6}
                placeholder="Enter new password"
              />
              <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
            </div>

            <div>
              <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmNewPassword"
                name="confirmNewPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
                minLength={6}
                placeholder="Confirm new password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-600 text-white py-3 rounded-lg font-medium hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <FiLock />
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-12 md:py-16">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm p-6 text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}

