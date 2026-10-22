import { Github, Linkedin, Mail, MapPin } from "lucide-react"
import type { IconName } from "@/lib/content"

const ICONS = { linkedin: Linkedin, github: Github, email: Mail, pin: MapPin }

/** Thin outline icon, 15px by default. */
export function LinkIcon({ name, size = 15 }: { name: IconName | "pin"; size?: number }) {
  const Icon = ICONS[name]
  return <Icon width={size} height={size} strokeWidth={1.5} aria-hidden="true" focusable="false" className="shrink-0" />
}
