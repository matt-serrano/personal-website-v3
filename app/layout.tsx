import type React from "react"
import type { Metadata } from "next"
import { Anton, Archivo } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { POSTER_SCRIPT } from "@/lib/elnido/poster-script"
import "./globals.css"

const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton" })
const archivo = Archivo({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-archivo" })

export const metadata: Metadata = {
  title: "Matthew Serrano",
  description: "Matthew Serrano, Computer Science student at Ontario Tech University.",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: POSTER_SCRIPT }} />
      </head>
      <body className={`${anton.variable} ${archivo.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
