'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

function WelcomeContent() {
  const searchParams = useSearchParams()
  const [sessionId, setSessionId] = useState('')

  useEffect(() => {
    const session = searchParams?.get('session_id')
    if (session) {
      setSessionId(session)
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-3xl mx-auto py-16 px-4 text-center">
        <div className="mb-8">
          <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎉 Welcome to Daily SEO Assistant!
          </h1>
          <p className="text-xl text-gray-600">
            Your 7-day free trial has started successfully
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            What happens next?
          </h2>
          
          <div className="space-y-6 text-left max-w-2xl mx-auto">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-4 mt-1">
                <span className="text-indigo-600 font-bold text-sm">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Initial SEO Analysis Running</h3>
                <p className="text-gray-600">
                  We're analyzing your website right now. You'll receive your first SEO report via email within the next 10 minutes.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-4 mt-1">
                <span className="text-indigo-600 font-bold text-sm">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Daily Monitoring Starts</h3>
                <p className="text-gray-600">
                  Starting tomorrow, you'll receive a daily SEO report every morning at 8 AM with any new issues or improvements.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-4 mt-1">
                <span className="text-indigo-600 font-bold text-sm">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">7-Day Free Trial</h3>
                <p className="text-gray-600">
                  Your trial lasts for 7 full days. If you don't cancel before then, you'll be charged $39/month to continue the service.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Link 
            href="/dashboard" 
            className="inline-block w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            View Dashboard
          </Link>
          
          <div className="text-sm text-gray-600">
            <p>
              <strong>Need help?</strong> Reply to any of our emails or contact{' '}
              <a href="mailto:support@dailyseoassistant.com" className="text-indigo-600 hover:underline">
                support@dailyseoassistant.com
              </a>
            </p>
          </div>
        </div>

        <div className="mt-12 bg-blue-50 rounded-xl p-6">
          <h3 className="font-semibold text-lg mb-3">📧 Check Your Email</h3>
          <p className="text-gray-700">
            We've sent you a confirmation email with your account details. 
            Your first SEO report should arrive within 10 minutes.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function Welcome() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
    </div>}>
      <WelcomeContent />
    </Suspense>
  )
}