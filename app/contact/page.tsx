import type { Metadata } from "next"
import { LineArrow } from "@/components/line-arrow"
import { LinkIcon } from "@/components/link-icon"
import { QuietPage } from "@/components/quiet-page"
import { contact, links } from "@/lib/content"

export const metadata: Metadata = { title: "Contact · Matthew Serrano" }

export default function ContactPage() {
  return (
    <QuietPage current="/contact">
      <div className="grid grid-cols-1 gap-12 pt-[clamp(40px,8vh,96px)] md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:gap-20">
        <div>
          <h1 className="display text-[clamp(56px,8vw,120px)] leading-[0.9]">{contact.heading}</h1>
          <p className="mt-4 text-[13px] font-semibold uppercase tracking-[0.14em] text-white/80">{contact.sub}</p>
          <p className="mt-10 flex items-center gap-2 text-[17px] font-semibold">
            <LinkIcon name="pin" />
            {contact.location}
          </p>
        </div>

        <ul className="self-center">
          {links.map((link) => {
            const external = link.href.startsWith("http")
            return (
              <li key={link.label} className="border-t border-white/40 first:border-t-0 md:first:border-t">
                <a
                  href={link.href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noreferrer" : undefined}
                  className="group flex min-h-16 items-center gap-4 py-3"
                >
                  <LinkIcon name={link.icon} size={18} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-white/80">{link.label}</span>
                    <span className="block truncate text-[16px] font-medium">{link.text}</span>
                  </span>
                  {external ? <span className="sr-only">(opens in a new tab)</span> : null}
                  <LineArrow />
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </QuietPage>
  )
}
