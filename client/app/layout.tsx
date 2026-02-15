import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import './globals.css'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Convo - Modern Messaging',
  description: 'Convo - A beautiful chat application for seamless conversations',
  generator: 'v0.app',
  icons: {
    icon: '/favicon.svg',
  },
}

import { ThemeProvider } from "@/components/providers/ThemeProvider"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          defaultTheme="light"
          storageKey="chat-theme"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
