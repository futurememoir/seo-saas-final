import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function GET() {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-06-20'
    })

    // Test Stripe connection
    const prices = await stripe.prices.list({ limit: 3 })
    
    return NextResponse.json({ 
      success: true,
      message: 'Stripe connected successfully',
      priceCount: prices.data.length,
      hasTargetPrice: prices.data.some(p => p.id === process.env.STRIPE_PRICE_ID),
      targetPriceId: process.env.STRIPE_PRICE_ID
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        stripeKeyExists: !!process.env.STRIPE_SECRET_KEY,
        priceIdExists: !!process.env.STRIPE_PRICE_ID
      }, 
      { status: 500 }
    )
  }
}