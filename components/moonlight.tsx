import { BOATS, REF_H, REF_W, ROCK, SLAB, WATER, type Pt } from "@/lib/elnido/masks"
import { MOON } from "@/lib/elnido/sky"

// Drawn in the masks' 2000 x 1116 frame, which has the photo's proportions, so one unit is the same across and down
const X = MOON.x * REF_W
// The water line under the moon, where the reflection starts
const TOP = 445
const path = (pts: Pt[]) => "M" + pts.map((p) => p.join(",")).join("L") + "Z"

// Ripples catching the light: rows closer together, shorter and brighter towards the horizon, and broken into more,
// fainter dashes nearer the viewer. An integer hash keeps them irregular but identical on server and client, and
// every number is rounded, since Math.pow and friends may differ in the last digit between the two.
const rnd = (n: number) => {
  let h = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b)
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}
const r1 = (v: number) => Math.round(v * 10) / 10
const ROWS = 26
const BANDS = Array.from({ length: ROWS }, (_, i) => {
  const t = (i + 0.5 + (rnd(i + 99) - 0.5) * 0.8) / ROWS
  const cy = TOP + 5 + (REF_H - TOP - 12) * Math.pow(t, 1.5)
  const half = 8 + 100 * t
  const count = 1 + Math.floor(t * 3 * rnd(i + 51) + t)
  return Array.from({ length: count }, (_, j) => {
    const k = i * 7 + j * 3 + 1
    return {
      cx: r1(X + (count === 1 ? (rnd(k) - 0.5) * half * 0.6 : ((j + 0.5) / count - 0.5) * half * 1.4 + (rnd(k) - 0.5) * half * 0.5)),
      cy: r1(cy),
      rx: r1((half / Math.sqrt(count)) * (0.45 + 0.55 * rnd(k + 2))),
      ry: r1((2.5 + 9 * t) * (0.6 + 0.8 * rnd(k + 3))),
      opacity: Math.round((1 - 0.65 * t) * (0.4 + 0.6 * rnd(k + 4)) * 100) / 100,
      delay: ((k * 2.9) % 7).toFixed(1),
    }
  })
}).flat()

/**
 * Moonlight on the water under the moon: a narrow column of soft light that widens and fades towards the viewer,
 * broken into shimmering bands. It only ever covers water (the traced water, less the rocks and boats, softened)
 * and blends in with screen. Sits in .scene-frame, so it stays on the photo's moonlit streak at any size.
 */
export function Moonlight() {
  return (
    <svg className="scene-moonlight" viewBox={`0 0 ${REF_W} ${REF_H}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <defs>
        <filter id="moonlight-soft" filterUnits="userSpaceOnUse" x="0" y="0" width={REF_W} height={REF_H}>
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <filter id="moonlight-column-blur" filterUnits="userSpaceOnUse" x="0" y="0" width={REF_W} height={REF_H}>
          <feGaussianBlur stdDeviation="16" />
        </filter>
        <mask id="moonlight-water" maskUnits="userSpaceOnUse" x="0" y="0" width={REF_W} height={REF_H}>
          <g filter="url(#moonlight-soft)">
            <path d={path(WATER)} fill="#fff" />
            <path d={path(ROCK)} fill="#000" />
            <path d={path(SLAB)} fill="#000" />
            {BOATS.map(([x0, y0, x1, y1], i) => (
              <ellipse key={i} cx={(x0 + x1) / 2} cy={(y0 + y1) / 2} rx={(x1 - x0) / 2} ry={(y1 - y0) / 2} fill="#000" />
            ))}
          </g>
        </mask>
        <linearGradient id="moonlight-column" x1="0" y1={TOP} x2="0" y2={REF_H} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="rgb(220,230,255)" stopOpacity="0.3" />
          <stop offset="0.45" stopColor="rgb(220,230,255)" stopOpacity="0.1" />
          <stop offset="1" stopColor="rgb(220,230,255)" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="moonlight-band">
          <stop offset="0" stopColor="rgb(235,240,255)" stopOpacity="0.5" />
          <stop offset="0.45" stopColor="rgb(225,233,255)" stopOpacity="0.2" />
          <stop offset="1" stopColor="rgb(220,230,255)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g mask="url(#moonlight-water)">
        <path
          d={`M${X - 5},${TOP}L${X + 5},${TOP}L${X + 110},${REF_H}L${X - 110},${REF_H}Z`}
          fill="url(#moonlight-column)"
          filter="url(#moonlight-column-blur)"
        />
        {/* Each band's strength sits on its group, so the shimmer (which animates opacity) only modulates it */}
        {BANDS.map((b, i) => (
          <g key={i} opacity={b.opacity}>
            <ellipse
              className="moonlight-band"
              style={{ animationDelay: `-${b.delay}s` }}
              cx={b.cx}
              cy={b.cy}
              rx={b.rx}
              ry={b.ry}
              fill="url(#moonlight-band)"
            />
          </g>
        ))}
      </g>
    </svg>
  )
}
