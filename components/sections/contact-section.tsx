"use client"

import { Github, Linkedin, Mail, MapPin } from "lucide-react"
import { useReveal } from "@/hooks/use-reveal"

export function ContactSection() {
  const { ref, isVisible } = useReveal(0.3)
  const contactLinks = [
    {
      label: "GitHub",
      href: "https://github.com/matt-serrano",
      text: "github.com/matt-serrano",
      icon: Github,
    },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/matthew-serrano-13a11b312/",
      text: "linkedin.com/in/matthew-serrano-13a11b312",
      icon: Linkedin,
    },
    {
      label: "Email",
      href: "mailto:mattsrano@gmail.com",
      text: "mattsrano@gmail.com",
      icon: Mail,
    },
  ]

  return (
    <section
      ref={ref}
      className="se-contact-section flex h-screen w-screen shrink-0 snap-start items-center px-4 pt-20 md:px-12 md:pt-0 lg:px-16"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid items-stretch gap-8 md:grid-cols-[1.1fr_0.9fr] md:gap-16 lg:gap-24">
          <div className="flex flex-col justify-center">
            <div
              className={`mb-6 transition-all duration-700 md:mb-12 ${
                isVisible ? "translate-x-0 opacity-100" : "-translate-x-12 opacity-0"
              }`}
            >
              <h2 className="mb-2 font-sans text-4xl font-light leading-[1.05] tracking-tight text-foreground md:mb-3 md:text-7xl lg:text-8xl">
                Let's
                <br />
                Connect
              </h2>
              <p className="font-mono text-xs text-foreground/60 md:text-base">Get in touch</p>
            </div>

            <div className="space-y-4 md:space-y-8">
              <div
                className={`transition-all duration-700 ${
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
                }`}
                style={{ transitionDelay: "350ms" }}
              >
                <div className="mb-1 flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-foreground/60" />
                  <span className="font-mono text-xs text-foreground/60">Location</span>
                </div>
                <p className="text-base text-foreground md:text-2xl">Toronto, ON, Canada</p>
              </div>
            </div>
          </div>

          <div
            className={`flex h-full flex-col justify-center gap-5 border-l border-foreground/20 pl-5 transition-all duration-700 md:gap-7 md:pl-8 ${
              isVisible ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0"
            }`}
            style={{ transitionDelay: "500ms" }}
          >
            {contactLinks.map((link) => {
              const Icon = link.icon

              return (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                  className="group grid grid-cols-[1.5rem_1fr] items-center gap-3 font-mono text-xs text-foreground/60 transition-colors hover:text-foreground md:grid-cols-[2rem_1fr] md:gap-4 md:text-base"
                >
                  <Icon className="h-4 w-4 text-foreground/60 transition-colors group-hover:text-foreground md:h-5 md:w-5" />
                  <span className="min-w-0 truncate">{link.text}</span>
                </a>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
