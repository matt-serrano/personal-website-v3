import { ArrowUpRight } from "lucide-react"
import { experience, projects, type PanelItem } from "@/lib/content"

const GROUPS = [
  { id: "experience", label: "Experience", items: experience },
  { id: "projects", label: "Projects", items: projects },
] as const

const titleHead = (t: string) => t.slice(0, t.lastIndexOf(" ") + 1)
const titleTail = (t: string) => t.slice(t.lastIndexOf(" ") + 1)

/**
 * The small-screen stand-in for the panel: every item at once, left-aligned in the centered column.
 * Spacing comes from the scale: 48px between sections, 16px under a label, 24px between items, 4px under a title.
 */
export function StackedList() {
  return (
    <div className="on-scene flex flex-col gap-(--space-48) text-left">
      {GROUPS.map((g) => (
        <section key={g.id} aria-labelledby={`list-${g.id}`}>
          <h2 id={`list-${g.id}`} className="type-label">
            {g.label}
          </h2>
          <ul className="mt-(--space-16) flex flex-col gap-(--space-24)">
            {g.items.map((item) => (
              <li key={item.title}>
                <Item item={item} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

/** Projects link out and carry ↗; experience entries are plain text so they never look tappable. */
function Item({ item }: { item: PanelItem }) {
  return (
    <>
      <h3 className="type-title">
        {item.href ? (
          <a
            href={item.href}
            target="_blank"
            rel="noreferrer"
            // The ::after pads the hit area to 44px tall without moving anything
            className="relative inline-block underline-offset-4 decoration-1 after:absolute after:-inset-x-1 after:-inset-y-[13px] after:content-[''] hover:underline"
          >
            {titleHead(item.title)}
            {/* The last word and the arrow stay together, so a wrapped title keeps its arrow beside it */}
            <span className="whitespace-nowrap">
              {titleTail(item.title)}
              <ArrowUpRight
                width={16}
                height={16}
                strokeWidth={2}
                aria-hidden="true"
                focusable="false"
                className="ml-1.5 inline-block align-[-0.1em] opacity-80"
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
