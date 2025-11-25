// API Route for querying MoMo payment status
import { NextRequest, NextResponse } from 'next/server'
import { queryMoMoPaymentStatus, getMoMoConfig } from '@/lib/momo-api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId } = body
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }
    
    // Get MoMo configuration
    const config = getMoMoConfig()
    
    // Query payment status
    const queryResponse = await queryMoMoPaymentStatus(config, orderId)
    
    return NextResponse.json({
      success: true,
      data: queryResponse,
    })
  } catch (error: any) {
    console.error('MoMo payment query error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to query MoMo payment' 
      },
      { status: 500 }
    )
  }
}

