import { NextRequest, NextResponse } from 'next/server'
import { SEOCrawlAgent } from '../../../lib/seo-agent'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { website, userId } = await request.json()

    if (!website || !userId) {
      return NextResponse.json({ error: 'Missing website or userId' }, { status: 400 })
    }

    // Get user info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check subscription status
    if (user.subscription_status !== 'active') {
      return NextResponse.json({ error: 'Inactive subscription' }, { status: 403 })
    }

    console.log(`Running SEO analysis for ${website}`)
    
    // Run SEO analysis
    const agent = new SEOCrawlAgent()
    const report = await agent.analyzeSite(website)

    // Save report to database
    const { error: reportError } = await supabase
      .from('seo_reports')
      .insert({
        user_id: userId,
        website_url: website,
        report_data: report,
        issues_count: report.issues.length,
        score: report.score
      })

    if (reportError) {
      console.error('Error saving report:', reportError)
    }

    // Send email report
    await sendEmailReport(user.email, report)

    return NextResponse.json({ 
      success: true, 
      data: {
        score: report.score,
        issues_count: report.issues.length,
        critical_issues: report.issues.filter(i => i.type === 'critical').length
      }
    })

  } catch (error) {
    console.error('SEO crawl error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze website' }, 
      { status: 500 }
    )
  }
}

async function sendEmailReport(email: string, report: any) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    const agent = new SEOCrawlAgent()
    const htmlReport = agent.generateEmailReport(report)

    await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'SEO Assistant <reports@dailyseoassistant.com>',
      to: email,
      subject: `🕷️ Daily SEO Report for ${report.url} - Score: ${report.score}/100`,
      html: htmlReport
    })

    console.log(`Email report sent to ${email}`)
  } catch (error) {
    console.error('Email sending failed:', error)
    // Don't throw - we still want to return success if analysis worked
  }
}