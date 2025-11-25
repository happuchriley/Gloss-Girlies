// API Route for MTN MoMo payment webhook (callback URL)
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // MTN MoMo callback payload structure
    const {
      financialTransactionId,
      externalId,
      amount,
      currency,
      payer,
      payerMessage,
      payeeNote,
      status,
      reason,
    } = body
    
    console.log('MTN MoMo callback received:', {
      financialTransactionId,
      externalId,
      amount,
      status,
      reason,
    })
    
    // Update order status based on payment result
    if (status === 'SUCCESSFUL') {
      // Payment successful
      // Note: In a real implementation, you would update the order in the database
      // For now, we'll just log it
      console.log(`MTN MoMo payment successful for order ${externalId}. Transaction ID: ${financialTransactionId}`)
      
      // You can add order status update logic here
      // await updateOrderStatus(externalId, 'paid', { 
      //   transactionId: financialTransactionId,
      //   amount,
      //   currency 
      // })
    } else if (status === 'FAILED' || status === 'REJECTED') {
      // Payment failed
      console.log(`MTN MoMo payment failed for order ${externalId}. Reason: ${reason}`)
      // await updateOrderStatus(externalId, 'payment_failed', { error: reason })
    } else if (status === 'PENDING') {
      // Payment still pending
      console.log(`MTN MoMo payment pending for order ${externalId}`)
    }
    
    // Always return 200 OK to acknowledge receipt
    return NextResponse.json({
      success: true,
      message: 'Callback received and processed',
    })
  } catch (error: any) {
    console.error('MTN MoMo webhook error:', error)
    // Still return 200 to prevent retries
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to process webhook' 
      },
      { status: 200 } // Return 200 to acknowledge receipt
    )
  }
}

