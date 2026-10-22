# personal-website-v3

My portfolio. The home page is one full-screen view on a living scene of the Big Lagoon in El Nido, Palawan, lit by the real sun and moon for the visitor's clock, with my name, links, an experience and projects panel and a location label laid over it. `/about` and `/contact` use the matching still photo, darkened.

## Development

```bash
pnpm install --frozen-lockfile
pnpm run dev
pnpm run build
```

- Content (experience, projects, about, contact, links, locations): `lib/content.ts`.
- Scene: `components/living-scene.tsx` with the sky model, masks and shader in `lib/elnido/`; photos in `public/scenery/elnido/`; the original standalone scene in `design/elnido-scene/`.
- In development, add `?controls` to the URL for the time slider, or `?controls&hour=17.75` to open at a fixed hour.
