// MTN Mobile Money (MoMo) API Integration for Ghana
// Based on MTN Mobile Money API documentation

export interface MTNMoMoConfig {
  subscriptionKey: string
  apiUser: string
  apiKey: string
  environment: 'sandbox' | 'production'
  targetEnvironment?: string // 'sandbox' or 'production'
}

export interface MTNMoMoPaymentRequest {
  amount: string
  currency: string
  externalId: string
  payer: {
    partyIdType: string
    partyId: string
  }
  payerMessage: string
  payeeNote: string
}

export interface MTNMoMoPaymentResponse {
  financialTransactionId: string
  externalId: string
  amount: string
  currency: string
  payer: {
    partyIdType: string
    partyId: string
  }
  payerMessage: string
  payeeNote: string
  status: string
  reason?: string
}

export interface MTNMoMoTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

// Get MTN MoMo API base URL based on environment
function getMTNMoMoApiUrl(environment: 'sandbox' | 'production'): string {
  if (environment === 'production') {
    return 'https://api.momoapi.mtn.com'
  }
  return 'https://sandbox.momodeveloper.mtn.com'
}

// Generate Basic Auth token for MTN MoMo
function generateBasicAuth(apiUser: string, apiKey: string): string {
  const credentials = `${apiUser}:${apiKey}`
  return Buffer.from(credentials).toString('base64')
}

// Get access token from MTN MoMo
export async function getMTNMoMoAccessToken(
  config: MTNMoMoConfig
): Promise<string> {
  const authUrl = `${getMTNMoMoApiUrl(config.environment)}/collection/token/`
  
  const basicAuth = generateBasicAuth(config.apiUser, config.apiKey)
  
  try {
    const response = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Ocp-Apim-Subscription-Key': config.subscriptionKey,
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`MTN MoMo token error: ${response.status} ${errorText}`)
    }
    
    const result: MTNMoMoTokenResponse = await response.json()
    return result.access_token
  } catch (error: any) {
    console.error('MTN MoMo token error:', error)
    throw new Error(`Failed to get MTN MoMo access token: ${error.message}`)
  }
}

// Generate UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Create MTN MoMo payment request
export async function createMTNMoMoPayment(
  config: MTNMoMoConfig,
  request: {
    amount: number
    phoneNumber: string
    orderId: string
    orderInfo: string
    callbackUrl?: string
  }
): Promise<MTNMoMoPaymentResponse> {
  // Get access token first
  const accessToken = await getMTNMoMoAccessToken(config)
  
  // Generate UUID v4 for X-Reference-Id (required format)
  const referenceId = generateUUID()
  
  // Format phone number (remove leading 0, add country code)
  let formattedPhone = request.phoneNumber.replace(/^0/, '')
  if (!formattedPhone.startsWith('233')) {
    formattedPhone = `233${formattedPhone}`
  }
  
  const paymentData: MTNMoMoPaymentRequest = {
    amount: request.amount.toFixed(2),
    currency: 'GHS',
    externalId: request.orderId,
    payer: {
      partyIdType: 'MSISDN',
      partyId: formattedPhone,
    },
    payerMessage: request.orderInfo,
    payeeNote: `Payment for order ${request.orderId}`,
  }
  
  const apiUrl = `${getMTNMoMoApiUrl(config.environment)}/collection/v1_0/requesttopay`
  
  // Build headers according to MTN MoMo API specification
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${accessToken}`,
    'Ocp-Apim-Subscription-Key': config.subscriptionKey,
    'X-Target-Environment': config.targetEnvironment || config.environment,
    'Content-Type': 'application/json',
    'X-Reference-Id': referenceId, // UUID v4 format (required)
  }
  
  // Add X-Callback-Url if provided (optional but recommended)
  if (request.callbackUrl) {
    headers['X-Callback-Url'] = request.callbackUrl
  }
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(paymentData),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`MTN MoMo API error: ${response.status} ${errorText}`)
    }
    
    // MTN MoMo returns 202 Accepted, need to query status
    if (response.status === 202) {
      // Return a response indicating payment is being processed
      // Use referenceId for future status queries
      return {
        financialTransactionId: referenceId,
        externalId: request.orderId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        payer: paymentData.payer,
        payerMessage: paymentData.payerMessage,
        payeeNote: paymentData.payeeNote,
        status: 'PENDING',
      }
    }
    
    const result: MTNMoMoPaymentResponse = await response.json()
    return result
  } catch (error: any) {
    console.error('MTN MoMo payment error:', error)
    throw new Error(`Failed to create MTN MoMo payment: ${error.message}`)
  }
}

// Query MTN MoMo payment status
export async function queryMTNMoMoPaymentStatus(
  config: MTNMoMoConfig,
  referenceId: string
): Promise<MTNMoMoPaymentResponse> {
  // Get access token first
  const accessToken = await getMTNMoMoAccessToken(config)
  
  const apiUrl = `${getMTNMoMoApiUrl(config.environment)}/collection/v1_0/requesttopay/${referenceId}`
  
  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Ocp-Apim-Subscription-Key': config.subscriptionKey,
        'X-Target-Environment': config.targetEnvironment || config.environment,
      },
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`MTN MoMo query error: ${response.status} ${errorText}`)
    }
    
    const result: MTNMoMoPaymentResponse = await response.json()
    return result
  } catch (error: any) {
    console.error('MTN MoMo query error:', error)
    throw new Error(`Failed to query MTN MoMo payment: ${error.message}`)
  }
}

// Get MTN MoMo config from environment variables
export function getMTNMoMoConfig(): MTNMoMoConfig {
  const subscriptionKey = process.env.MTN_MOMO_SUBSCRIPTION_KEY
  const apiUser = process.env.MTN_MOMO_API_USER
  const apiKey = process.env.MTN_MOMO_API_KEY
  const environment = (process.env.MTN_MOMO_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production'
  const targetEnvironment = process.env.MTN_MOMO_TARGET_ENVIRONMENT || environment
  
  if (!subscriptionKey || !apiUser || !apiKey) {
    throw new Error('MTN MoMo configuration is incomplete. Please check your environment variables.')
  }
  
  return {
    subscriptionKey,
    apiUser,
    apiKey,
    environment,
    targetEnvironment,
  }
}

