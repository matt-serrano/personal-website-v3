import type React from "react"
import type { Metadata, Viewport } from "next"
import { Anton, Archivo } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { POSTER_SCRIPT } from "@/lib/elnido/poster-script"
import { THEME } from "@/lib/elnido/sky"
import { HOME_FIT_SCRIPT } from "@/lib/home-fit"
import "./globals.css"

const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton" })
const archivo = Archivo({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-archivo" })

export const metadata: Metadata = {
  title: "Matthew Serrano",
  description: "Matthew Serrano, Computer Science student at Ontario Tech University.",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.png",
  },
}

// Fallback; the poster script puts the colour at the top of the plate it picks ahead of it
export const viewport: Viewport = { themeColor: THEME.day }

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: POSTER_SCRIPT }} />
        {/* Fits the home page to the visible height before it first paints (a no-op on other pages) */}
        <script dangerouslySetInnerHTML={{ __html: HOME_FIT_SCRIPT }} />
      </head>
      <body className={`${anton.variable} ${archivo.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
