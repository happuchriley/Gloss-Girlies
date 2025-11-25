// Mobile Money Networks Configuration
// Supports multiple mobile money networks across Africa

export interface MobileMoneyNetwork {
  id: string
  name: string
  code: string
  icon: string
  countries: string[]
  phoneFormat: {
    minLength: number
    maxLength: number
    pattern: RegExp
    example: string
  }
}

export const mobileMoneyNetworks: MobileMoneyNetwork[] = [
  {
    id: 'mtn',
    name: 'MTN Mobile Money',
    code: 'MTN',
    icon: '📱',
    countries: ['Ghana', 'Nigeria', 'Uganda', 'Tanzania', 'Kenya', 'Rwanda', 'Zambia'],
    phoneFormat: {
      minLength: 10,
      maxLength: 10,
      pattern: /^0[0-9]{9}$/,
      example: '0244123456',
    },
  },
  {
    id: 'vodafone',
    name: 'Vodafone Cash',
    code: 'VOD',
    icon: '💳',
    countries: ['Ghana', 'Egypt'],
    phoneFormat: {
      minLength: 10,
      maxLength: 10,
      pattern: /^0[0-9]{9}$/,
      example: '0200123456',
    },
  },
  {
    id: 'airteltigo',
    name: 'AirtelTigo Money',
    code: 'ATL',
    icon: '📲',
    countries: ['Ghana'],
    phoneFormat: {
      minLength: 10,
      maxLength: 10,
      pattern: /^0[0-9]{9}$/,
      example: '0277123456',
    },
  },
  {
    id: 'orange',
    name: 'Orange Money',
    code: 'ORG',
    icon: '🟠',
    countries: ['Ghana', 'Kenya', 'Tanzania', 'Uganda'],
    phoneFormat: {
      minLength: 10,
      maxLength: 10,
      pattern: /^0[0-9]{9}$/,
      example: '0244123456',
    },
  },
  {
    id: 'momo',
    name: 'MTN MoMo',
    code: 'MOMO',
    icon: '💰',
    countries: ['Ghana'],
    phoneFormat: {
      minLength: 10,
      maxLength: 10,
      pattern: /^0[0-9]{9}$/,
      example: '0244123456',
    },
  },
  {
    id: 'mpesa',
    name: 'M-Pesa',
    code: 'MPESA',
    icon: '💵',
    countries: ['Kenya', 'Tanzania', 'Uganda'],
    phoneFormat: {
      minLength: 10,
      maxLength: 10,
      pattern: /^0[0-9]{9}$/,
      example: '0712345678',
    },
  },
  {
    id: 'tigo',
    name: 'Tigo Pesa',
    code: 'TIGO',
    icon: '🟡',
    countries: ['Tanzania'],
    phoneFormat: {
      minLength: 10,
      maxLength: 10,
      pattern: /^0[0-9]{9}$/,
      example: '0712345678',
    },
  },
]

export function getNetworksByCountry(country: string): MobileMoneyNetwork[] {
  return mobileMoneyNetworks.filter(network => 
    network.countries.some(c => c.toLowerCase() === country.toLowerCase())
  )
}

export function getNetworkById(id: string): MobileMoneyNetwork | undefined {
  return mobileMoneyNetworks.find(network => network.id === id)
}

export interface MobileMoneyPaymentRequest {
  network: string
  phoneNumber: string
  amount: number
  orderId: string
  orderInfo: string
  returnUrl: string
  notifyUrl: string
  extraData?: string
}

export interface MobileMoneyPaymentResponse {
  payUrl?: string
  qrCode?: string
  orderId: string
  requestId: string
  resultCode: number
  message: string
  network: string
}

export async function createMobileMoneyPayment(
  request: MobileMoneyPaymentRequest
): Promise<MobileMoneyPaymentResponse> {
  const network = getNetworkById(request.network)
  if (!network) {
    throw new Error('Invalid mobile money network')
  }

  // Validate phone number format
  if (!network.phoneFormat.pattern.test(request.phoneNumber)) {
    throw new Error(`Invalid phone number format for ${network.name}. Expected format: ${network.phoneFormat.example}`)
  }

  // If MTN MoMo network (Ghana), use actual MTN MoMo API
  if (network.id === 'momo' || network.id === 'mtn') {
    try {
      const baseUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      
      const response = await fetch(`${baseUrl}/api/payment/mtn-momo/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: request.amount,
          phoneNumber: request.phoneNumber,
          orderId: request.orderId,
          orderInfo: request.orderInfo,
          callbackUrl: request.notifyUrl, // Pass callback URL for X-Callback-Url header
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create MTN MoMo payment')
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create MTN MoMo payment')
      }

      const momoData = result.data
      
      // MTN MoMo returns status, map it to our response format
      const isSuccess = momoData.status === 'SUCCESSFUL' || momoData.status === 'PENDING'
      
      return {
        payUrl: request.returnUrl, // MTN MoMo doesn't return a payment URL, user approves on their phone
        qrCode: undefined, // MTN MoMo doesn't use QR codes
        orderId: momoData.externalId || request.orderId,
        requestId: momoData.financialTransactionId || request.orderId,
        resultCode: isSuccess ? 0 : 1,
        message: momoData.status === 'SUCCESSFUL' 
          ? 'Payment successful' 
          : momoData.status === 'PENDING'
          ? 'Payment request sent. Please approve on your phone.'
          : momoData.reason || 'Payment request created',
        network: network.id,
      }
    } catch (error: any) {
      console.error('MTN MoMo API error:', error)
      throw new Error(`Failed to create MTN MoMo payment: ${error.message}`)
    }
  }

  // For other networks, use mock implementation (can be extended later)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        payUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/mobile-money/callback?orderId=${request.orderId}&network=${request.network}`,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${request.network}://payment?orderId=${request.orderId}&phone=${request.phoneNumber}`,
        orderId: request.orderId,
        requestId: `${network.code}-${Date.now()}`,
        resultCode: 0,
        message: `${network.name} payment request created successfully`,
        network: network.id,
      })
    }, 1000)
  })
}

export async function checkMobileMoneyPaymentStatus(
  orderId: string,
  network: string
): Promise<{
  status: 'pending' | 'success' | 'failed'
  message: string
}> {
  const networkData = getNetworkById(network)
  
  // If MTN MoMo network (Ghana), use actual MTN MoMo API
  if (networkData?.id === 'momo' || networkData?.id === 'mtn') {
    try {
      const baseUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      
      // For MTN MoMo, we need to use the financialTransactionId (UUID) from the payment response
      // If we only have orderId, we need to store the mapping or use orderId as reference
      // For now, we'll use orderId and let the API handle it
      const response = await fetch(`${baseUrl}/api/payment/mtn-momo/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ referenceId: orderId }), // This should be the UUID from payment creation
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to query MTN MoMo payment')
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to query MTN MoMo payment')
      }

      const queryData = result.data
      
      if (queryData.status === 'SUCCESSFUL') {
        return {
          status: 'success',
          message: 'Payment successful',
        }
      } else if (queryData.status === 'PENDING') {
        return {
          status: 'pending',
          message: 'Payment is pending approval',
        }
      } else {
        return {
          status: 'failed',
          message: queryData.reason || 'Payment failed',
        }
      }
    } catch (error: any) {
      console.error('MTN MoMo query error:', error)
      return {
        status: 'failed',
        message: error.message || 'Failed to check payment status',
      }
    }
  }

  // For other networks, use mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        status: 'success', // Mock: always return success for demo
        message: 'Payment successful',
      })
    }, 500)
  })
}

