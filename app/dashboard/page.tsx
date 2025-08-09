'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { 
  ChartBarIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  CogIcon
} from '@heroicons/react/24/outline'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface User {
  id: string
  email: string
  website_url: string
  subscription_status: string
  created_at: string
}

interface SEOReport {
  id: string
  score: number
  issues_count: number
  critical_issues: number
  created_at: string
  metrics: {
    loadTime: number
    wordCount: number
    imageCount: number
  }
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [reports, setReports] = useState<SEOReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      // In a real app, you'd get the user ID from authentication
      // For now, we'll use a placeholder approach
      const urlParams = new URLSearchParams(window.location.search)
      const userId = urlParams.get('user') || localStorage.getItem('userId')
      
      if (!userId) {
        setError('Please log in to view your dashboard')
        setLoading(false)
        return
      }

      // Load user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (userError) {
        throw userError
      }

      setUser(userData)

      // Load recent reports
      const { data: reportsData, error: reportsError } = await supabase
        .from('seo_reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (reportsError) {
        console.error('Reports error:', reportsError)
        // Don't throw here, reports might be empty for new users
      } else {
        setReports(reportsData || [])
      }

    } catch (error) {
      console.error('Dashboard error:', error)
      setError('Unable to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const runManualSEOCheck = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/seo-crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website: user.website_url,
          userId: user.id
        })
      })

      if (!response.ok) {
        throw new Error('Failed to run SEO check')
      }

      // Reload reports
      await loadUserData()
      
    } catch (error) {
      console.error('Manual SEO check error:', error)
      setError('Failed to run manual SEO check')
    } finally {
      setLoading(false)
    }
  }

  const getSubscriptionStatusBadge = (status: string) => {
    const statusConfig = {
      'active': { color: 'bg-green-100 text-green-800', text: 'Active' },
      'trialing': { color: 'bg-blue-100 text-blue-800', text: 'Free Trial' },
      'past_due': { color: 'bg-red-100 text-red-800', text: 'Past Due' },
      'canceled': { color: 'bg-gray-100 text-gray-800', text: 'Canceled' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.canceled
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    )
  }

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  const latestReport = reports[0]
  const averageScore = reports.length > 0 
    ? Math.round(reports.reduce((sum, r) => sum + r.score, 0) / reports.length) 
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold text-indigo-600">🕷️ Daily SEO Assistant</div>
            <div className="flex items-center space-x-4">
              {getSubscriptionStatusBadge(user?.subscription_status || 'canceled')}
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <CogIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back!
          </h1>
          <p className="text-gray-600">
            Monitoring SEO for <span className="font-medium">{user?.website_url}</span>
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <ChartBarIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Current Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {latestReport ? latestReport.score : '--'}/100
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Reports Generated</p>
                <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Issues Found</p>
                <p className="text-2xl font-bold text-gray-900">
                  {latestReport ? latestReport.critical_issues : '--'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{averageScore}/100</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={runManualSEOCheck}
                disabled={loading}
                className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Running Check...
                  </>
                ) : (
                  <>
                    Run Manual SEO Check
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
              
              <a 
                href={user?.website_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                View Website
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </a>
            </div>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Recent SEO Reports</h2>
          </div>
          <div className="overflow-hidden">
            {reports.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <ChartBarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No reports yet</p>
                <p>Your first SEO report will appear here after it's generated</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SEO Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Issues
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Load Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(report.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-2 ${
                              report.score >= 80 ? 'bg-green-400' : 
                              report.score >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                            }`}></div>
                            <span className="text-sm font-medium text-gray-900">
                              {report.score}/100
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            report.critical_issues === 0 ? 'bg-green-100 text-green-800' : 
                            report.critical_issues < 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {report.critical_issues} critical
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.metrics?.loadTime ? `${report.metrics.loadTime}ms` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                            Complete
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Trial Status */}
        {user?.subscription_status === 'trialing' && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-blue-900">Free Trial Active</h3>
                <p className="text-blue-700 mt-1">
                  Your 7-day free trial is currently active. You'll be charged $39/month after the trial ends unless you cancel.
                </p>
                <div className="mt-3 flex space-x-3">
                  <a 
                    href="mailto:support@dailyseoassistant.com"
                    className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                  >
                    Cancel Trial
                  </a>
                  <span className="text-blue-400">•</span>
                  <a 
                    href="mailto:support@dailyseoassistant.com"
                    className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                  >
                    Billing Settings
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}