import type { ReactNode } from "react"
import { LinkIcon } from "@/components/link-icon"
import { links, person } from "@/lib/content"
import { cn } from "@/lib/utils"

/**
 * Editorial masthead: the name, a hairline the same width, then a two-column caption.
 * Each name line rises out of its own clip, then the rule draws in and the caption fades up.
 */
export function Hero() {
  const { left, right } = person.caption
  return (
    <header className="on-scene">
      {/* Sized to the name, so the rule and caption match its width */}
      <div className="masthead">
        <h1 className="masthead-name display">
          <span className="masthead-line">
            <span>{person.firstName}</span>
          </span>{" "}
          <span className="masthead-line">
            <span>{person.lastName}</span>
          </span>
        </h1>
        <div aria-hidden="true" className="masthead-rule" />
        <div className="masthead-caption">
          <p>
            {left[0]}
            <br />
            {left[1]}
          </p>
          <p className="masthead-place text-right">
            {right[0]}
            <br />
            {right[1]}
          </p>
        </div>
      </div>
      {/* On small screens the links move below the stacked list instead */}
      <HeroLinks className="enter home-wide mt-4 -ml-1" />
    </header>
  )
}

type HeroLinksProps = { className?: string; iconOnly?: boolean; children?: ReactNode }

/** Social links; `iconOnly` drops the labels (screen readers still get them), `children` adds trailing items. */
export function HeroLinks({ className, iconOnly = false, children }: HeroLinksProps) {
  return (
    <ul className={cn("flex flex-wrap", iconOnly ? "gap-x-(--icon-gap)" : "gap-x-5", className)} aria-label="Links">
      {links.map((link) => {
        const external = link.href.startsWith("http")
        return (
          <li key={link.label}>
            <a
              href={link.href}
              target={external ? "_blank" : undefined}
              rel={external ? "noreferrer" : undefined}
              aria-label={external ? `${link.label} (opens in a new tab)` : `${link.label}: ${link.text}`}
              title={iconOnly ? link.label : undefined}
              className={cn(
                iconOnly
                  ? "icon-tap opacity-90 hover:opacity-100"
                  : "type-label inline-flex min-h-11 items-center gap-2 px-1 text-white underline-offset-[0.3125rem] hover:underline",
              )}
            >
              <LinkIcon name={link.icon} size={iconOnly ? 22 : 15} />
              {iconOnly ? null : link.label}
            </a>
          </li>
        )
      })}
      {children}
    </ul>
  )
}
