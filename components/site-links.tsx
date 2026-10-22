import Link from "next/link"
import { cn } from "@/lib/utils"

const PAGES = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

/** Quiet text links between pages; the current page gets the 2px underline. */
export function SiteLinks({ current, className }: { current?: string; className?: string }) {
  return (
    <nav aria-label="Pages" className={cn("on-scene flex gap-5", className)}>
      {PAGES.filter((p) => current || p.href !== "/").map((p) => {
        const active = p.href === current
        return (
          <Link
            key={p.href}
            href={p.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative inline-flex min-h-11 items-center text-[12px] font-semibold uppercase tracking-[0.14em]",
              "after:absolute after:inset-x-0 after:bottom-2 after:h-[2px] after:bg-white after:content-['']",
              active ? "text-white" : "text-white/72 after:opacity-0 hover:text-white",
            )}
          >
            {p.label}
          </Link>
        )
      })}
    </nav>
  )
}
