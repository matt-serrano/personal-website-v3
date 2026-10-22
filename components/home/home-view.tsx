"use client"

import { useState } from "react"
import { LivingScene, type SceneStatus } from "@/components/living-scene"
import { Hero } from "@/components/home/hero"
import { Panel } from "@/components/home/panel"

/**
 * One full-screen view: the living scene behind, everything else laid straight on it.
 * Grid areas keep the name, panel and location from ever overlapping; a short screen scrolls instead.
 */
export function HomeView() {
  const [, setStatus] = useState<SceneStatus | null>(null)

  return (
    <>
      <LivingScene onStatus={setStatus} />
      <main className="home relative z-10">
        <div className="home-hero">
          <Hero />
        </div>
        <div className="home-panel">
          <Panel />
        </div>
      </main>
    </>
  )
}
