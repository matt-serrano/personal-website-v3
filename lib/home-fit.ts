/**
 * Measured fit for the home page. Every size on the page is in rem, so the root font size scales the whole
 * layout as one. The fit renders the page at the 16px base, measures its natural height (top padding through
 * the bottom padding under the icon row) and, if that is taller than what the visitor can actually see,
 * shrinks the root by exactly that ratio: never below 10px, never above the base.
 *
 * installHomeFit runs twice over: as an inline <head> script (HOME_FIT_SCRIPT) so the first fit happens
 * before the first paint, and from the home page's layout effect after client-side navigation. It is
 * self-contained (no imports, plain syntax) because the script is its own source text.
 */
export function installHomeFit() {
  const w = window as Window & { __homeFit?: () => void }
  if (w.__homeFit) {
    w.__homeFit()
    return
  }
  const BASE = 16
  const FLOOR = 10
  const root = document.documentElement

  // The height the visitor can see: visualViewport takes off browser bars and in-app browser chrome
  // (Instagram and the like), and its scale cancels pinch zoom so zooming never refits
  function visibleHeight() {
    const v = window.visualViewport
    return v ? v.height * v.scale : window.innerHeight
  }

  function fit() {
    try {
      const home = document.querySelector<HTMLElement>(".home")
      if (!home) {
        root.style.removeProperty("font-size")
        root.style.removeProperty("--fit-h")
        return
      }
      const avail = visibleHeight()
      // The container is exactly this tall, so the icon row can never sit below what the visitor sees
      root.style.setProperty("--fit-h", avail + "px")
      const naturalAt = function (size: number) {
        root.style.fontSize = size + "px"
        home.classList.add("home-measure")
        const h = home.getBoundingClientRect().height
        home.classList.remove("home-measure")
        return h
      }
      const atBase = naturalAt(BASE)
      let size = BASE
      if (atBase > avail) {
        // Start from the proportional size, then narrow in on the largest size that fits: lines that wrap at
        // the base may not wrap smaller, and safe-area insets and the 1px rule don't scale at all
        let lo = FLOOR, hi = BASE
        let guess = Math.max(FLOOR, BASE * (avail / atBase))
        for (let i = 0; i < 10 && hi - lo > 0.05; i++) {
          if (naturalAt(guess) <= avail) lo = guess
          else hi = guess
          guess = (lo + hi) / 2
        }
        size = Math.floor(lo * 100) / 100
      }
      root.style.fontSize = size + "px"
    } finally {
      // The page is hidden until its first fit; a failed fit still shows it, just unscaled
      root.classList.remove("fit-pending")
    }
  }

  let timer = 0
  function refitSoon() {
    clearTimeout(timer)
    timer = window.setTimeout(fit, 100)
  }
  window.addEventListener("resize", refitSoon)
  window.addEventListener("orientationchange", refitSoon)
  if (window.visualViewport) window.visualViewport.addEventListener("resize", refitSoon)
  window.addEventListener("load", fit)
  // Archivo and Anton change line heights and wrapping as they arrive
  if (document.fonts) document.fonts.ready.then(fit)
  w.__homeFit = fit

  if (document.querySelector(".home")) {
    fit()
    return
  }
  // From <head>: hide the page, then fit in the first frame where the whole page has been parsed (the
  // webring is its last element). Frame callbacks run before paint, so the unscaled page never shows.
  root.classList.add("fit-pending")
  const start = Date.now()
  function whenParsed() {
    if (document.querySelector(".home-ring") || document.readyState !== "loading") fit()
    else if (Date.now() - start < 3000) requestAnimationFrame(whenParsed)
    else fit()
  }
  requestAnimationFrame(whenParsed)
}

/** The installer as an inline script for <head>. */
export const HOME_FIT_SCRIPT = `(${installHomeFit.toString()})();`

/** Hands the root back to the stylesheet, for pages other than home. */
export function resetHomeFit() {
  const root = document.documentElement
  root.style.removeProperty("font-size")
  root.style.removeProperty("--fit-h")
  root.classList.remove("fit-pending")
}
