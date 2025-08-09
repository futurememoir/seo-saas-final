import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Daily SEO Assistant - Automated SEO Audits',
  description: 'Get daily SEO health checks for your website. Our AI finds critical issues before they hurt your Google rankings.',
  keywords: 'SEO, website audit, SEO monitoring, search engine optimization',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://js.stripe.com/v3/" async></script>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}