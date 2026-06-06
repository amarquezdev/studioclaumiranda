import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Jost, Cormorant_Garamond } from 'next/font/google'
import './globals.css'

const jost = Jost({
  variable: '--font-sans',
  subsets: ['latin'],
})
const cormorant = Cormorant_Garamond({
  variable: '--font-serif',
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Studio Clau Miranda — Good Hair Days Just Got Better',
  description: 'Salón de belleza en San Vicente de Tagua Tagua. Reserva tu cita hoy.',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${jost.variable} ${cormorant.variable}`}>
      <body className="font-sans antialiased bg-background">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
