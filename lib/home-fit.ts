/**
 * Measured fit for the home page. Every size on the page is in rem, so the root font size scales the whole
 * layout as one. This renders the page at the 16px base, measures its natural height (top padding through
 * the bottom padding under the icon row) and, if that is taller than what the visitor can actually see,
 * shrinks the root by exactly that ratio: never below 10px, never above the base.
 */
const BASE = 16
const FLOOR = 10

/**
 * The height the visitor can see, in CSS px. visualViewport takes off browser bars and in-app browser
 * chrome (Instagram and the like); multiplying by its scale ignores pinch zoom, so zooming never refits.
 */
function visibleHeight() {
  const v = window.visualViewport
  return v ? v.height * v.scale : window.innerHeight
}

/** Fits the home page to the visible height; returns the root size used, or null when not on the home page. */
export function fitHome(): number | null {
  const home = document.querySelector<HTMLElement>(".home")
  const root = document.documentElement
  if (!home) {
    resetHomeFit()
    return null
  }
  const avail = visibleHeight()
  // The container is exactly this tall, so the icon row can never sit below what the visitor sees
  root.style.setProperty("--fit-h", avail + "px")

  let size = BASE
  // Safe-area insets, the 1px rule and line wrapping don't scale with the root, so correct once or twice more
  for (let i = 0; i < 4; i++) {
    root.style.fontSize = size + "px"
    home.classList.add("home-measure")
    const natural = home.getBoundingClientRect().height
    home.classList.remove("home-measure")
    if (natural <= avail) break
    const next = Math.max(FLOOR, Math.floor(size * (avail / natural) * 100) / 100)
    if (next >= size) break
    size = next
  }
  root.style.fontSize = size + "px"
  return size
}

/** Hands the root back to the stylesheet, for pages other than home. */
export function resetHomeFit() {
  const root = document.documentElement
  root.style.removeProperty("font-size")
  root.style.removeProperty("--fit-h")
}
