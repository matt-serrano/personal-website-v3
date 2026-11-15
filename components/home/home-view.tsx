"use client"

import { useLayoutEffect, useState } from "react"
import { LivingScene, type SceneStatus } from "@/components/living-scene"
import { Hero, HeroLinks } from "@/components/home/hero"
import { LocationLabel } from "@/components/home/location-label"
import { Panel } from "@/components/home/panel"
import { StackedList } from "@/components/home/stacked-list"
import { TimeToggle } from "@/components/home/time-toggle"
import { Webring } from "@/components/webring"
import type { Zone } from "@/lib/elnido/sky"
import { fitHome, resetHomeFit } from "@/lib/home-fit"

/**
 * One full-screen view: the living scene behind, everything else laid straight on it.
 * Grid areas keep the name, panel and location from ever overlapping; a short screen scrolls instead.
 * Below 1024px (phones, iPad portrait) it becomes one centered column: name, the full list, then icon links
 * with a clock that takes over the location label's job of switching the scene to El Nido time.
 */
export function HomeView() {
  const [status, setStatus] = useState<SceneStatus | null>(null)
  const [zone, setZone] = useState<Zone>("local")

  // Scale the page to the visible height before it paints, and again whenever the window changes size
  useLayoutEffect(() => {
    fitHome()
    const refit = () => fitHome()
    window.addEventListener("resize", refit)
    return () => {
      window.removeEventListener("resize", refit)
      resetHomeFit()
    }
  }, [])

  return (
    <>
      <LivingScene onStatus={setStatus} zone={zone} />
      <main className="home relative z-10">
        <div className="home-hero">
          <Hero />
        </div>
        <div className="home-panel">
          <Panel />
        </div>
        <div className="home-list">
          <StackedList />
        </div>
        <div className="home-links on-scene">
          <HeroLinks iconOnly className="flex-nowrap">
            <li>
              <TimeToggle zone={zone} onZoneChange={setZone} />
            </li>
          </HeroLinks>
        </div>
        <div className="home-place">
          <LocationLabel status={status} zone={zone} onZoneChange={setZone} />
        </div>
        <div className="home-ring flex flex-wrap items-center gap-x-6">
          <Webring />
        </div>
      </main>
    </>
  )
}
