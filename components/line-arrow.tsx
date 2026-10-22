import { cn } from "@/lib/utils"

type Props = { direction?: "left" | "right"; className?: string }

/** Thin 30×10 line arrow with a sharp head. Nudges 5px in its direction when a parent `.group` is hovered. */
export function LineArrow({ direction = "right", className }: Props) {
  return (
    <svg
      width="30"
      height="10"
      viewBox="0 0 30 10"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn(
        "shrink-0 motion-safe:transition-transform motion-safe:duration-200",
        direction === "left" ? "-scale-x-100 group-hover:-translate-x-[5px]" : "group-hover:translate-x-[5px]",
        className,
      )}
    >
      <path d="M0 5H28.6M24 .9L28.6 5L24 9.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="butt" strokeLinejoin="miter" />
    </svg>
  )
}
