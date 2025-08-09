import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20'
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event
    
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log('Processing Stripe webhook:', event.type)

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
        
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
        
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
    
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' }, 
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout completed:', session.id)
  
  const { customer_email, metadata, customer } = session
  
  if (!customer_email || !metadata?.website) {
    console.error('Missing required session data')
    return
  }

  try {
    // Create user in database
    const { data, error } = await supabase
      .from('users')
      .upsert({
        email: customer_email,
        website_url: metadata.website,
        stripe_customer_id: customer as string,
        subscription_status: 'trialing', // Will be updated by subscription webhook
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating user:', error)
      return
    }

    console.log('User created/updated:', data.id)

    // Trigger initial SEO report
    await fetch(`${process.env.NEXT_PUBLIC_URL}/api/seo-crawl`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        website: metadata.website,
        userId: data.id
      })
    })

  } catch (error) {
    console.error('Error in checkout completion:', error)
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Subscription created:', subscription.id)
  
  await updateSubscriptionStatus(
    subscription.customer as string, 
    subscription.status
  )
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id, subscription.status)
  
  await updateSubscriptionStatus(
    subscription.customer as string, 
    subscription.status
  )
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id)
  
  await updateSubscriptionStatus(
    subscription.customer as string, 
    'canceled'
  )
}

async function updateSubscriptionStatus(customerId: string, status: string) {
  try {
    const { error } = await supabase
      .from('users')
      .update({ 
        subscription_status: status,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_customer_id', customerId)

    if (error) {
      console.error('Error updating subscription status:', error)
    } else {
      console.log(`Updated subscription status to ${status} for customer ${customerId}`)
    }
  } catch (error) {
    console.error('Database error:', error)
  }
}