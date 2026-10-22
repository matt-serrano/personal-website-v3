import type { Metadata } from "next"
import { LineArrow } from "@/components/line-arrow"
import { QuietPage } from "@/components/quiet-page"
import { about } from "@/lib/content"

export const metadata: Metadata = { title: "About · Matthew Serrano" }

export default function AboutPage() {
  return (
    <QuietPage current="/about">
      <div className="grid grid-cols-1 gap-12 pt-[clamp(40px,8vh,96px)] md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:gap-20">
        <div>
          <h1 className="display text-[clamp(56px,8vw,120px)] leading-[0.9]">{about.heading}</h1>
          <div className="mt-8 max-w-[52ch] space-y-4 text-[17px] font-medium leading-relaxed">
            {about.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <a
            href={about.highlight.href}
            target="_blank"
            rel="noreferrer"
            className="group mt-8 inline-flex min-h-11 items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.1em]"
          >
            {about.highlight.label}
            <span className="sr-only">(opens in a new tab)</span>
            <LineArrow />
          </a>
        </div>

        <dl className="self-center">
          {about.stats.map((s) => (
            <div key={s.label} className="grid grid-cols-[minmax(0,7.5rem)_1fr] items-center gap-6 border-t border-white/40 py-5 first:border-t-0 md:first:border-t">
              <dt className="sr-only">{s.label}</dt>
              <dd className="display text-[clamp(40px,5vw,64px)] leading-none">{s.value}</dd>
              <dd>
                <span className="block text-[17px] font-semibold">{s.label}</span>
                <span className="mt-1 block text-[13px] font-medium uppercase tracking-[0.08em] text-white/80">{s.sublabel}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </QuietPage>
  )
}
