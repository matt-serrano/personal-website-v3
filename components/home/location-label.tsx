"use client"

import { useState } from "react"
import type { SceneStatus } from "@/components/living-scene"
import { LineArrow } from "@/components/line-arrow"
import { LinkIcon } from "@/components/link-icon"
import { locations } from "@/lib/content"
import type { Zone } from "@/lib/elnido/sky"

const MODE_TEXT = { live: "Your time", elnido: "El Nido time", preview: "Preview", playing: "Playing" }

type Props = { status: SceneStatus | null; zone: Zone; onZoneChange: (zone: Zone) => void }

export function LocationLabel({ status, zone, onZoneChange }: Props) {
  const [index, setIndex] = useState(0)
  const place = locations[index]

  return (
    <div className="on-scene">
      <div className="flex items-center gap-2">
        <LinkIcon name="pin" />
        <p className="text-[15px] font-semibold">{place.name}</p>
        {locations.length > 1 ? (
          <button
            // Form-fill extensions stamp attributes like fdprocessedid onto buttons before hydration
            suppressHydrationWarning
            type="button"
            aria-label={`Next location: ${locations[(index + 1) % locations.length].name}`}
            onClick={() => setIndex((index + 1) % locations.length)}
            className="group -my-3 ml-1 grid h-11 w-11 place-items-center"
          >
            <LineArrow />
          </button>
        ) : null}
      </div>
      <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.12em] text-white/80 tabular-nums">
        {status ? (
          <>
            {status.label} ·{" "}
            {status.mode === "live" || status.mode === "elnido" ? (
              <ZoneSwitch zone={zone} onZoneChange={onZoneChange} />
            ) : (
              MODE_TEXT[status.mode]
            )}{" "}
            · {status.clock}
          </>
        ) : " "}
      </p>
    </div>
  )
}

/** Whose clock the scene follows; hovering shows what a click switches to. */
function ZoneSwitch({ zone, onZoneChange }: Omit<Props, "status">) {
  const current = MODE_TEXT[zone === "elnido" ? "elnido" : "live"]
  const next: Zone = zone === "local" ? "elnido" : "local"
  const hint = next === "elnido" ? "Switch to El Nido time" : "Switch to your time"

  return (
    <button
      suppressHydrationWarning
      type="button"
      onClick={() => onZoneChange(next)}
      aria-label={`${current}. ${hint}`}
      className="group relative -my-3 inline-block py-3 uppercase tracking-[0.12em] outline-none"
    >
      <span className="underline decoration-white/40 decoration-dotted underline-offset-4 transition-colors group-hover:text-white group-hover:decoration-white group-hover:decoration-solid group-focus-visible:text-white group-focus-visible:decoration-white group-focus-visible:decoration-solid">
        {current}
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-full left-0 -mb-1 translate-y-1 whitespace-nowrap rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold normal-case tracking-normal text-white opacity-0 backdrop-blur-sm transition duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
      >
        {hint}
      </span>
    </button>
  )
}
