import Link from "next/link"
import type { ReactNode } from "react"
import { LineArrow } from "@/components/line-arrow"
import { SiteLinks } from "@/components/site-links"
import { person } from "@/lib/content"

/** Inner page shell: the matching still photo, darkened, with the home link and page tabs on top. */
export function QuietPage({ current, children }: { current: string; children: ReactNode }) {
  return (
    <>
      <div className="quiet-bg" aria-hidden="true" />
      <div className="quiet relative z-10">
        <header className="on-scene flex flex-wrap items-center justify-between gap-x-8 border-b border-white/40">
          <Link href="/" className="group inline-flex min-h-11 items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.14em]">
            <LineArrow direction="left" />
            {person.firstName} {person.lastName}
          </Link>
          <SiteLinks current={current} />
        </header>
        <main className="on-scene">{children}</main>
      </div>
    </>
  )
}
