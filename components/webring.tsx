"use client"

import { useSyncExternalStore } from "react"
import { LineArrow } from "@/components/line-arrow"
import { webring } from "@/lib/content"

const noSubscribe = () => () => {}
const getHost = () => window.location.hostname.replace(/^www\./, "") || webring.fallbackHost
const getServerHost = () => webring.fallbackHost

/** OTU webring: previous site, ring home, next site. */
export function Webring() {
  const host = useSyncExternalStore(noSubscribe, getHost, getServerHost)

  return (
    <nav id="otu-webring" aria-label="OTU webring" className="on-scene flex items-center">
      <a id="webring-prev" href={webring.prev(host)} aria-label="Previous site in the OTU webring" className="group grid h-11 w-11 place-items-center">
        <LineArrow direction="left" />
      </a>
      <a href={webring.home} target="_blank" rel="noopener noreferrer" aria-label="OTU Webring (opens in a new tab)" className="grid h-11 place-items-center px-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={webring.logo} alt="" className="h-5 w-auto opacity-85 drop-shadow-[0_1px_6px_rgba(0,0,0,0.45)] hover:opacity-100" />
      </a>
      <a id="webring-next" href={webring.next(host)} aria-label="Next site in the OTU webring" className="group grid h-11 w-11 place-items-center">
        <LineArrow />
      </a>
    </nav>
  )
}
