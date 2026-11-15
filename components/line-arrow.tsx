import { cn } from "@/lib/utils"

type Props = { direction?: "left" | "right"; className?: string }

/** Thin line arrow with a sharp head, 30×10 at the 16px base. Nudges in its direction when a parent `.group` is hovered. */
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
        "line-arrow shrink-0 motion-safe:transition-transform motion-safe:duration-200",
        direction === "left" ? "-scale-x-100 group-hover:-translate-x-[0.3125rem]" : "group-hover:translate-x-[0.3125rem]",
        className,
      )}
    >
      <path d="M0 5H28.6M24 .9L28.6 5L24 9.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="butt" strokeLinejoin="miter" />
    </svg>
  )
}
