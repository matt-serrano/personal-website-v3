import { Clock, Github, Linkedin, Mail, MapPin } from "lucide-react"
import type { IconName } from "@/lib/content"

const ICONS = { linkedin: Linkedin, github: Github, email: Mail, pin: MapPin, clock: Clock }

/** Thin outline icon, 15px by default; sized in rem so it scales with the root font size. */
export function LinkIcon({ name, size = 15 }: { name: IconName | "pin" | "clock"; size?: number }) {
  const Icon = ICONS[name]
  const rem = `${size / 16}rem`
  return <Icon style={{ width: rem, height: rem }} strokeWidth={1.5} aria-hidden="true" focusable="false" className="shrink-0" />
}
