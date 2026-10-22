import { LinkIcon } from "@/components/link-icon"
import { links, person } from "@/lib/content"

export function Hero() {
  return (
    <header className="on-scene">
      <h1 className="display text-[clamp(64px,10vw,156px)] leading-[0.88]">
        {person.firstName}
        <br />
        {person.lastName}
      </h1>
      <p className="mt-4 max-w-[34ch] text-[clamp(16px,1.35vw,21px)] font-medium leading-snug">{person.tagline}</p>
      <ul className="mt-2 -ml-1 flex flex-wrap gap-x-5" aria-label="Links">
        {links.map((link) => {
          const external = link.href.startsWith("http")
          return (
            <li key={link.label}>
              <a
                href={link.href}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer" : undefined}
                aria-label={external ? `${link.label} (opens in a new tab)` : `${link.label}: ${link.text}`}
                className="inline-flex min-h-11 items-center gap-2 px-1 text-[13px] font-semibold uppercase tracking-[0.1em] underline-offset-[5px] hover:underline"
              >
                <LinkIcon name={link.icon} />
                {link.label}
              </a>
            </li>
          )
        })}
      </ul>
    </header>
  )
}
