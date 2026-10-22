import type React from "react"
import type { Metadata } from "next"
import { Anton, Archivo } from "next/font/google"
import Script from "next/script"
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: POSTER_SCRIPT }} />
      </head>
      <body className={`${anton.variable} ${archivo.variable} font-sans antialiased`}>
        {process.env.NODE_ENV === "development" ? (
          <Script id="dev-runtime-guard" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: devRuntimeGuardScript }} />
        ) : null}
        {children}
        <Analytics />
      </body>
    </html>
  )
}
