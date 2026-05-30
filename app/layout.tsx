import { Geist, Geist_Mono, Inter } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";
import { Metadata } from "next";

const inter = Inter({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: { default: 'Savings Tracker', template: '%s | Savings Tracker' },
  description: "Track your savings and achieve your goals",
  icons: {
    icon: '/icons/logo-small.svg',
  },
  openGraph: {
    title: 'Savings Tracker',
    description: 'Track your savings and achieve your goals',
    url: 'https://savings-tracker.com',
    images: '/icons/logo-large.svg',
  },
  metadataBase: new URL('https://savings-tracker.com'),
  alternates: {
    canonical: '/',
  },
 
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", inter.variable)}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
