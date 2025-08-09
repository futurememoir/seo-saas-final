import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { SEOCrawlAgent } from '../../../../lib/seo-agent'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Verify cron secret to prevent unauthorized access
const CRON_SECRET = process.env.CRON_SECRET || 'your-cron-secret'

export async function GET(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🕷️ Starting daily SEO reports cron job...')

    // Get all active users with valid subscriptions
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .in('subscription_status', ['active', 'trialing'])

    if (usersError) {
      throw usersError
    }

    if (!users || users.length === 0) {
      console.log('No active users found')
      return NextResponse.json({ 
        success: true, 
        message: 'No active users to process' 
      })
    }

    console.log(`Found ${users.length} active users to process`)

    const results = {
      processed: 0,
      successful: 0,
      failed: 0,
      errors: [] as string[]
    }

    // Process each user
    for (const user of users) {
      results.processed++
      
      try {
        console.log(`Processing user ${user.id} - ${user.email}`)

        // Check if we already ran a report today
        const today = new Date().toISOString().split('T')[0]
        const { data: existingReport } = await supabase
          .from('seo_reports')
          .select('id')
          .eq('user_id', user.id)
          .gte('created_at', `${today}T00:00:00.000Z`)
          .lt('created_at', `${today}T23:59:59.999Z`)
          .single()

        if (existingReport) {
          console.log(`Report already exists for user ${user.id} today, skipping`)
          results.successful++
          continue
        }

        // Run SEO analysis
        const agent = new SEOCrawlAgent()
        const report = await agent.analyzeSite(user.website_url)

        // Save report to database
        const { error: saveError } = await supabase
          .from('seo_reports')
          .insert({
            user_id: user.id,
            website_url: user.website_url,
            score: report.score,
            issues_count: report.issues.length,
            critical_issues: report.issues.filter(i => i.type === 'critical').length,
            report_data: report,
            metrics: report.metrics
          })

        if (saveError) {
          throw saveError
        }

        // Send email report
        await agent.sendEmailReport(user.email, user.website_url, report)

        console.log(`✅ Successfully processed user ${user.id}`)
        results.successful++

      } catch (error) {
        console.error(`❌ Error processing user ${user.id}:`, error)
        results.failed++
        results.errors.push(`User ${user.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }

      // Add small delay to prevent overwhelming servers
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    const summary = `Daily SEO Reports Completed:
- Processed: ${results.processed} users
- Successful: ${results.successful}
- Failed: ${results.failed}
${results.errors.length > 0 ? `\nErrors:\n${results.errors.join('\n')}` : ''}`

    console.log(summary)

    return NextResponse.json({
      success: true,
      summary: {
        processed: results.processed,
        successful: results.successful,
        failed: results.failed,
        errors: results.errors
      }
    })

  } catch (error) {
    console.error('Cron job error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    )
  }
}

// Also support POST for manual triggering
export async function POST(request: NextRequest) {
  return GET(request)
}