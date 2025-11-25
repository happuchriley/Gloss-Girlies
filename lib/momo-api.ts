// MoMo Payment Gateway API Integration
// Based on MoMo Payment Gateway API documentation

import crypto from 'crypto'

export interface MoMoConfig {
  partnerCode: string
  accessKey: string
  secretKey: string
  environment: 'sandbox' | 'production'
}

export interface MoMoPaymentRequest {
  partnerCode: string
  accessKey: string
  requestId: string
  amount: number
  orderId: string
  orderInfo: string
  returnUrl: string
  notifyUrl: string
  extraData?: string
  requestType?: string
  signature?: string
}

export interface MoMoPaymentResponse {
  partnerCode: string
  accessKey: string
  requestId: string
  orderId: string
  errorCode: number
  message: string
  localMessage?: string
  requestType?: string
  payUrl?: string
  deeplink?: string
  qrCodeUrl?: string
  deeplinkWebInApp?: string
}

export interface MoMoQueryRequest {
  partnerCode: string
  accessKey: string
  requestId: string
  orderId: string
  requestType: string
  signature?: string
}

export interface MoMoQueryResponse {
  partnerCode: string
  accessKey: string
  requestId: string
  orderId: string
  errorCode: number
  message: string
  localMessage?: string
  requestType: string
  extraData?: string
  amount?: number
  transId?: string
  payType?: string
  responseTime?: number
}

// Get MoMo API base URL based on environment
function getMoMoApiUrl(environment: 'sandbox' | 'production'): string {
  if (environment === 'production') {
    return 'https://payment.momo.vn/v2/gateway/api'
  }
  return 'https://test-payment.momo.vn/v2/gateway/api'
}

// Generate signature for MoMo API request
export function generateMoMoSignature(
  data: Record<string, any>,
  secretKey: string
): string {
  // Sort keys alphabetically
  const sortedKeys = Object.keys(data).sort()
  
  // Create query string
  const queryString = sortedKeys
    .map((key) => `${key}=${data[key]}`)
    .join('&')
  
  // Create signature using HMAC SHA256
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(queryString)
    .digest('hex')
  
  return signature
}

// Create MoMo payment request
export async function createMoMoPaymentRequest(
  config: MoMoConfig,
  request: {
    amount: number
    orderId: string
    orderInfo: string
    returnUrl: string
    notifyUrl: string
    extraData?: string
  }
): Promise<MoMoPaymentResponse> {
  const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  const paymentData: MoMoPaymentRequest = {
    partnerCode: config.partnerCode,
    accessKey: config.accessKey,
    requestId,
    amount: Math.round(request.amount), // Amount in smallest currency unit
    orderId: request.orderId,
    orderInfo: request.orderInfo,
    returnUrl: request.returnUrl,
    notifyUrl: request.notifyUrl,
    extraData: request.extraData || '',
    requestType: 'captureMoMoWallet',
  }
  
  // Generate signature
  const signature = generateMoMoSignature(paymentData, config.secretKey)
  paymentData['signature'] = signature
  
  const apiUrl = `${getMoMoApiUrl(config.environment)}/create`
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    })
    
    if (!response.ok) {
      throw new Error(`MoMo API error: ${response.status} ${response.statusText}`)
    }
    
    const result: MoMoPaymentResponse = await response.json()
    
    if (result.errorCode !== 0) {
      throw new Error(`MoMo payment error: ${result.message} (${result.localMessage || ''})`)
    }
    
    return result
  } catch (error: any) {
    console.error('MoMo payment request error:', error)
    throw new Error(`Failed to create MoMo payment: ${error.message}`)
  }
}

// Query MoMo payment status
export async function queryMoMoPaymentStatus(
  config: MoMoConfig,
  orderId: string
): Promise<MoMoQueryResponse> {
  const requestId = `QUERY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  const queryData: MoMoQueryRequest = {
    partnerCode: config.partnerCode,
    accessKey: config.accessKey,
    requestId,
    orderId,
    requestType: 'transactionStatus',
  }
  
  // Generate signature
  const signature = generateMoMoSignature(queryData, config.secretKey)
  queryData['signature'] = signature
  
  const apiUrl = `${getMoMoApiUrl(config.environment)}/query`
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(queryData),
    })
    
    if (!response.ok) {
      throw new Error(`MoMo API error: ${response.status} ${response.statusText}`)
    }
    
    const result: MoMoQueryResponse = await response.json()
    
    return result
  } catch (error: any) {
    console.error('MoMo query error:', error)
    throw new Error(`Failed to query MoMo payment: ${error.message}`)
  }
}

// Verify MoMo callback signature
export function verifyMoMoSignature(
  data: Record<string, any>,
  secretKey: string,
  receivedSignature: string
): boolean {
  const calculatedSignature = generateMoMoSignature(data, secretKey)
  return calculatedSignature === receivedSignature
}

// Get MoMo config from environment variables
export function getMoMoConfig(): MoMoConfig {
  const partnerCode = process.env.NEXT_PUBLIC_MOMO_PARTNER_CODE || process.env.MOMO_PARTNER_CODE
  const accessKey = process.env.NEXT_PUBLIC_MOMO_ACCESS_KEY || process.env.MOMO_ACCESS_KEY
  const secretKey = process.env.MOMO_SECRET_KEY // Never expose secret key to client
  const environment = (process.env.NEXT_PUBLIC_MOMO_ENVIRONMENT || process.env.MOMO_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production'
  
  if (!partnerCode || !accessKey || !secretKey) {
    throw new Error('MoMo configuration is incomplete. Please check your environment variables.')
  }
  
  return {
    partnerCode,
    accessKey,
    secretKey,
    environment,
  }
}

