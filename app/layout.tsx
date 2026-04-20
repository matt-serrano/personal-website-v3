import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import Script from "next/script"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Matthew Serrano",
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
    if (reason instanceof Event) return reason.type || "[object Event]";

    try {
      const serialized = JSON.stringify(reason);
      return serialized === "{}" ? Object.prototype.toString.call(reason) : serialized;
    } catch {
      return String(reason);
    }
  };

  window.addEventListener("unhandledrejection", (event) => {
    const message = getMessage(event.reason);
    const isBrowserEvent = event.reason instanceof Event || message === "[object Event]";
    const isBenign =
      message === "" ||
      isBrowserEvent ||
      benignRuntimePatterns.some((pattern) => pattern.test(message));

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
