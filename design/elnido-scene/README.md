# El Nido living scene

Open `index.html` through a local server (images won't load from file://), for example the VS Code **Live Server** extension, or `npx serve .` in this folder.

- Follows the visitor's clock: real sun and moon positions for El Nido (11.2°N), today's moon phase.
- Add `?controls` to the URL to show the preview slider (`index.html?controls`).
- Files: `index.html` (all code, WebGL) + `sunrise.jpg`, `day.jpg`, `sunset.jpg`, `night.jpg`.

To use it as a background on another page, copy the `<canvas id="gl">`, `<canvas id="birds">`, `#poster` div, the CSS and the script, then put your content above it with a higher `z-index`.

## In this repo

This folder keeps the original standalone scene as the design reference. The site uses a port of it:

- Photos: `public/scenery/elnido/` (byte-identical copies, served at `/scenery/elnido/*.jpg`).
- Code: `lib/elnido/` (sky model, masks, shader) and `components/living-scene.tsx`.

To open this `index.html` on its own, copy the four photos from `public/scenery/elnido/` next to it.
