import type { CSSProperties } from "react"
import { ArrowUpRight } from "lucide-react"
import { experience, projects, type PanelItem } from "@/lib/content"

const GROUPS = [
  { id: "experience", label: "Experience", items: experience },
  { id: "projects", label: "Projects", items: projects },
] as const

// Entrance order: each section label, then its items, top to bottom (see .enter in globals.css)
const ORDER = GROUPS.map((_, gi) => GROUPS.slice(0, gi).reduce((n, g) => n + 1 + g.items.length, 0))
/** The number of list rows; the icon row enters right after them. */
export const LIST_ROWS = GROUPS.reduce((n, g) => n + 1 + g.items.length, 0)
const enterAt = (i: number) => ({ "--i": i }) as CSSProperties

const titleHead =(t: string) => t.slice(0, t.lastIndexOf(" ") + 1)
const titleTail = (t: string) => t.slice(t.lastIndexOf(" ") + 1)

/**
 * The small-screen stand-in for the panel: every item at once, left-aligned in the centered column.
 * Spacing comes from the scale: 48px between sections, 16px under a label, 24px between items, 4px under a title.
 */
export function StackedList() {
  return (
    <div className="on-scene flex flex-col gap-(--space-48) text-left">
      {GROUPS.map((g, gi) => (
        <section key={g.id} aria-labelledby={`list-${g.id}`}>
          <h2 id={`list-${g.id}`} className="type-label enter" style={enterAt(ORDER[gi])}>
            {g.label}
          </h2>
          <ul className="mt-(--space-16) flex flex-col gap-(--space-24)">
            {g.items.map((item, i) => (
              <li key={item.title} className="enter" style={enterAt(ORDER[gi] + 1 + i)}>
                <Item item={item} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

/** An item with a logo: the mark on the left, centred on the title and line. */
function Item({ item }: { item: PanelItem }) {
  if (!item.logo) return <ItemText item={item} />
  return (
    <div className="flex items-center gap-(--space-12)">
      {/* The company is named in the line beside it, so the mark is decorative */}
      <img src={item.logo} alt="" className="item-logo" />
      <div className="min-w-0">
        <ItemText item={item} />
      </div>
    </div>
  )
}

/** Projects link out and carry ↗; experience entries are plain text so they never look tappable. */
function ItemText({ item }: { item: PanelItem }) {
  return (
    <>
      <h3 className="type-title">
        {item.href ? (
          <a
            href={item.href}
            target="_blank"
            rel="noreferrer"
            // The ::after pads the hit area to 44px tall without moving anything
            className="relative inline-block underline-offset-4 decoration-1 after:absolute after:-inset-x-1 after:-inset-y-[0.8125rem] after:content-[''] hover:underline"
          >
            {titleHead(item.title)}
            {/* The last word and the arrow stay together, so a wrapped title keeps its arrow beside it */}
            <span className="whitespace-nowrap">
              {titleTail(item.title)}
              <ArrowUpRight
                strokeWidth={2}
                aria-hidden="true"
                focusable="false"
                className="ml-1.5 inline-block size-4 align-[-0.1em] opacity-80"
              />
            </span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : (
          item.title
        )}
      </h3>
      <p className="type-subtitle mt-(--space-4)">
        {item.line}
        {item.date ? <span className="whitespace-nowrap"> · {item.date}</span> : null}
      </p>
    </>
  )
}
