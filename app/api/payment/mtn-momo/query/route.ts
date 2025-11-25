// API Route for querying MTN MoMo payment status (Ghana)
import { NextRequest, NextResponse } from 'next/server'
import { queryMTNMoMoPaymentStatus, getMTNMoMoConfig } from '@/lib/mtn-momo-ghana'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { referenceId } = body
    
    if (!referenceId) {
      return NextResponse.json(
        { error: 'Reference ID (UUID) is required' },
        { status: 400 }
      )
    }
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(referenceId)) {
      return NextResponse.json(
        { error: 'Reference ID must be a valid UUID v4 format' },
        { status: 400 }
      )
    }
    
    // Get MTN MoMo configuration
    const config = getMTNMoMoConfig()
    
    // Query payment status
    const queryResponse = await queryMTNMoMoPaymentStatus(config, referenceId)
    
    return NextResponse.json({
      success: true,
      data: queryResponse,
    })
  } catch (error: any) {
    console.error('MTN MoMo payment query error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to query MTN MoMo payment' 
      },
      { status: 500 }
    )
  }
}

