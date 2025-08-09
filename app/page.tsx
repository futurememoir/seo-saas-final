'use client'

import { useState } from 'react'
import { CheckIcon, ChartBarIcon, ClockIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

export default function Home() {
  const [website, setWebsite] = useState('')
  const [isValidating, setIsValidating] = useState(false)

  const handleStartTrial = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!website) return
    
    setIsValidating(true)
    
    // Basic URL validation
    let url = website
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }
    
    try {
      new URL(url)
      // Redirect to checkout with website URL
      window.location.href = `/checkout?website=${encodeURIComponent(url)}`
    } catch {
      alert('Please enter a valid website URL')
      setIsValidating(false)
    }
  }

  const features = [
    {
      icon: ChartBarIcon,
      title: 'Daily SEO Audits',
      description: 'Comprehensive analysis of your website\'s SEO health every morning'
    },
    {
      icon: ClockIcon,
      title: 'Real-time Alerts',
      description: 'Get notified immediately when critical SEO issues are detected'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Technical Monitoring',
      description: 'Track meta tags, page speed, mobile-friendliness, and more'
    }
  ]

  const plans = [
    {
      name: 'Professional',
      price: 39,
      features: [
        'Daily automated SEO audits',
        'Email reports with actionable fixes',
        'Technical SEO issue detection',
        'Performance monitoring',
        'Mobile-friendly analysis',
        '7-day free trial'
      ]
    }
  ]

  return (
    <div className="bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Daily SEO Assistant</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-6">
              Never Miss an SEO Issue Again
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Get daily SEO health checks for your website. Our AI finds critical issues before they hurt your Google rankings.
            </p>
            
            {/* CTA Form */}
            <div className="max-w-md mx-auto">
              <form onSubmit={handleStartTrial} className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="Enter your website URL"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isValidating}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isValidating ? 'Validating...' : 'Start 7-Day Free Trial'}
                </button>
              </form>
              <p className="text-sm text-gray-500 mt-3">
                No credit card required • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Comprehensive SEO Monitoring
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our automated system checks dozens of SEO factors every day, so you can focus on growing your business.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h3>
            <p className="text-lg text-gray-600">
              Start with a free trial, then just $39/month for unlimited monitoring.
            </p>
          </div>
          
          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-200">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 text-center">
                <h4 className="text-2xl font-bold">{plans[0].name}</h4>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${plans[0].price}</span>
                  <span className="text-blue-200 ml-2">/month</span>
                </div>
              </div>
              
              <div className="p-6">
                <ul className="space-y-3">
                  {plans[0].features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-3" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-8">
                  <form onSubmit={handleStartTrial} className="space-y-4">
                    <input
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="Enter your website URL"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <button
                      type="submit"
                      disabled={isValidating}
                      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {isValidating ? 'Starting Trial...' : 'Start Free Trial'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <ChartBarIcon className="h-8 w-8 text-blue-400 mr-2" />
              <span className="text-xl font-bold">Daily SEO Assistant</span>
            </div>
            <p className="text-gray-400 mb-4">
              Automated SEO monitoring for growing businesses
            </p>
            <div className="flex justify-center space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white">Terms of Service</a>
              <a href="mailto:support@dailyseoassistant.com" className="text-gray-400 hover:text-white">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}