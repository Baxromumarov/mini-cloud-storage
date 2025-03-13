import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CloudStorage',
  icons: [
    {
      rel: 'icon',
      url: '/icons/cloud-storage.png', // Remove "/public" from the URL
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}