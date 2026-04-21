"use client"

import { Shader, ChromaFlow, Swirl } from "shaders/react"
import { CustomCursor } from "@/components/custom-cursor"
import { GrainOverlay } from "@/components/grain-overlay"
import { WorkSection } from "@/components/sections/work-section"
import { ServicesSection } from "@/components/sections/services-section"
import { AboutSection } from "@/components/sections/about-section"
import { ContactSection } from "@/components/sections/contact-section"
import { MagneticButton } from "@/components/magnetic-button"
import { useRef, useEffect, useState } from "react"

const TOTAL_SECTIONS = 5
const PAGED_VIEWPORT_QUERY = "(min-width: 768px)"
const PAGED_SCROLL_LOCK_MS = 650

export default function Home() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [currentSection, setCurrentSection] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [webringHostname, setWebringHostname] = useState("otu-ring.com")
  const touchStartY = useRef(0)
  const touchStartX = useRef(0)
  const shaderContainerRef = useRef<HTMLDivElement>(null)
  const scrollThrottleRef = useRef<number | null>(null)
  const currentSectionRef = useRef(0)
  const isPagedViewportRef = useRef(false)
  const isTransitioningRef = useRef(false)
  const transitionTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    currentSectionRef.current = currentSection
  }, [currentSection])

  useEffect(() => {
    let hostname = window.location.hostname

    if (hostname.startsWith("www.")) {
      hostname = hostname.substring(4)
    }

    setWebringHostname(hostname || "otu-ring.com")
  }, [])

  useEffect(() => {
    const checkShaderReady = () => {
      if (shaderContainerRef.current) {
        const canvas = shaderContainerRef.current.querySelector("canvas")
        if (canvas && canvas.width > 0 && canvas.height > 0) {
          setIsLoaded(true)
          return true
        }
      }
      return false
    }

    if (checkShaderReady()) return

    const intervalId = setInterval(() => {
      if (checkShaderReady()) {
        clearInterval(intervalId)
      }
    }, 100)

    const fallbackTimer = setTimeout(() => {
      setIsLoaded(true)
    }, 1500)

    return () => {
      clearInterval(intervalId)
      clearTimeout(fallbackTimer)
    }
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia(PAGED_VIEWPORT_QUERY)

    const updateViewportMode = () => {
      isPagedViewportRef.current = mediaQuery.matches
    }

    updateViewportMode()
    mediaQuery.addEventListener("change", updateViewportMode)

    return () => {
      mediaQuery.removeEventListener("change", updateViewportMode)
    }
  }, [])

  const clearTransitionLock = () => {
    if (transitionTimeoutRef.current) {
      window.clearTimeout(transitionTimeoutRef.current)
      transitionTimeoutRef.current = null
    }
    isTransitioningRef.current = false
  }

  const lockSectionPaging = () => {
    clearTransitionLock()
    isTransitioningRef.current = true
    transitionTimeoutRef.current = window.setTimeout(() => {
      isTransitioningRef.current = false
      transitionTimeoutRef.current = null
    }, PAGED_SCROLL_LOCK_MS)
  }

  const scrollToSection = (index: number, behavior: ScrollBehavior = "smooth") => {
    const container = scrollContainerRef.current
    if (!container) return

    const clampedIndex = Math.max(0, Math.min(index, TOTAL_SECTIONS - 1))
    const sectionWidth = container.offsetWidth

    if (isPagedViewportRef.current && behavior === "smooth" && !isTransitioningRef.current) {
      lockSectionPaging()
    }

    container.scrollTo({
      left: sectionWidth * clampedIndex,
      behavior,
    })
    setCurrentSection(clampedIndex)
    currentSectionRef.current = clampedIndex
  }

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY
      touchStartX.current = e.touches[0].clientX
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (isTransitioningRef.current) return

      const deltaY = Math.abs(e.touches[0].clientY - touchStartY.current)
      const deltaX = Math.abs(e.touches[0].clientX - touchStartX.current)

      if (deltaX > deltaY && deltaX > 10) {
        e.preventDefault()
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (isTransitioningRef.current) return

      const touchEndY = e.changedTouches[0].clientY
      const touchEndX = e.changedTouches[0].clientX
      const deltaY = touchStartY.current - touchEndY
      const deltaX = touchStartX.current - touchEndX

      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        const nextSection = deltaX > 0 ? currentSectionRef.current + 1 : currentSectionRef.current - 1

        if (nextSection >= 0 && nextSection < TOTAL_SECTIONS) {
          lockSectionPaging()
          scrollToSection(nextSection)
        }
      }
    }

    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("touchstart", handleTouchStart, { passive: true })
      container.addEventListener("touchmove", handleTouchMove, { passive: false })
      container.addEventListener("touchend", handleTouchEnd, { passive: true })
    }

    return () => {
      if (container) {
        container.removeEventListener("touchstart", handleTouchStart)
        container.removeEventListener("touchmove", handleTouchMove)
        container.removeEventListener("touchend", handleTouchEnd)
      }
    }
  }, [])

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!isPagedViewportRef.current) return

      const dominantDelta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX
      if (Math.abs(dominantDelta) < 12) return

      e.preventDefault()

      if (isTransitioningRef.current) return

      const direction = dominantDelta > 0 ? 1 : -1
      const nextSection = currentSectionRef.current + direction

      if (nextSection < 0 || nextSection >= TOTAL_SECTIONS) return

      lockSectionPaging()
      scrollToSection(nextSection)
    }

    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false })
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel)
      }
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (scrollThrottleRef.current) return

      scrollThrottleRef.current = requestAnimationFrame(() => {
        if (!scrollContainerRef.current) {
          scrollThrottleRef.current = null
          return
        }

        const sectionWidth = scrollContainerRef.current.offsetWidth
        const scrollLeft = scrollContainerRef.current.scrollLeft
        const newSection = Math.round(scrollLeft / sectionWidth)

        if (newSection !== currentSectionRef.current && newSection >= 0 && newSection < TOTAL_SECTIONS) {
          setCurrentSection(newSection)
          currentSectionRef.current = newSection
        }

        if (isPagedViewportRef.current) {
          const targetLeft = sectionWidth * newSection
          if (Math.abs(scrollLeft - targetLeft) > 2 && !isTransitioningRef.current) {
            scrollToSection(newSection, "auto")
          }
        }

        scrollThrottleRef.current = null
      })
    }

    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true })
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll)
      }
      if (scrollThrottleRef.current) {
        cancelAnimationFrame(scrollThrottleRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const handleResize = () => {
      scrollToSection(currentSectionRef.current, "auto")
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      clearTransitionLock()
    }
  }, [])

  const webringPrevHref = `https://otu-ring.com/prev.html?from=${encodeURIComponent(webringHostname)}`
  const webringNextHref = `https://otu-ring.com/next.html?from=${encodeURIComponent(webringHostname)}`

  return (
    <main className="relative h-screen w-full overflow-hidden bg-background">
      <CustomCursor />
      <GrainOverlay />

      <div
        ref={shaderContainerRef}
        className={`fixed inset-0 z-0 transition-opacity duration-700 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        style={{ contain: "strict" }}
      >
        <Shader className="h-full w-full" hideNotice>
          <Swirl
            colorA="#00a6fb"
            colorB="#1b1028"
            speed={0.8}
            detail={0.8}
            blend={50}
            coarseX={40}
            coarseY={40}
            mediumX={40}
            mediumY={40}
            fineX={40}
            fineY={40}
          />
          <ChromaFlow
            baseColor="#00a6fb"
            upColor="#0353a4"
            downColor="#0353a4"
            leftColor="#1b1028"
            rightColor="#1b1028"
            intensity={0.9}
            radius={1.8}
            momentum={25}
            maskType="alpha"
            opacity={0.97}
          />
        </Shader>
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <nav
        className={`se-nav fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-6 transition-opacity duration-700 md:px-12 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          id="otu-webring"
          className="flex items-center justify-center gap-3 md:gap-4"
        >
          <a
            id="webring-prev"
            href={webringPrevHref}
            aria-label="Previous site in the OTU webring"
            title="Previous site"
            className="grid h-9 w-9 place-items-center rounded-md text-base text-zinc-500 transition-all duration-200 hover:bg-white/10 hover:text-zinc-50"
          >
            ←
          </a>
          <a
            href="https://otu-ring.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="OTU Webring"
            className="flex items-center"
          >
            <img
              src="https://otu-ring.com/assets/ontariotech.svg"
              alt="OTU Webring"
              className="h-5 w-auto opacity-70 transition-opacity duration-200 hover:opacity-100"
            />
          </a>
          <a
            id="webring-next"
            href={webringNextHref}
            aria-label="Next site in the OTU webring"
            title="Next site"
            className="grid h-9 w-9 place-items-center rounded-md text-base text-zinc-500 transition-all duration-200 hover:bg-white/10 hover:text-zinc-50"
          >
            →
          </a>
        </div>

        <div className="hidden items-center gap-5 lg:flex xl:gap-8">
          {["Home", "Experience", "Projects", "About Me", "Contact"].map((item, index) => (
            <button
              suppressHydrationWarning
              key={item}
              onClick={() => scrollToSection(index)}
              className={`group relative whitespace-nowrap font-sans text-sm font-medium transition-colors ${
                currentSection === index ? "text-foreground" : "text-foreground/80 hover:text-foreground"
              }`}
            >
              {item}
              <span
                className={`absolute -bottom-1 left-0 h-px bg-foreground transition-all duration-300 ${
                  currentSection === index ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </button>
          ))}
        </div>

        <MagneticButton variant="secondary" onClick={() => scrollToSection(4)}>
          Connect With Me!
        </MagneticButton>
      </nav>

      <div
        ref={scrollContainerRef}
        data-scroll-container
        className={`relative z-10 flex h-screen overflow-x-hidden overflow-y-hidden transition-opacity duration-700 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", touchAction: "pan-y pinch-zoom" }}
      >
        {/* Hero Section */}
        <section className="se-hero-section flex min-h-screen w-screen shrink-0 flex-col justify-end px-6 pb-16 pt-24 md:px-12 md:pb-24">
          <div className="max-w-3xl">
            <div className="mb-4 inline-block animate-in fade-in slide-in-from-bottom-4 rounded-full border border-foreground/20 bg-foreground/15 px-4 py-1.5 backdrop-blur-md duration-700">
              <p className="font-mono text-xs text-foreground/90">Computer Science Co-op Student @ Ontario Tech University</p>
            </div>
            <h1 className="mb-6 animate-in fade-in slide-in-from-bottom-8 font-sans text-6xl font-light leading-[1.1] tracking-tight text-foreground duration-1000 md:text-7xl lg:text-8xl">
              <span className="text-balance">
                Matthew 
                <br/>
                Serrano
              </span>
            </h1>
            <p className="mb-8 max-w-xl animate-in fade-in slide-in-from-bottom-4 text-lg leading-relaxed text-foreground/90 duration-1000 delay-200 md:text-xl">
              <span className="text-pretty">
                Hello! My name is Matthew Serrano. I am a Computer Science student at Ontario Tech University focused on innovation, technology and design.
              </span>
            </p>
            <div className="flex animate-in items-center gap-4 fade-in slide-in-from-bottom-4 duration-1000 delay-300">
              <span className="lg:hidden">
                <p className="typing-prompt font-mono text-base leading-none text-foreground/85" style={{ "--typing-width": "27ch" } as React.CSSProperties}>
                  <span className="typing-prompt-text">Swipe left/right to explore</span>
                </p>
              </span>
              <span className="hidden lg:inline-flex">
                <p className="typing-prompt font-mono text-lg leading-none text-foreground/85" style={{ "--typing-width": "25ch" } as React.CSSProperties}>
                  <span className="typing-prompt-text">Scroll up/down to explore</span>
                </p>
              </span>
              <div className="flex h-9 w-16 items-center justify-center rounded-full border border-foreground/20 bg-foreground/15 font-mono text-base text-foreground/85 backdrop-blur-md md:h-10 md:w-20 md:text-lg">
                -&gt;
              </div>
            </div>
          </div>
        </section>

        <WorkSection />
        <ServicesSection />
        <AboutSection scrollToSection={scrollToSection} />
        <ContactSection />
      </div>

      <style jsx global>{`
        div::-webkit-scrollbar {
          display: none;
        }

        .typing-prompt {
          display: flex;
          height: 2.5rem;
          align-items: center;
          width: var(--typing-width, 17ch);
          max-width: var(--typing-width, 17ch);
          line-height: 1;
          white-space: nowrap;
        }

        .typing-prompt-text {
          display: inline-block;
          transform: translateY(1px);
          width: 0;
          overflow: hidden;
          white-space: nowrap;
          border-right: 1px solid currentColor;
          animation:
            typing-prompt 20s steps(17, end) 0.4s infinite,
            typing-caret 0.8s step-end infinite;
        }

        @keyframes typing-prompt {
          0%,
          10% {
            width: 0;
          }
          22%,
          92% {
            width: var(--typing-width, 17ch);
          }
          92.01%,
          100% {
            width: 0;
          }
        }

        @keyframes typing-caret {
          0%,
          100% {
            border-color: transparent;
          }
          50% {
            border-color: currentColor;
          }
        }
      `}</style>
    </main>
  )
}
