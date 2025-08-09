'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

function CheckoutContent() {
  const searchParams = useSearchParams()
  const [website, setWebsite] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [testingWebsite, setTestingWebsite] = useState(false)

  useEffect(() => {
    const websiteParam = searchParams?.get('website')
    if (websiteParam) {
      setWebsite(decodeURIComponent(websiteParam))
    }
  }, [searchParams])

  const handleStartTrial = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!website || !email) return

    setIsLoading(true)

    try {
      // First, run a test SEO analysis to validate the website
      setTestingWebsite(true)
      const testResponse = await fetch('/api/test-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ website })
      })

      const testResult = await testResponse.json()
      
      if (!testResponse.ok) {
        throw new Error(testResult.error || 'Unable to analyze website')
      }

      setTestingWebsite(false)

      // Create Stripe checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          website
        })
      })

      const { sessionId, error } = await response.json()
      
      if (error) {
        throw new Error(error)
      }

      // Redirect to Stripe Checkout
      const stripe = (window as any).Stripe('pk_live_51Rthq15Y5F2onCZW9lhaacjY2XD2RLYKpEW7g2Kexu1y9lwKz56qP2Be1putthXdtmEdiGuwLFCaMyk0LDgddCs800pfHxUmnx')
      await stripe.redirectToCheckout({ sessionId })

    } catch (error) {
      console.error('Checkout error:', error)
      alert(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
      setTestingWebsite(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900 mr-6">
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back
            </Link>
            <div className="text-2xl font-bold text-indigo-600">🕷️ Daily SEO Assistant</div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto py-16 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Start Your 7-Day Free Trial
          </h1>
          <p className="text-lg text-gray-600">
            No credit card required. Cancel anytime.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Pricing Summary */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold">Daily SEO Monitoring</h3>
                <p className="text-indigo-100">Professional SEO audits every day</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">$39</div>
                <div className="text-indigo-100">/month</div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="p-6 border-b">
            <h4 className="font-semibold mb-4">What's included:</h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <CheckIcon className="w-5 h-5 text-green-500 mr-3" />
                <span>Daily automated SEO audits</span>
              </div>
              <div className="flex items-center">
                <CheckIcon className="w-5 h-5 text-green-500 mr-3" />
                <span>Email reports with actionable fixes</span>
              </div>
              <div className="flex items-center">
                <CheckIcon className="w-5 h-5 text-green-500 mr-3" />
                <span>Technical SEO issue detection</span>
              </div>
              <div className="flex items-center">
                <CheckIcon className="w-5 h-5 text-green-500 mr-3" />
                <span>Performance monitoring</span>
              </div>
              <div className="flex items-center">
                <CheckIcon className="w-5 h-5 text-green-500 mr-3" />
                <span>Mobile-friendly analysis</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleStartTrial} className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website to Monitor
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  We'll send your daily SEO reports here
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || testingWebsite}
                className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {testingWebsite ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Testing your website...
                  </span>
                ) : isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Starting your trial...
                  </span>
                ) : (
                  'Start 7-Day Free Trial'
                )}
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-500">
                  By starting your trial, you agree to our{' '}
                  <a href="/terms" className="text-indigo-600 hover:underline">Terms of Service</a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</a>
                </p>
              </div>
            </div>
          </form>
        </div>

        {/* Trust indicators */}
        <div className="text-center mt-8">
          <div className="flex justify-center items-center space-x-8 text-gray-400">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Secure & Encrypted
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              7-Day Free Trial
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Cancel Anytime
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Checkout() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
    </div>}>
      <CheckoutContent />
    </Suspense>
  )
}