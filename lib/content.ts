// Site content. Everything here comes from the previous version of the site; edit it here, not in the components.

export const person = {
  firstName: "Matthew",
  lastName: "Serrano",
  tagline: "Computer Science Student at Ontario Tech University",
}

export type IconName = "linkedin" | "github" | "email"

export const links: { label: string; href: string; text: string; icon: IconName }[] = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/matthew-serrano-13a11b312/",
    text: "linkedin.com/in/matthew-serrano-13a11b312",
    icon: "linkedin",
  },
  { label: "GitHub", href: "https://github.com/matt-serrano", text: "github.com/matt-serrano", icon: "github" },
  { label: "Email", href: "mailto:mattsrano@gmail.com", text: "mattsrano@gmail.com", icon: "email" },
]

export type PanelItem = {
  title: string
  /** One line under the title. */
  line: string
  description: string
  href?: string
}

export const experience: PanelItem[] = [
  {
    title: "IT Systems Analyst",
    line: "Ontario Public Service",
    description: "Government of Ontario. May 2026 – Present.",
  },
  {
    title: "Software Engineer",
    line: "Purchs",
    description: "AI wholesale platform for CPG brands & retailers. November 2025 – March 2026.",
  },
]

// Each href is the project's demo video or post.
export const projects: PanelItem[] = [
  {
    title: "AI-Powered Finance Application",
    line: "HackHive 2026",
    description: "Analyzing financial data with AI to deliver insights and forecasts.",
    href: "https://youtu.be/3ftBPUnSn78",
  },
  {
    title: "Car Catalog Application",
    line: "Full-stack platform",
    description: "Designing a full-stack platform for browsing and managing car listings.",
    href: "https://www.youtube.com/watch?v=AR-lZ5WeqPE",
  },
  {
    title: "Baseball Pitch Sign Detector",
    line: "Computer vision",
    description: "Using computer vision to detect and interpret pitch signals in real time.",
    href: "https://www.linkedin.com/posts/matthew-serrano-13a11b312_computervision-machinelearning-python-activity-7385698204345876480-yUkw?utm_source=share&utm_medium=member_desktop&rcm=ACoAAAMCKH0B3YNGn-PtbICXRmstpv3is2iMdUw",
  },
  {
    title: "Hangman.io",
    line: "Real-time multiplayer",
    description: "A real-time multiplayer Hangman game with dynamic scoring and interactive gameplay.",
    href: "https://www.youtube.com/watch?v=xrJr8vSu1XE",
  },
]

export const about = {
  heading: "Who am I?",
  paragraphs: [
    "I have experience across multiple programming languages with a focus on software development and building practical, well-designed systems.",
    "Aside from technology, I am a black belt in judo and purple belt in Brazilian jiu-jitsu, bringing discipline and consistency into every area.",
  ],
  stats: [
    { value: "3.80", label: "cGPA", sublabel: "2x President's List" },
    { value: "10+", label: "Languages and Frameworks", sublabel: "Building full-stack and AI solutions" },
    { value: "15+", label: "Years Experience", sublabel: "Brazilian Jiu Jitsu and Judo" },
  ],
  highlight: { label: "Check out my BJJ Highlights", href: "https://youtube.com/shorts/nnF5m4u36G4?si=MhoPekkasLHiqwXN" },
}

export const contact = {
  heading: "Let's Connect",
  sub: "Get in touch",
  location: "Toronto, ON, Canada",
}

export type Location = {
  id: string
  name: string
  /** Which living scene to show. Only El Nido exists so far. */
  scene: "elnido"
}

// Add Toronto here once its scene exists; the switch arrow appears as soon as there are two.
export const locations: Location[] = [{ id: "elnido", name: "El Nido, Palawan, Philippines", scene: "elnido" }]

export const webring = {
  home: "https://otu-ring.com",
  logo: "https://otu-ring.com/assets/ontariotech.svg",
  prev: (host: string) => `https://otu-ring.com/prev.html?from=${encodeURIComponent(host)}`,
  next: (host: string) => `https://otu-ring.com/next.html?from=${encodeURIComponent(host)}`,
  fallbackHost: "otu-ring.com",
}
