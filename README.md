# 🕷️ Daily SEO Assistant - SaaS

A Next.js SaaS application that provides automated daily SEO monitoring and reporting for websites.

## Status: Live and Working ✅

## Features

- **Automated SEO Audits**: Daily technical SEO analysis using Puppeteer
- **Email Reports**: Detailed reports sent directly to users' inboxes  
- **Subscription Management**: Stripe integration with 7-day free trials
- **User Dashboard**: Real-time SEO metrics and historical reports
- **Serverless Architecture**: Deployed on Vercel with Supabase backend

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, TypeScript
- **Backend**: Next.js API Routes, Supabase (PostgreSQL)
- **Payments**: Stripe Subscriptions & Webhooks
- **SEO Engine**: Custom Puppeteer-based crawler
- **Deployment**: Vercel (with cron jobs)
- **Email**: Nodemailer with HTML templates

## Getting Started

### 1. Clone and Install

```bash
git clone https://github.com/futurememoir/seo-agent-saas.git
cd seo-agent-saas
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

Required environment variables:
- Supabase: URL, anon key, service role key
- Stripe: secret key, publishable key, price ID, webhook secret
- Application: public URL, cron secret
- Email: SMTP configuration

### 3. Supabase Database Setup

1. Create a new Supabase project
2. Run the SQL commands in `supabase-schema.sql` in your Supabase SQL editor
3. Note your project URL and keys for environment variables

### 4. Stripe Setup

1. Create Stripe account and get API keys
2. Create a subscription product ($39/month)
3. Set up webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
4. Add webhook events: `checkout.session.completed`, `customer.subscription.*`

### 5. Development

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Add all environment variables in Vercel dashboard
3. Deploy - Vercel will automatically handle the build and cron jobs

### Important Configuration

- **Cron Jobs**: Configured in `vercel.json` to run daily at 8 AM UTC
- **Webhooks**: Stripe webhooks handle subscription lifecycle events
- **Database**: Supabase provides PostgreSQL with Row Level Security

## API Endpoints

- `POST /api/seo-crawl` - Run SEO analysis for a website
- `POST /api/test-seo` - Quick SEO test for checkout validation  
- `POST /api/create-checkout-session` - Create Stripe checkout session
- `POST /api/stripe/webhook` - Handle Stripe webhook events
- `GET /api/cron/daily-reports` - Daily automated SEO reports (cron job)

## Key Components

- **Landing Page** (`/`): Marketing page with signup flow
- **Checkout** (`/checkout`): Payment processing with website validation
- **Welcome** (`/welcome`): Post-purchase onboarding
- **Dashboard** (`/dashboard`): User portal with SEO reports and metrics

## SEO Analysis Features

- **Technical SEO**: Meta tags, headings, images, links
- **Performance**: Page load times, mobile-friendliness
- **Content Analysis**: Word count, readability, keyword density  
- **Issue Detection**: Missing elements, broken links, SEO problems
- **Scoring**: 0-100 SEO score with actionable recommendations

## Subscription Model

- **Free Trial**: 7 days, no credit card required
- **Monthly Plan**: $39/month after trial
- **Features**: Daily reports, unlimited websites, email support
- **Cancellation**: Self-service through Stripe customer portal

## Support & Customization

For customization or support:
- Email: support@dailyseoassistant.com
- GitHub Issues: For bug reports and feature requests

## License

MIT License - see LICENSE file for details.

---

**Built with ❤️ for better SEO monitoring**