// SEO Crawl Agent - Migrated from your existing agent
import puppeteer from 'puppeteer'
import nodemailer from 'nodemailer'

export interface SEOReport {
  url: string
  timestamp: string
  score: number
  issues: SEOIssue[]
  metrics: {
    titleLength: number
    descriptionLength: number
    h1Count: number
    imageCount: number
    imagesWithoutAlt: number
    wordCount: number
    loadTime: number
  }
}

export interface SEOIssue {
  type: 'critical' | 'warning' | 'info'
  category: string
  title: string
  description: string
  fix: string
  impact: 'high' | 'medium' | 'low'
}

export class SEOCrawlAgent {
  private userAgent = 'Daily SEO Assistant Bot/1.0 (SEO Analysis)'

  async analyzeSite(url: string): Promise<SEOReport> {
    let browser
    const issues: SEOIssue[] = []
    const metrics = {
      titleLength: 0,
      descriptionLength: 0,
      h1Count: 0,
      imageCount: 0,
      imagesWithoutAlt: 0,
      wordCount: 0,
      loadTime: 0
    }

    try {
      browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // For serverless
      })
      const page = await browser.newPage()
      await page.setUserAgent(this.userAgent)

      const startTime = Date.now()
      const response = await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      })
      metrics.loadTime = Date.now() - startTime

      if (!response?.ok()) {
        throw new Error(`HTTP ${response?.status()}: Site not accessible`)
      }

      // 1. Check title tag
      const title = await page.title()
      metrics.titleLength = title.length
      
      if (!title) {
        issues.push({
          type: 'critical',
          category: 'Title',
          title: 'Missing Page Title',
          description: 'Your page has no title tag',
          fix: 'Add a descriptive <title> tag to your HTML head section',
          impact: 'high'
        })
      } else if (title.length < 30) {
        issues.push({
          type: 'critical',
          category: 'Title',
          title: 'Title Too Short',
          description: `Your title is only ${title.length} characters`,
          fix: 'Expand your title to 30-60 characters for better SEO',
          impact: 'high'
        })
      } else if (title.length > 60) {
        issues.push({
          type: 'warning',
          category: 'Title',
          title: 'Title Too Long',
          description: `Your title is ${title.length} characters and may be truncated`,
          fix: 'Shorten your title to under 60 characters',
          impact: 'medium'
        })
      }

      // 2. Check meta description
      const metaDescription = await page.$eval(
        'meta[name="description"]', 
        el => (el as HTMLMetaElement).content
      ).catch(() => null)
      
      if (metaDescription) {
        metrics.descriptionLength = metaDescription.length
        if (metaDescription.length < 120) {
          issues.push({
            type: 'warning',
            category: 'Meta Description',
            title: 'Meta Description Too Short',
            description: `Your meta description is only ${metaDescription.length} characters`,
            fix: 'Expand to 120-160 characters for better search snippets',
            impact: 'medium'
          })
        } else if (metaDescription.length > 160) {
          issues.push({
            type: 'warning',
            category: 'Meta Description',
            title: 'Meta Description Too Long',
            description: `Your meta description is ${metaDescription.length} characters`,
            fix: 'Shorten to under 160 characters to avoid truncation',
            impact: 'medium'
          })
        }
      } else {
        issues.push({
          type: 'critical',
          category: 'Meta Description',
          title: 'Missing Meta Description',
          description: 'Your page has no meta description tag',
          fix: 'Add a <meta name="description" content="..."> tag',
          impact: 'high'
        })
      }

      // 3. Check H1 tags
      const h1Tags = await page.$$eval('h1', els => els.map(el => el.textContent?.trim() || ''))
      metrics.h1Count = h1Tags.length
      
      if (h1Tags.length === 0) {
        issues.push({
          type: 'critical',
          category: 'Headers',
          title: 'Missing H1 Tag',
          description: 'Your page has no H1 heading tag',
          fix: 'Add an H1 tag with your main page topic',
          impact: 'high'
        })
      } else if (h1Tags.length > 1) {
        issues.push({
          type: 'warning',
          category: 'Headers',
          title: 'Multiple H1 Tags',
          description: `Found ${h1Tags.length} H1 tags, should have only one`,
          fix: 'Use only one H1 tag per page, use H2-H6 for subheadings',
          impact: 'medium'
        })
      }

      // 4. Check images
      const images = await page.$$eval('img', els => 
        els.map(img => ({
          src: (img as HTMLImageElement).src,
          alt: (img as HTMLImageElement).alt || null
        }))
      )
      
      metrics.imageCount = images.length
      metrics.imagesWithoutAlt = images.filter(img => !img.alt).length
      
      if (metrics.imagesWithoutAlt > 0) {
        issues.push({
          type: 'warning',
          category: 'Images',
          title: 'Images Missing Alt Text',
          description: `${metrics.imagesWithoutAlt} of ${metrics.imageCount} images lack alt text`,
          fix: 'Add descriptive alt attributes to all images for accessibility',
          impact: 'medium'
        })
      }

      // 5. Check content length
      const bodyText = await page.$eval('body', el => el.textContent || '').catch(() => '')
      const words = bodyText.trim().split(/\\s+/).filter(word => word.length > 0)
      metrics.wordCount = words.length
      
      if (metrics.wordCount < 300) {
        issues.push({
          type: 'critical',
          category: 'Content',
          title: 'Insufficient Content',
          description: `Only ${metrics.wordCount} words found, search engines prefer 300+`,
          fix: 'Add more valuable, relevant content to your page',
          impact: 'high'
        })
      }

      // 6. Check page speed
      if (metrics.loadTime > 3000) {
        issues.push({
          type: 'warning',
          category: 'Performance',
          title: 'Slow Page Load',
          description: `Page loaded in ${Math.round(metrics.loadTime / 1000)}s, target is under 3s`,
          fix: 'Optimize images, minimize CSS/JS, use a CDN',
          impact: 'high'
        })
      }

      // Calculate overall score
      const criticalIssues = issues.filter(i => i.type === 'critical').length
      const warningIssues = issues.filter(i => i.type === 'warning').length
      const score = Math.max(0, 100 - (criticalIssues * 25) - (warningIssues * 10))

      return {
        url,
        timestamp: new Date().toISOString(),
        score,
        issues,
        metrics
      }

    } catch (error) {
      console.error('SEO analysis error:', error)
      throw new Error(`Failed to analyze ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      if (browser) {
        await browser.close()
      }
    }
  }

  generateEmailReport(report: SEOReport): string {
    const { url, score, issues, metrics } = report
    
    const criticalIssues = issues.filter(i => i.type === 'critical')
    const warningIssues = issues.filter(i => i.type === 'warning')
    
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
            .score { font-size: 48px; font-weight: bold; margin: 10px 0; }
            .score.good { color: #10b981; }
            .score.warning { color: #f59e0b; }
            .score.critical { color: #ef4444; }
            .section { margin: 20px 0; padding: 15px; border-radius: 8px; }
            .critical { background-color: #fef2f2; border-left: 4px solid #ef4444; }
            .warning { background-color: #fffbeb; border-left: 4px solid #f59e0b; }
            .good { background-color: #f0fdf4; border-left: 4px solid #10b981; }
            .issue { margin: 10px 0; }
            .issue-title { font-weight: bold; margin-bottom: 5px; }
            .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 20px 0; }
            .metric { text-align: center; padding: 10px; background: #f8fafc; border-radius: 8px; }
            .metric-value { font-size: 24px; font-weight: bold; color: #1e40af; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🕷️ Daily SEO Report</h1>
            <div>Website: ${url}</div>
            <div class="score ${score >= 80 ? 'good' : score >= 60 ? 'warning' : 'critical'}">${score}/100</div>
        </div>
    `
    
    if (criticalIssues.length > 0) {
      html += `
        <div class="section critical">
            <h2>🚨 Critical Issues (Fix Immediately)</h2>
            ${criticalIssues.map(issue => `
                <div class="issue">
                    <div class="issue-title">${issue.title}</div>
                    <div>${issue.description}</div>
                    <div><strong>Fix:</strong> ${issue.fix}</div>
                </div>
            `).join('')}
        </div>
      `
    }
    
    if (warningIssues.length > 0) {
      html += `
        <div class="section warning">
            <h2>⚠️ Warnings (Recommended Fixes)</h2>
            ${warningIssues.map(issue => `
                <div class="issue">
                    <div class="issue-title">${issue.title}</div>
                    <div>${issue.description}</div>
                    <div><strong>Fix:</strong> ${issue.fix}</div>
                </div>
            `).join('')}
        </div>
      `
    }
    
    if (issues.length === 0) {
      html += `
        <div class="section good">
            <h2>✅ Great Job!</h2>
            <p>No significant SEO issues found. Your site is in good shape!</p>
        </div>
      `
    }
    
    html += `
        <div class="section">
            <h2>📊 Site Metrics</h2>
            <div class="metrics">
                <div class="metric">
                    <div class="metric-value">${metrics.wordCount}</div>
                    <div>Words</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${metrics.loadTime}ms</div>
                    <div>Load Time</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${metrics.titleLength}</div>
                    <div>Title Length</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${metrics.h1Count}</div>
                    <div>H1 Tags</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${metrics.imageCount}</div>
                    <div>Images</div>
                </div>
            </div>
        </div>
        
        <div class="section" style="text-align: center; background: #f8fafc;">
            <p><strong>🕷️ Daily SEO Assistant</strong></p>
            <p>Generated on ${new Date(report.timestamp).toLocaleDateString()}</p>
            <p><a href="${process.env.NEXT_PUBLIC_URL}/dashboard">View Dashboard</a></p>
        </div>
    </body>
    </html>
    `
    
    return html
  }

  async sendEmailReport(email: string, website: string, report: SEOReport): Promise<void> {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      })

      const htmlReport = this.generateEmailReport(report)
      const subject = `SEO Report for ${website} - Score: ${report.score}/100`

      await transporter.sendMail({
        from: `"Daily SEO Assistant" <${process.env.SMTP_USER}>`,
        to: email,
        subject: subject,
        html: htmlReport
      })

      console.log(`✅ SEO report sent to ${email} for ${website}`)
    } catch (error) {
      console.error('❌ Email sending failed:', error)
      throw error
    }
  }
}