'use client'

import { useState } from 'react'
import { CheckIcon, ChartBarIcon, ClockIcon, ShieldCheckIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#007BE5] via-[#0066CC] to-[#004499] font-dm-mono">
      {/* Header */}
      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                <ChartBarIcon className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-medium text-white">Daily SEO Assistant</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-white/80 hover:text-white text-[15px] transition-colors">Features</a>
              <a href="#pricing" className="text-white/80 hover:text-white text-[15px] transition-colors">Pricing</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-24">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-white/90 text-[15px] mb-8 backdrop-blur-sm">
              <span>✓ 7-day free trial</span>
              <span className="mx-2">•</span>
              <span>No credit card required</span>
            </div>
            
            <h2 className="text-5xl lg:text-6xl font-medium text-white mb-6 leading-tight">
              Never Miss an<br />
              <span className="text-white/90">SEO Issue</span> Again
            </h2>
            
            <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed">
              Get daily SEO health checks for your website. Our AI finds critical issues before they hurt your Google rankings.
            </p>
            
            {/* CTA Form */}
            <div className="max-w-md mx-auto">
              <form onSubmit={handleStartTrial} className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="Enter your website URL"
                    className="w-full px-6 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 text-[15px]"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isValidating}
                  className="w-full bg-white text-[#007BE5] py-4 px-6 rounded-xl font-medium text-[15px] hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group"
                >
                  {isValidating ? (
                    'Validating...'
                  ) : (
                    <>
                      Start 7-Day Free Trial
                      <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-medium text-white mb-4">
              Comprehensive SEO Monitoring
            </h3>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Our automated system checks dozens of SEO factors every day, so you can focus on growing your business.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-200">
                <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-xl font-medium text-white mb-3">{feature.title}</h4>
                <p className="text-white/70 text-[15px] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-medium text-white mb-4">
              Simple, Transparent Pricing
            </h3>
            <p className="text-lg text-white/80">
              Start with a free trial, then just $39/month for unlimited monitoring.
            </p>
          </div>
          
          <div className="max-w-lg mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 overflow-hidden">
              <div className="bg-white/20 text-white p-8 text-center">
                <h4 className="text-2xl font-medium mb-2">Professional</h4>
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-medium">$39</span>
                  <span className="text-white/70 ml-2 text-lg">/month</span>
                </div>
              </div>
              
              <div className="p-8">
                <ul className="space-y-4 mb-8">
                  {[
                    'Daily automated SEO audits',
                    'Email reports with actionable fixes',
                    'Technical SEO issue detection',
                    'Performance monitoring',
                    'Mobile-friendly analysis',
                    '7-day free trial'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center text-white">
                      <CheckIcon className="h-5 w-5 text-white/80 mr-3 flex-shrink-0" />
                      <span className="text-[15px]">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="space-y-4">
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="Enter your website URL"
                    className="w-full px-6 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 text-[15px]"
                  />
                  <button
                    onClick={handleStartTrial}
                    disabled={isValidating}
                    className="w-full bg-white text-[#007BE5] py-4 px-6 rounded-xl font-medium text-[15px] hover:bg-white/90 disabled:opacity-50 transition-all duration-200 flex items-center justify-center group"
                  >
                    {isValidating ? (
                      'Starting Trial...'
                    ) : (
                      <>
                        Start Free Trial
                        <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-16 border-t border-white/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                <ChartBarIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-medium text-white">Daily SEO Assistant</span>
            </div>
            <p className="text-white/60 mb-6 text-[15px]">
              Automated SEO monitoring for growing businesses
            </p>
            <div className="flex justify-center space-x-8 text-[15px]">
              <a href="#" className="text-white/60 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">Terms of Service</a>
              <a href="mailto:support@dailyseoassistant.com" className="text-white/60 hover:text-white transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}