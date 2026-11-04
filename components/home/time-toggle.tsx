import { LinkIcon } from "@/components/link-icon"
import type { Zone } from "@/lib/elnido/sky"

type Props = { zone: Zone; onZoneChange: (zone: Zone) => void }

/**
 * The small-screen stand-in for the location label's clock switch: one icon that moves the scene
 * between the viewer's time and El Nido time. It looks the same either way; the label says which.
 */
export function TimeToggle({ zone, onZoneChange }: Props) {
  const elnido = zone === "elnido"
  const label = elnido ? "Scene follows El Nido time. Switch to your time" : "Scene follows your time. Switch to El Nido time"

  return (
    <button
      // Form-fill extensions stamp attributes like fdprocessedid onto buttons before hydration
      suppressHydrationWarning
      type="button"
      aria-label={label}
      title={label}
      onClick={() => onZoneChange(elnido ? "local" : "elnido")}
      className="inline-flex min-h-11 min-w-11 items-center justify-center opacity-90 hover:opacity-100"
    >
      <LinkIcon name="clock" size={20} />
    </button>
  )
}
