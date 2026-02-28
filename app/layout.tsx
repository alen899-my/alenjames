import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Haunted House',
  description: 'Enter if you dare',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground overflow-x-hidden m-0 p-0">
        {children}
      </body>
    </html>
  )
}