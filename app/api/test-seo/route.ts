import { NextRequest, NextResponse } from 'next/server'
import { SEOCrawlAgent } from '../../../lib/seo-agent'

export async function POST(request: NextRequest) {
  try {
    const { website } = await request.json()

    if (!website) {
      return NextResponse.json({ error: 'Website URL is required' }, { status: 400 })
    }

    // Basic URL validation
    try {
      new URL(website)
    } catch {
      return NextResponse.json({ error: 'Invalid website URL' }, { status: 400 })
    }

    console.log(`Testing SEO analysis for ${website}`)
    
    // For now, return a mock successful response to test the flow
    // We'll implement the full SEO analysis after signup
    const mockPreview = {
      url: website,
      score: Math.floor(Math.random() * 30) + 60, // Random score between 60-90
      issues_found: Math.floor(Math.random() * 8) + 2, // 2-10 issues
      critical_issues: Math.floor(Math.random() * 3) + 1, // 1-3 critical
      word_count: Math.floor(Math.random() * 500) + 300, // 300-800 words
      load_time: Math.floor(Math.random() * 2000) + 1000 // 1-3 second load time
    }

    // Return mock summary for checkout validation
    return NextResponse.json({ 
      success: true, 
      preview: mockPreview
    })

  } catch (error) {
    console.error('Test SEO error:', error)
    
    // Return more specific error messages
    let errorMessage = 'Unable to analyze website'
    
    if (error instanceof Error) {
      if (error.message.includes('net::ERR_NAME_NOT_RESOLVED')) {
        errorMessage = 'Website not found. Please check the URL and try again.'
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Website took too long to respond. Please try again.'
      } else if (error.message.includes('HTTP')) {
        errorMessage = 'Website is not accessible. Please check if it\'s online.'
      }
    }

    return NextResponse.json(
      { error: errorMessage }, 
      { status: 400 }
    )
  }
}