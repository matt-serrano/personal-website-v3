import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import Script from "next/script"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Shaders Landing Page",
  description: "Created with v0",
  generator: "v0.app",
}

const devRuntimeGuardScript = `
(() => {
  if (window.__portfolioRuntimeGuardInstalled) return;
  window.__portfolioRuntimeGuardInstalled = true;

  const benignRuntimePatterns = [
    /abort/i,
    /canvas/i,
    /context lost/i,
    /gpu/i,
    /shader/i,
    /webgl/i,
    /webgpu/i,
  ];

  const getMessage = (reason) => {
    if (reason == null) return "";
    if (reason instanceof Error) return reason.message || reason.name || "";
    if (typeof reason === "string") return reason;

    try {
      return JSON.stringify(reason);
    } catch {
      return String(reason);
    }
  };

  window.addEventListener("unhandledrejection", (event) => {
    const message = getMessage(event.reason);
    const isBenign = message === "" || benignRuntimePatterns.some((pattern) => pattern.test(message));

    if (!isBenign) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    console.warn("[runtime guard] Ignored benign browser rendering rejection:", event.reason);
  }, true);
})();
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {process.env.NODE_ENV === "development" ? (
          <Script id="dev-runtime-guard" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: devRuntimeGuardScript }} />
        ) : null}
        {children}
        <Analytics />
      </body>
    </html>
  )
}
