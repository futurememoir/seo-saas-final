import type { Metadata } from 'next'
import { Inter, DM_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })
const dmMono = DM_Mono({ 
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-dm-mono'
})

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
      <body className={`${inter.className} ${dmMono.variable}`}>{children}</body>
    </html>
  )
}