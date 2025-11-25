// API Route for creating MTN MoMo payment (Ghana)
import { NextRequest, NextResponse } from 'next/server'
import { createMTNMoMoPayment, getMTNMoMoConfig } from '@/lib/mtn-momo-ghana'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, phoneNumber, orderId, orderInfo, callbackUrl } = body
    
    // Validate required fields
    if (!amount || !phoneNumber || !orderId || !orderInfo) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, phoneNumber, orderId, orderInfo' },
        { status: 400 }
      )
    }
    
    // Validate phone number format (Ghana format: 0244123456)
    const phoneRegex = /^0[0-9]{9}$/
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Expected format: 0244123456' },
        { status: 400 }
      )
    }
    
    // Get MTN MoMo configuration
    const config = getMTNMoMoConfig()
    
    // Build callback URL if not provided
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                   (request.headers.get('origin') || 'http://localhost:3000')
    const notifyUrl = callbackUrl || `${baseUrl}/api/payment/mtn-momo/notify`
    
    // Create payment request
    const paymentResponse = await createMTNMoMoPayment(config, {
      amount: parseFloat(amount),
      phoneNumber,
      orderId,
      orderInfo,
      callbackUrl: notifyUrl,
    })
    
    return NextResponse.json({
      success: true,
      data: paymentResponse,
    })
  } catch (error: any) {
    console.error('MTN MoMo payment creation error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to create MTN MoMo payment' 
      },
      { status: 500 }
    )
  }
}

