"use client"

import { useReveal } from "@/hooks/use-reveal"
import { ExternalLink } from "lucide-react"

export function ServicesSection() {
  const { ref, isVisible } = useReveal(0.3)

  return (
    <section
      ref={ref}
      className="se-projects-section flex h-screen w-screen shrink-0 snap-start items-center px-6 pt-20 md:px-12 md:pt-0 lg:px-16"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div
          className={`mb-12 transition-all duration-700 md:mb-16 ${
            isVisible ? "translate-y-0 opacity-100" : "-translate-y-12 opacity-0"
          }`}
        >
          <h2 className="mb-2 font-sans text-5xl font-light tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Projects
          </h2>
          <p className="font-mono text-sm text-foreground/60 md:text-base">Some things I created</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 md:gap-x-16 md:gap-y-12 lg:gap-x-24">
          {[
            {
                title: "AI-Powered Finance Application",
                description: "Analyzing financial data with AI to deliver insights and forecasts. (HackHive 2026)",
                direction: "top",
                href: "https://youtu.be/3ftBPUnSn78",
              },
              {
                title: "Car Catalog Application",
                description: "Designing a full-stack platform for browsing and managing car listings.",
                direction: "right",
                href: "https://www.youtube.com/watch?v=AR-lZ5WeqPE",
              },
              {
                title: "Baseball Pitch Sign Detector",
                description: "Using computer vision to detect and interpret pitch signals in real time.",
                direction: "left",
                href: "https://www.linkedin.com/posts/matthew-serrano-13a11b312_computervision-machinelearning-python-activity-7385698204345876480-yUkw?utm_source=share&utm_medium=member_desktop&rcm=ACoAAAMCKH0B3YNGn-PtbICXRmstpv3is2iMdUw",
              },
              {
                title: "Hangman.io",
                description: "A real-time multiplayer Hangman game with dynamic scoring and interactive gameplay",
                direction: "bottom",
                href: "https://www.youtube.com/watch?v=xrJr8vSu1XE",
                hoverText: "Check out Hangman.io",
              },
                        ].map((service, i) => (
            <ServiceCard key={i} service={service} index={i} isVisible={isVisible} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ServiceCard({
  service,
  index,
  isVisible,
}: {
  service: { title: string; description: string; direction: string; href?: string; hoverText?: string }
  index: number
  isVisible: boolean
}) {
  const getRevealClass = () => {
    if (!isVisible) {
      switch (service.direction) {
        case "left":
          return "-translate-x-16 opacity-0"
        case "right":
          return "translate-x-16 opacity-0"
        case "top":
          return "-translate-y-16 opacity-0"
        case "bottom":
          return "translate-y-16 opacity-0"
        default:
          return "translate-y-12 opacity-0"
      }
    }
    return "translate-x-0 translate-y-0 opacity-100"
  }

  const projectNumber = String(index + 1).padStart(2, "0")
  const hoverText = service.hoverText ?? `Check out my ${service.title}`

  return (
    <div
      className={`group transition-all duration-700 ${getRevealClass()}`}
      style={{
        transitionDelay: `${index * 150}ms`,
      }}
    >
      <div className="mb-3 flex min-h-5 items-center gap-3">
        <div className="project-hover-line h-px w-8 bg-foreground/30 transition-all duration-300 group-hover:w-16 group-hover:bg-foreground/60" />
        <span className="font-mono text-xs text-foreground/60">{projectNumber}</span>
        {service.href ? (
          <a
            href={service.href}
            target="_blank"
            rel="noreferrer"
            aria-label={hoverText}
            className="project-hover-link translate-x-1 font-mono text-xs text-foreground/0 underline underline-offset-4 transition-all duration-300 group-hover:translate-x-0 group-hover:text-foreground/70 touch:no-underline"
          >
            <span className="touch:hidden">{hoverText}</span>
            <span className="hidden items-center touch:inline-flex" aria-hidden="true">
              <ExternalLink className="h-4 w-4" strokeWidth={1.8} />
            </span>
          </a>
        ) : (
          <span className="project-hover-link translate-x-1 font-mono text-xs text-foreground/0 transition-all duration-300 group-hover:translate-x-0 group-hover:text-foreground/70">
            <span className="underline underline-offset-4 touch:hidden">{hoverText}</span>
            <span className="hidden items-center touch:inline-flex" aria-hidden="true">
              <ExternalLink className="h-4 w-4" strokeWidth={1.8} />
            </span>
          </span>
        )}
      </div>
      <h3 className="mb-2 font-sans text-2xl font-light text-foreground md:text-3xl">{service.title}</h3>
      <p className="max-w-sm text-sm leading-relaxed text-foreground/80 md:text-base">{service.description}</p>
    </div>
  )
}
