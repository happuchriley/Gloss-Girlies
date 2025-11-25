'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { useOrderStore, ShippingAddress } from '@/store/orderStore'
import { useAddressStore } from '@/store/addressStore'
import { FiCreditCard, FiTruck, FiMapPin, FiSmartphone, FiSave, FiCheckCircle, FiAlertCircle, FiLoader, FiChevronDown } from 'react-icons/fi'
import Link from 'next/link'
import { createMobileMoneyPayment, getNetworksByCountry, mobileMoneyNetworks, type MobileMoneyNetwork } from '@/lib/mobile-money'
import BackButton from '@/components/BackButton'
import { countries, detectCountryFromPhone } from '@/lib/countries'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotal, clearCart } = useCartStore()
  const { isAuthenticated, user, isAdmin } = useAuthStore()
  const { addOrder } = useOrderStore()
  const { addresses, getDefaultAddress, addAddress } = useAddressStore()
  
  const [step, setStep] = useState<'address' | 'payment' | 'review'>('address')
  const [address, setAddress] = useState<ShippingAddress>({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: 'Ghana',
  })
  const [saveAddress, setSaveAddress] = useState(false)
  const [addressLabel, setAddressLabel] = useState('Home')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
  })
  const [mobileMoneyNetwork, setMobileMoneyNetwork] = useState('')
  const [mobileMoneyPhone, setMobileMoneyPhone] = useState('')
  const [availableNetworks, setAvailableNetworks] = useState<MobileMoneyNetwork[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [processingPayment, setProcessingPayment] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false)

  useEffect(() => {
    // Initialize addresses when user is authenticated
    if (user && isAuthenticated) {
      useAddressStore.getState().initializeAddresses()
    }
  }, [user, isAuthenticated])

  useEffect(() => {
    if (user) {
      const defaultAddr = getDefaultAddress()
      if (defaultAddr && defaultAddr.fullName) {
        const phone = defaultAddr.phone || ''
        const country = defaultAddr.country || 'Ghana'
        const countryCode = countries.find(c => c.name === country)?.callingCode || '+233'
        // Ensure phone has country code
        const formattedPhone = phone.startsWith('+') ? phone : phone ? `${countryCode} ${phone.replace(/\D/g, '')}` : `${countryCode} `
        
        setAddress({
          fullName: defaultAddr.fullName || '',
          phone: formattedPhone,
          addressLine1: defaultAddr.addressLine1 || '',
          addressLine2: defaultAddr.addressLine2 || '',
          city: defaultAddr.city || '',
          state: defaultAddr.state || '',
          country: country,
        })
      } else {
        const countryCode = countries.find(c => c.name === address.country)?.callingCode || '+233'
        const userPhone = user.phone || ''
        const formattedPhone = userPhone.startsWith('+') ? userPhone : userPhone ? `${countryCode} ${userPhone.replace(/\D/g, '')}` : `${countryCode} `
        
        setAddress((prev) => ({
          ...prev,
          fullName: user.name || '',
          phone: formattedPhone,
        }))
      }
    }
  }, [user, getDefaultAddress])
  
  // Update phone number when country changes (but respect if phone already has a detected country)
  useEffect(() => {
    if (address.country && address.phone) {
      const countryCode = countries.find(c => c.name === address.country)?.callingCode || '+233'
      const currentCode = address.phone.match(/^(\+\d+)\s?/)?.[1]
      
      // Only update if the phone doesn't match the current country
      if (currentCode && currentCode !== countryCode) {
        // Check if current code matches a different country (user might have typed it)
        const detectedCountry = detectCountryFromPhone(address.phone)
        // Only update if no country was detected OR detected country matches selected country
        if (!detectedCountry || detectedCountry.name === address.country) {
          const phoneDigits = address.phone.replace(/^\+\d+\s?/, '').replace(/\D/g, '')
          setAddress(prev => ({
            ...prev,
            phone: phoneDigits ? `${countryCode} ${phoneDigits}` : `${countryCode} `
          }))
        }
      } else if (!currentCode) {
        // Phone doesn't have a country code, add it
        const phoneDigits = address.phone.replace(/\D/g, '')
        setAddress(prev => ({
          ...prev,
          phone: phoneDigits ? `${countryCode} ${phoneDigits}` : `${countryCode} `
        }))
      }
    }
  }, [address.country])

  // Update available mobile money networks when country changes
  useEffect(() => {
    if (address.country) {
      const networks = getNetworksByCountry(address.country)
      setAvailableNetworks(networks)
      // Auto-select first network if none selected
      if (networks.length > 0 && !mobileMoneyNetwork) {
        setMobileMoneyNetwork(networks[0].id)
      } else if (networks.length === 0) {
        setMobileMoneyNetwork('')
      }
    }
  }, [address.country])

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-16 text-center">
        <h1 className="text-xl sm:text-2xl font-bold mb-4">Please login to checkout</h1>
        <Link
          href="/account"
          className="inline-block bg-pink-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-pink-700 transition-colors text-sm sm:text-base"
        >
          Login
        </Link>
      </div>
    )
  }

  // Restrict admins from making purchases
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
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <Link
          href="/"
          className="inline-block bg-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-pink-700 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    )
  }

  const validateAddress = () => {
    const newErrors: Record<string, string> = {}
    if (!address.fullName.trim()) newErrors.fullName = 'Full name is required'
    if (!address.phone.trim()) newErrors.phone = 'Phone is required'
    if (!address.addressLine1.trim()) newErrors.addressLine1 = 'Address is required'
    if (!address.city.trim()) newErrors.city = 'City is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validatePayment = () => {
    if (paymentMethod === 'card') {
      const newErrors: Record<string, string> = {}
      if (!cardDetails.cardNumber.trim()) newErrors.cardNumber = 'Card number is required'
      if (!cardDetails.expiryDate.trim()) newErrors.expiryDate = 'Expiry date is required'
      if (!cardDetails.cvv.trim()) newErrors.cvv = 'CVV is required'
      if (!cardDetails.cardName.trim()) newErrors.cardName = 'Card name is required'
      
      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    }
    if (paymentMethod === 'mobile-money') {
      const newErrors: Record<string, string> = {}
      if (!mobileMoneyNetwork.trim()) {
        newErrors.mobileMoneyNetwork = 'Please select a mobile money network'
      }
      if (!mobileMoneyPhone.trim()) {
        newErrors.mobileMoneyPhone = 'Phone number is required'
      } else {
        const selectedNetwork = mobileMoneyNetworks.find(n => n.id === mobileMoneyNetwork)
        if (selectedNetwork) {
          const phoneDigits = mobileMoneyPhone.replace(/\D/g, '')
          if (phoneDigits.length < selectedNetwork.phoneFormat.minLength || 
              phoneDigits.length > selectedNetwork.phoneFormat.maxLength) {
            newErrors.mobileMoneyPhone = `Phone number must be ${selectedNetwork.phoneFormat.minLength}-${selectedNetwork.phoneFormat.maxLength} digits`
          } else if (!selectedNetwork.phoneFormat.pattern.test(phoneDigits)) {
            newErrors.mobileMoneyPhone = `Invalid format. Example: ${selectedNetwork.phoneFormat.example}`
          }
        }
      }
      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    }
    return true
  }

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateAddress()) {
      // Save address if requested
      if (saveAddress) {
        await addAddress({
          ...address,
          label: addressLabel,
        })
      }
      setStep('payment')
    }
  }

  const handleUseSavedAddress = (savedAddress: any) => {
    if (!savedAddress) return
    const phone = savedAddress.phone || ''
    const country = savedAddress.country || 'Ghana'
    const countryCode = countries.find(c => c.name === country)?.callingCode || '+233'
    // Ensure phone has country code
    const formattedPhone = phone.startsWith('+') ? phone : phone ? `${countryCode} ${phone.replace(/\D/g, '')}` : `${countryCode} `
    
    setAddress({
      fullName: savedAddress.fullName || savedAddress.full_name || '',
      phone: formattedPhone,
      addressLine1: savedAddress.addressLine1 || savedAddress.address_line1 || '',
      addressLine2: savedAddress.addressLine2 || savedAddress.address_line2 || '',
      city: savedAddress.city || '',
      state: savedAddress.state || '',
      country: country,
    })
    setAddressLabel(savedAddress.label || 'Home')
    setStep('payment')
  }

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validatePayment()) {
      setStep('review')
    }
  }

  const handlePlaceOrder = async () => {
    if (!user) return

    setProcessingPayment(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      // If Mobile Money payment, process payment first
      if (paymentMethod === 'mobile-money') {
        try {
          const tempOrderId = `TEMP-${Date.now()}`
          const selectedNetwork = mobileMoneyNetworks.find(n => n.id === mobileMoneyNetwork)
          
          if (!selectedNetwork) {
            setErrorMessage('Please select a mobile money network.')
            setProcessingPayment(false)
            return
          }

          const paymentResponse = await createMobileMoneyPayment({
            network: mobileMoneyNetwork,
            phoneNumber: mobileMoneyPhone.replace(/\D/g, ''),
            amount: getTotal(),
            orderId: tempOrderId,
            orderInfo: `Payment for ${items.length} item(s)`,
            returnUrl: typeof window !== 'undefined' ? `${window.location.origin}/orders` : '/orders',
            notifyUrl: typeof window !== 'undefined' ? `${window.location.origin}/api/payment/mobile-money/notify` : '/api/payment/mobile-money/notify',
          })

          if (paymentResponse.resultCode === 0) {
            // In production, redirect to mobile money payment page
            // For demo, we'll proceed with order creation
            setSuccessMessage(`${selectedNetwork.name} payment initiated. Proceeding with order creation.`)
          } else {
            setErrorMessage(`${selectedNetwork.name} payment failed. Please try again.`)
            setProcessingPayment(false)
            return
          }
        } catch (error: any) {
          console.error('Payment processing error:', error)
          setErrorMessage(error.message || 'Payment processing failed. Please try again.')
          setProcessingPayment(false)
          return
        }
      }

      if (!items || items.length === 0) {
        setErrorMessage('Your cart is empty. Please add items to your cart.')
        setProcessingPayment(false)
        return
      }

      setSuccessMessage('Creating your order...')

      const orderId = await addOrder({
        userId: user.id,
        items: items.map((item) => ({
          id: item.id,
          name: item.name || 'Unknown Product',
          price: item.price || 0,
          image: item.image || '',
          quantity: item.quantity || 1,
        })),
        shippingAddress: address,
        paymentMethod,
        total: getTotal(),
      })

      if (!orderId) {
        throw new Error('Failed to create order')
      }

      // Clear cart
      await clearCart()
      
      // Get the order to show tracking number
      const { getOrderById } = useOrderStore.getState()
      // Wait a bit for order to be in store
      await new Promise(resolve => setTimeout(resolve, 500))
      const createdOrder = getOrderById(orderId)
      const trackingInfo = createdOrder?.trackingNumber 
        ? ` Your tracking number is: ${createdOrder.trackingNumber}. You can track your order at /track-order`
        : ''
      
      setSuccessMessage(`Order placed successfully!${trackingInfo} You will receive a confirmation email shortly. Redirecting to order details...`)
      
      // Small delay to show success message
      setTimeout(() => {
        setProcessingPayment(false)
        router.push(`/orders/${orderId}`)
      }, 3000)
    } catch (error) {
      console.error('Error placing order:', error)
      setErrorMessage('Failed to place order. Please try again.')
      setProcessingPayment(false)
    }
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 md:py-8">
      <div className="mb-4 sm:mb-6">
        <BackButton />
      </div>
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 md:mb-8">Checkout</h1>
      
      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        <div className="lg:col-span-2">
          {/* Address Step */}
          {step === 'address' && (
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <FiMapPin className="text-xl sm:text-2xl text-pink-600" />
                <h2 className="text-lg sm:text-xl font-bold">Shipping Address</h2>
              </div>

              {/* Saved Addresses */}
              {addresses.length > 0 && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-3">Saved Addresses</h3>
                  <div className="space-y-2">
                    {(addresses || []).map((addr) => (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => handleUseSavedAddress(addr)}
                        className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-pink-500 hover:bg-pink-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{addr.label}</p>
                            <p className="text-sm text-gray-600">
                              {addr.addressLine1}, {addr.city}{addr.state ? `, ${addr.state}` : ''}
                            </p>
                          </div>
                          {addr.isDefault && (
                            <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded">
                              Default
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleAddressSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={address.fullName}
                    onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                  {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="flex">
                    <div className="flex-shrink-0 w-20 sm:w-24 h-10 sm:h-11 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 flex items-center justify-center gap-1">
                      <span className="text-base sm:text-lg" role="img" aria-label="Country flag">
                        {countries.find(c => c.name === address.country)?.flag || '🇬🇭'}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-700 font-medium">
                        {countries.find(c => c.name === address.country)?.callingCode || '+233'}
                      </span>
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={address.phone.replace(/^\+\d+\s?/, '')}
                      onChange={(e) => {
                        const currentCountryCode = countries.find(c => c.name === address.country)?.callingCode || '+233'
                        let inputValue = e.target.value
                        
                        // Allow user to type with or without country code
                        // If they type starting with +, try to detect country
                        if (inputValue.startsWith('+')) {
                          // User is typing with country code - try to detect
                          const detectedCountry = detectCountryFromPhone(inputValue)
                          if (detectedCountry) {
                            const numberPart = inputValue.replace(detectedCountry.callingCode, '').trim().replace(/\D/g, '')
                            setAddress({ 
                              ...address, 
                              country: detectedCountry.name,
                              phone: numberPart ? `${detectedCountry.callingCode} ${numberPart}` : `${detectedCountry.callingCode} `
                            })
                            return
                          }
                        }
                        
                        // Normal input - just digits, use current country code
                        const phoneValue = inputValue.replace(/\D/g, '')
                        setAddress({ 
                          ...address, 
                          phone: phoneValue ? `${currentCountryCode} ${phoneValue}` : `${currentCountryCode} ` 
                        })
                      }}
                      onPaste={(e) => {
                        e.preventDefault()
                        const pastedText = e.clipboardData.getData('text')
                        // Try to detect country from pasted phone number
                        if (pastedText.startsWith('+')) {
                          const detectedCountry = detectCountryFromPhone(pastedText)
                          if (detectedCountry) {
                            const numberPart = pastedText.replace(detectedCountry.callingCode, '').trim().replace(/\D/g, '')
                            setAddress({ 
                              ...address, 
                              country: detectedCountry.name,
                              phone: numberPart ? `${detectedCountry.callingCode} ${numberPart}` : `${detectedCountry.callingCode} `
                            })
                            return
                          }
                        }
                        // Fallback to current country
                        const phoneValue = pastedText.replace(/\D/g, '')
                        const currentCountryCode = countries.find(c => c.name === address.country)?.callingCode || '+233'
                        setAddress({ 
                          ...address, 
                          phone: phoneValue ? `${currentCountryCode} ${phoneValue}` : `${currentCountryCode} ` 
                        })
                      }}
                      placeholder="1234567890 or +233..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      required
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  <p className="text-xs text-gray-500 mt-1">
                    Enter phone number with country code (e.g., +233...) or select country first
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    id="addressLine1"
                    name="addressLine1"
                    value={address.addressLine1}
                    onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                  {errors.addressLine1 && <p className="text-red-500 text-sm mt-1">{errors.addressLine1}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    id="addressLine2"
                    name="addressLine2"
                    value={address.addressLine2}
                    onChange={(e) => setAddress({ ...address, addressLine2: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      required
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                  </div>

                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State / Province
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={address.state || ''}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Optional"
                  />
                  {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white text-left flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-lg sm:text-xl" role="img" aria-label="Country flag">
                          {countries.find(c => c.name === address.country)?.flag || '🇬🇭'}
                        </span>
                        {address.country || 'Select a country'}
                      </span>
                      <FiChevronDown className={`text-gray-400 transition-transform ${countryDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {countryDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setCountryDropdownOpen(false)}
                        />
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {countries.map((country) => (
                            <button
                              key={country.code}
                              type="button"
                              onClick={() => {
                                const countryCode = country.callingCode
                                const currentPhone = address.phone.replace(/^\+\d+\s?/, '').replace(/\D/g, '')
                                setAddress({ 
                                  ...address, 
                                  country: country.name,
                                  phone: currentPhone ? `${countryCode} ${currentPhone}` : `${countryCode} `
                                })
                                setCountryDropdownOpen(false)
                              }}
                              className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 ${
                                address.country === country.name ? 'bg-pink-50 text-pink-600' : ''
                              }`}
                            >
                              <span className="text-lg sm:text-xl" role="img" aria-label={`${country.name} flag`}>
                                {country.flag}
                              </span>
                              <span>{country.name}</span>
                              <span className="ml-auto text-xs text-gray-500">{country.callingCode}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="saveAddress"
                    checked={saveAddress}
                    onChange={(e) => setSaveAddress(e.target.checked)}
                    className="text-pink-600"
                  />
                  <label htmlFor="saveAddress" className="text-sm text-gray-700">
                    Save this address for future orders
                  </label>
                </div>

                {saveAddress && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Label
                    </label>
                    <input
                      type="text"
                      value={addressLabel}
                      onChange={(e) => setAddressLabel(e.target.value)}
                      placeholder="Home, Office, etc."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-pink-600 text-white py-3 rounded-lg font-medium hover:bg-pink-700 transition-colors"
                >
                  Continue to Payment
                </button>
              </form>
            </div>
          )}

          {/* Payment Step */}
          {step === 'payment' && (
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <FiCreditCard className="text-xl sm:text-2xl text-pink-600" />
                <h2 className="text-lg sm:text-xl font-bold">Payment Method</h2>
              </div>
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div className="space-y-3">
                  <label className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-pink-500 text-sm sm:text-base">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-pink-600"
                    />
                    <FiCreditCard className="text-lg sm:text-xl" />
                    <span className="font-medium">Credit/Debit Card</span>
                  </label>

                  <label className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-pink-500 text-sm sm:text-base">
                    <input
                      type="radio"
                      name="payment"
                      value="mobile-money"
                      checked={paymentMethod === 'mobile-money'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-pink-600"
                    />
                    <FiSmartphone className="text-lg sm:text-xl" />
                    <span className="font-medium">Mobile Money</span>
                  </label>

                  <label className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-pink-500 text-sm sm:text-base">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-pink-600"
                    />
                    <FiTruck className="text-lg sm:text-xl" />
                    <span className="font-medium">Cash on Delivery</span>
                  </label>
                </div>

                {paymentMethod === 'mobile-money' && (
                  <div className="space-y-4 pt-4 border-t">
                    {availableNetworks.length === 0 ? (
                      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg text-sm">
                        No mobile money networks available for {address.country}. Please select a different payment method.
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Network *
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {availableNetworks.map((network) => (
                              <label
                                key={network.id}
                                className={`flex flex-col items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                  mobileMoneyNetwork === network.id
                                    ? 'border-pink-500 bg-pink-50'
                                    : 'border-gray-300 hover:border-pink-300'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="mobileMoneyNetwork"
                                  value={network.id}
                                  checked={mobileMoneyNetwork === network.id}
                                  onChange={(e) => setMobileMoneyNetwork(e.target.value)}
                                  className="sr-only"
                                />
                                <span className="text-2xl mb-1">{network.icon}</span>
                                <span className="text-xs sm:text-sm font-medium text-center">{network.name}</span>
                              </label>
                            ))}
                          </div>
                          {errors.mobileMoneyNetwork && (
                            <p className="text-red-500 text-sm mt-1">{errors.mobileMoneyNetwork}</p>
                          )}
                        </div>

                        {mobileMoneyNetwork && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {mobileMoneyNetworks.find(n => n.id === mobileMoneyNetwork)?.name} Phone Number *
                            </label>
                            <input
                              type="tel"
                              id="mobileMoneyPhone"
                              name="mobileMoneyPhone"
                              value={mobileMoneyPhone}
                              onChange={(e) => {
                                const network = mobileMoneyNetworks.find(n => n.id === mobileMoneyNetwork)
                                const maxLength = network?.phoneFormat.maxLength || 10
                                setMobileMoneyPhone(e.target.value.replace(/\D/g, '').slice(0, maxLength))
                              }}
                              placeholder={mobileMoneyNetworks.find(n => n.id === mobileMoneyNetwork)?.phoneFormat.example || '0244123456'}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                              required
                              maxLength={mobileMoneyNetworks.find(n => n.id === mobileMoneyNetwork)?.phoneFormat.maxLength || 10}
                            />
                            {errors.mobileMoneyPhone && (
                              <p className="text-red-500 text-sm mt-1">{errors.mobileMoneyPhone}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              Enter your {mobileMoneyNetworks.find(n => n.id === mobileMoneyNetwork)?.name} registered phone number
                              {mobileMoneyNetworks.find(n => n.id === mobileMoneyNetwork)?.phoneFormat.example && 
                                ` (e.g., ${mobileMoneyNetworks.find(n => n.id === mobileMoneyNetwork)?.phoneFormat.example})`
                              }
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number *
                      </label>
                      <input
                        type="text"
                        value={cardDetails.cardNumber}
                        onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        required
                      />
                      {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cardholder Name *
                      </label>
                      <input
                        type="text"
                        value={cardDetails.cardName}
                        onChange={(e) => setCardDetails({ ...cardDetails, cardName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        required
                      />
                      {errors.cardName && <p className="text-red-500 text-sm mt-1">{errors.cardName}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date *
                        </label>
                        <input
                          type="text"
                          value={cardDetails.expiryDate}
                          onChange={(e) => setCardDetails({ ...cardDetails, expiryDate: e.target.value })}
                          placeholder="MM/YY"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                          required
                        />
                        {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV *
                        </label>
                        <input
                          type="text"
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                          placeholder="123"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                          required
                        />
                        {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep('address')}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-pink-600 text-white py-3 rounded-lg font-medium hover:bg-pink-700 transition-colors"
                  >
                    Review Order
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Review Step */}
          {step === 'review' && (
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Review Your Order</h2>
              
              {/* Success Message */}
              {successMessage && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                  <FiCheckCircle className="text-green-600 flex-shrink-0" />
                  <p className="text-sm text-green-700">{successMessage}</p>
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <FiAlertCircle className="text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
              )}
              
              <div className="space-y-4 mb-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold mb-2 text-gray-800">Shipping Address</h3>
                  <p className="text-gray-700 text-sm">
                    {address.fullName}<br />
                    {address.addressLine1}<br />
                    {address.addressLine2 && <>{address.addressLine2}<br /></>}
                    {address.city}{address.state ? `, ${address.state}` : ''}<br />
                    {address.country}<br />
                    <span className="text-gray-500">Phone: {address.phone}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => setStep('address')}
                    className="mt-2 text-pink-600 hover:underline text-sm font-medium"
                  >
                    Change Address
                  </button>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold mb-2 text-gray-800">Payment Method</h3>
                  <p className="text-gray-700 text-sm">
                    {paymentMethod === 'mobile-money' 
                      ? mobileMoneyNetworks.find(n => n.id === mobileMoneyNetwork)?.name || 'Mobile Money'
                      : paymentMethod === 'card' 
                      ? 'Credit/Debit Card' 
                      : 'Cash on Delivery'}
                  </p>
                  {paymentMethod === 'mobile-money' && mobileMoneyPhone && (
                    <p className="text-sm text-gray-500 mt-1">
                      {mobileMoneyNetworks.find(n => n.id === mobileMoneyNetwork)?.name}: {mobileMoneyPhone}
                    </p>
                  )}
                  {paymentMethod === 'card' && cardDetails.cardNumber && (
                    <p className="text-sm text-gray-500 mt-1">
                      Card ending in {cardDetails.cardNumber.slice(-4)}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => setStep('payment')}
                    className="mt-2 text-pink-600 hover:underline text-sm font-medium"
                  >
                    Change Payment Method
                  </button>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold mb-3 text-gray-800">Order Items ({items.length} {items.length === 1 ? 'item' : 'items'})</h3>
                  <div className="space-y-3">
                    {(items || []).map((item) => (
                      <div key={item.id} className="flex items-center gap-3 pb-3 border-b border-gray-100 last:border-b-0 last:pb-0">
                        <img
                          src={item.image || '/images/placeholder.jpg'}
                          alt={item.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm sm:text-base text-gray-800 line-clamp-2">
                            {item.name}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-sm sm:text-base text-gray-900">
                            ₵{(item.price * item.quantity).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            ₵{item.price.toFixed(2)} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setStep('payment')
                    setErrorMessage('')
                    setSuccessMessage('')
                  }}
                  disabled={processingPayment}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={processingPayment}
                  className="flex-1 bg-pink-600 text-white py-3 rounded-lg font-medium hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processingPayment ? (
                    <>
                      <FiLoader className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiCheckCircle />
                      Place Order
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:sticky lg:top-20">
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Order Summary</h2>
            
            {/* Items List in Summary */}
            <div className="mb-4 pb-4 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 text-sm">
                    <img
                      src={item.image || '/images/placeholder.jpg'}
                      alt={item.name}
                      className="w-10 h-10 object-cover rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 line-clamp-1 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-gray-700 font-medium flex-shrink-0">
                      ₵{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-600 text-sm">
                <span>Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                <span>₵{getTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 text-sm">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              {paymentMethod === 'cod' && (
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Payment Method</span>
                  <span className="text-gray-500">Cash on Delivery</span>
                </div>
              )}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-pink-600">₵{getTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Processing Indicator */}
            {processingPayment && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                <FiLoader className="text-blue-600 animate-spin flex-shrink-0" />
                <p className="text-sm text-blue-700">Processing your order...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}




































