"use client"

import { useState } from "react"
import type { SceneStatus } from "@/components/living-scene"
import { LineArrow } from "@/components/line-arrow"
import { LinkIcon } from "@/components/link-icon"
import { locations } from "@/lib/content"

const MODE_TEXT = { live: "Your time", preview: "Preview", playing: "Playing" }

export function LocationLabel({ status }: { status: SceneStatus | null }) {
  const [index, setIndex] = useState(0)
  const place = locations[index]

  return (
    <div className="on-scene">
      <div className="flex items-center gap-2">
        <LinkIcon name="pin" />
        <p className="text-[15px] font-semibold">{place.name}</p>
        {locations.length > 1 ? (
          <button
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
        {status ? `${status.label} · ${MODE_TEXT[status.mode]} · ${status.clock}` : " "}
      </p>
    </div>
  )
}
