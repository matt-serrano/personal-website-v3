"use client"

import { useReveal } from "@/hooks/use-reveal"

export function WorkSection() {
  const { ref, isVisible } = useReveal(0.3)

  return (
    <section
      ref={ref}
      className="se-work-section flex h-screen w-screen shrink-0 snap-start items-start px-4 pt-24 md:items-center md:px-12 md:pt-0 lg:px-16"
    >
      <div className="mx-auto w-full max-w-7xl pt-2 md:pt-0">
        <div
          className={`mb-12 translate-y-8 transition-all duration-700 md:mb-16 md:translate-y-12 ${
            isVisible ? "translate-x-0 opacity-100" : "-translate-x-12 opacity-0"
          }`}
        >
          <h2 className="mb-2 font-sans text-5xl font-light tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Experience
          </h2>
          <p className="font-mono text-sm text-foreground/60 md:text-base">My Work Experience</p>
        </div>

        <div className="space-y-6 md:space-y-8">
          {[
            {
              number: "01",
              title: "IT Systems Analyst | Developer",
              category: "Ontario Public Service | Government of Ontario",
              year: "May 2026 - Present",
              direction: "left",
            },
            {
              number: "02",
              title: "Software Engineer",
              category: "Purchs | AI Wholesale Platform for CPG Brands & Retailers",
              year: "November 2025 - March 2026",
              direction: "right",
            },
            {
              number: "03",
              title: "Barista",
              category: "Chatime",
              year: "June 2024 - April 2026",
              direction: "left",
            },
          ].map((project, i) => (
            <ProjectCard key={i} project={project} index={i} isVisible={isVisible} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ProjectCard({
  project,
  index,
  isVisible,
}: {
  project: { number: string; title: string; category: string; year: string; direction: string }
  index: number
  isVisible: boolean
}) {
  const getRevealClass = () => {
    if (!isVisible) {
      return project.direction === "left" ? "-translate-x-16 opacity-0" : "translate-x-16 opacity-0"
    }
    return "translate-x-0 opacity-100"
  }

  return (
    <div
      className={`group flex max-w-full flex-col items-start gap-3 border-b border-foreground/10 py-5 transition-all duration-700 hover:border-foreground/20 md:flex-row md:items-center md:justify-between md:gap-6 md:py-8 ${
        index % 2 === 0 ? "md:max-w-[85%]" : "md:ml-auto md:max-w-[90%]"
      } ${getRevealClass()}`}
      style={{
        transitionDelay: `${index * 150}ms`,
      }}
    >
      <div className="flex w-full items-start gap-3 sm:gap-4 md:items-baseline md:gap-8">
        <span className="pt-1 font-mono text-xs text-foreground/30 transition-colors group-hover:text-foreground/50 sm:text-sm md:pt-0 md:text-base">
          {project.number}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="mb-1 text-balance font-sans text-xl font-light leading-tight text-foreground transition-transform duration-300 group-hover:translate-x-2 sm:text-2xl md:text-3xl lg:text-4xl">
            {project.title}
          </h3>
          <p className="max-w-[22rem] text-pretty font-mono text-[0.7rem] leading-relaxed text-foreground/50 sm:text-xs md:max-w-none md:text-sm">
            {project.category}
          </p>
        </div>
      </div>
      <span className="pl-6 font-mono text-[0.7rem] text-foreground/30 sm:text-xs md:pl-0 md:text-sm">
        {project.year}
      </span>
    </div>
  )
}
