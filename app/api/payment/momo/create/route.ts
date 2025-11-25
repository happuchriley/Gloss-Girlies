// API Route for creating MoMo payment
import { NextRequest, NextResponse } from 'next/server'
import { createMoMoPaymentRequest, getMoMoConfig } from '@/lib/momo-api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, orderId, orderInfo, returnUrl, notifyUrl, extraData } = body
    
    // Validate required fields
    if (!amount || !orderId || !orderInfo || !returnUrl || !notifyUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Get MoMo configuration
    const config = getMoMoConfig()
    
    // Create payment request
    const paymentResponse = await createMoMoPaymentRequest(config, {
      amount,
      orderId,
      orderInfo,
      returnUrl,
      notifyUrl,
      extraData,
    })
    
    return NextResponse.json({
      success: true,
      data: paymentResponse,
    })
  } catch (error: any) {
    console.error('MoMo payment creation error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to create MoMo payment' 
      },
      { status: 500 }
    )
  }
}

