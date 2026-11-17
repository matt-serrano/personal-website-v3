"use client"

import { useRef, useState, type KeyboardEvent } from "react"
import { ArrowUpRight } from "lucide-react"
import { LineArrow } from "@/components/line-arrow"
import { experience, projects, type PanelItem } from "@/lib/content"
import { cn } from "@/lib/utils"

const GROUPS = [
  { id: "experience", label: "Experience", items: experience },
  { id: "projects", label: "Projects", items: projects },
] as const

// Every item in order, so the arrows walk from the last job straight into the first project
const FLAT = GROUPS.flatMap((g, gi) => g.items.map((item: PanelItem, i) => ({ item, gi, i })))
const pad = (n: number) => String(n).padStart(2, "0")
const titleHead = (t: string) => t.slice(0, t.lastIndexOf(" ") + 1)
const titleTail = (t: string) => t.slice(t.lastIndexOf(" ") + 1)

export function Panel() {
  const [index, setIndex] = useState(0)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const { item, gi, i } = FLAT[index]
  const group = GROUPS[gi]
  const total = group.items.length

  const step = (d: number) => setIndex((index + d + FLAT.length) % FLAT.length)
  const jumpTo = (g: number) => setIndex(FLAT.findIndex((f) => f.gi === g))

  const onTabKey = (e: KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return
    e.preventDefault()
    const g = (gi + (e.key === "ArrowRight" ? 1 : -1) + GROUPS.length) % GROUPS.length
    jumpTo(g)
    tabRefs.current[g]?.focus()
  }

  return (
    <section aria-label="Experience and projects" className="on-scene border-t border-white/40">
      <div role="tablist" aria-label="Show" className="flex" onKeyDown={onTabKey}>
        {GROUPS.map((g, n) => {
          const selected = n === gi
          return (
            <button
              key={g.id}
              ref={(el) => {
                tabRefs.current[n] = el
              }}
              id={`tab-${g.id}`}
              // Form-fill extensions stamp attributes like fdprocessedid onto buttons before hydration
              suppressHydrationWarning
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls="panel-item"
              tabIndex={selected ? 0 : -1}
              onClick={() => jumpTo(n)}
              className={cn(
                "type-label relative min-h-11 flex-1 text-center",
                "after:absolute after:inset-x-0 after:bottom-2 after:h-[2px] after:bg-white after:content-['']",
                selected ? "text-white" : "after:opacity-0 hover:text-white",
              )}
            >
              {g.label}
            </button>
          )
        })}
      </div>

      <div id="panel-item" role="tabpanel" aria-labelledby={`tab-${group.id}`} className="mt-3 min-h-[11.5rem]">
        <p aria-live="polite" aria-atomic="true" className="type-label text-white tabular-nums">
          <span aria-hidden="true">
            {pad(i + 1)} / {pad(total)}
          </span>
          <span className="sr-only">
            {group.label} {i + 1} of {total}: {item.title}
          </span>
        </p>
        <div className={cn("mt-2", item.logo && "flex items-center gap-(--space-8)")}>
          {/* Beside the title only, so the line below keeps the panel's full width; the company is named there, so the mark is decorative */}
          {item.logo ? <img src={item.logo} alt="" className="item-logo" /> : null}
          <h2 className="type-title min-w-0">
            {item.href ? (
              <a href={item.href} target="_blank" rel="noreferrer" className="underline-offset-[0.375rem] decoration-1 hover:underline">
                {titleHead(item.title)}
                {/* The last word and the icon stay together so the icon never wraps onto a line alone */}
                <span className="whitespace-nowrap">
                  {titleTail(item.title)}
                  <ArrowUpRight
                    strokeWidth={1.75}
                    aria-hidden="true"
                    focusable="false"
                    className="ml-1 inline-block size-5 align-[0.1em] opacity-80"
                  />
                </span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : (
              item.title
            )}
          </h2>
        </div>
        <p className="type-subtitle mt-2">
          {item.line}
          {item.date ? (
            <>
              {" "}
              <span className="text-white/60">|</span> <span className="whitespace-nowrap">{item.date}</span>
            </>
          ) : null}
        </p>
        <p className="type-subtitle mt-1.5">{item.description}</p>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {group.items.map((it, n) => (
            <span
              key={it.title}
              className={cn("h-[0.1875rem] bg-white motion-safe:transition-all", n === i ? "w-[1.125rem]" : "w-[0.375rem] opacity-60")}
            />
          ))}
        </div>
        <div className="-mr-2 flex">
          <button type="button" suppressHydrationWarning aria-label="Previous item" onClick={() => step(-1)} className="group grid h-11 w-11 place-items-center">
            <LineArrow direction="left" />
          </button>
          <button type="button" suppressHydrationWarning aria-label="Next item" onClick={() => step(1)} className="group grid h-11 w-11 place-items-center">
            <LineArrow />
          </button>
        </div>
      </div>
    </section>
  )
}
