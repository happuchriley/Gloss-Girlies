// API Route for MoMo payment webhook (notify URL)
import { NextRequest, NextResponse } from 'next/server'
import { verifyMoMoSignature, getMoMoConfig } from '@/lib/momo-api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      partnerCode,
      accessKey,
      requestId,
      orderId,
      errorCode,
      message,
      localMessage,
      requestType,
      extraData,
      amount,
      transId,
      payType,
      responseTime,
      signature,
    } = body
    
    if (!orderId || !signature) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Get MoMo configuration
    const config = getMoMoConfig()
    
    // Verify signature
    const notifyData: Record<string, any> = {
      partnerCode,
      accessKey,
      requestId,
      orderId,
      errorCode: errorCode?.toString() || '0',
      message: message || '',
      localMessage: localMessage || '',
      requestType: requestType || '',
      extraData: extraData || '',
      amount: amount?.toString() || '0',
      transId: transId || '',
      payType: payType || '',
      responseTime: responseTime?.toString() || '',
    }
    
    const isValid = verifyMoMoSignature(notifyData, config.secretKey, signature)
    if (!isValid) {
      console.error('Invalid MoMo webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }
    
    // Update order status based on payment result
    if (errorCode === 0 && transId) {
      // Payment successful
      // Note: In a real implementation, you would update the order in the database
      // For now, we'll just log it
      console.log(`MoMo payment successful for order ${orderId}. Transaction ID: ${transId}`)
      
      // You can add order status update logic here
      // await updateOrderStatus(orderId, 'paid', { transactionId: transId })
    } else {
      // Payment failed
      console.log(`MoMo payment failed for order ${orderId}. Error: ${message}`)
      // await updateOrderStatus(orderId, 'payment_failed', { error: message })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
    })
  } catch (error: any) {
    console.error('MoMo webhook error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to process webhook' 
      },
      { status: 500 }
    )
  }
}

