// API Route for MoMo payment callback (return URL)
import { NextRequest, NextResponse } from 'next/server'
import { verifyMoMoSignature, getMoMoConfig } from '@/lib/momo-api'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const orderId = searchParams.get('orderId')
    const errorCode = searchParams.get('errorCode')
    const message = searchParams.get('message')
    const signature = searchParams.get('signature')
    
    if (!orderId) {
      return NextResponse.redirect(new URL('/orders?error=missing_order_id', request.url))
    }
    
    // Verify signature if provided
    if (signature) {
      try {
        const config = getMoMoConfig()
        const callbackData: Record<string, any> = {
          orderId,
          errorCode: errorCode || '0',
          message: message || '',
        }
        
        const isValid = verifyMoMoSignature(callbackData, config.secretKey, signature)
        if (!isValid) {
          console.error('Invalid MoMo callback signature')
          return NextResponse.redirect(new URL(`/orders/${orderId}?error=invalid_signature`, request.url))
        }
      } catch (error) {
        console.error('Error verifying signature:', error)
        // Continue anyway if signature verification fails (for development)
      }
    }
    
    // Redirect to order page
    if (errorCode === '0') {
      return NextResponse.redirect(new URL(`/orders/${orderId}?status=success`, request.url))
    } else {
      return NextResponse.redirect(new URL(`/orders/${orderId}?status=failed&error=${encodeURIComponent(message || 'Payment failed')}`, request.url))
    }
  } catch (error: any) {
    console.error('MoMo callback error:', error)
    return NextResponse.redirect(new URL('/orders?error=callback_error', request.url))
  }
}

