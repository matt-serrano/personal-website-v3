// Water, sky, boat and calm masks for the El Nido scene, unchanged from design/elnido-scene/index.html.
import { SKYLINE } from "./sky"

type Pt = [number, number]

// ---------- masks (2000 x 1116 reference frame) ----------
const REF_W = 2000, REF_H = 1116
const WATER: Pt[] = [[905,445],[1140,445],[1130,495],[1225,560],[1380,610],[1530,650],[1580,710],[1750,760],[2000,830],[2000,1116],[0,1116],[0,1010],[150,940],[320,880],[470,840],[570,785],[640,720],[635,620],[622,528],[760,516],[890,497]]
const ROCK: Pt[] = [[645,1030],[700,940],[760,850],[800,800],[830,768],[872,764],[912,790],[945,832],[952,880],[1000,902],[1032,960],[1022,1004],[1000,1052],[982,1116],[700,1116],[650,1062]]
const SLAB: Pt[] = [[350,860],[400,846],[455,852],[460,880],[410,900],[352,888]]
// Traced with the others; unused by the scene itself
export const SKY: Pt[] = [[120,0],[1720,0],[1690,40],[1620,90],[1560,150],[1480,182],[1380,212],[1300,252],[1240,300],[1200,352],[1160,420],[1140,438],[980,438],[912,410],[882,330],[822,252],[722,236],[642,270],[582,318],[522,280],[432,202],[332,152],[292,112],[252,42],[202,15]]
const BOATS: [number, number, number, number][] = [[840,650,955,702],[1010,672,1124,730],[1190,652,1300,700],[1286,706,1438,774]]

export function buildMask() {
  const W = 512, H = Math.round(512 * REF_H / REF_W)
  function layer(draw: (x: CanvasRenderingContext2D) => void) {
    const c = document.createElement("canvas"); c.width = W; c.height = H
    const x = c.getContext("2d")!; x.scale(W / REF_W, H / REF_H); x.fillStyle = "#fff"; draw(x)
    return x.getImageData(0, 0, W, H).data
  }
  function poly(x: CanvasRenderingContext2D, pts: Pt[], op?: GlobalCompositeOperation) { x.globalCompositeOperation = op || "source-over"; x.beginPath(); pts.forEach(function (p, i) { if (i) x.lineTo(p[0], p[1]); else x.moveTo(p[0], p[1]) }); x.closePath(); x.fill() }
  const water = layer(function (x) { poly(x, WATER); poly(x, ROCK, "destination-out"); poly(x, SLAB, "destination-out") })

  const boats = layer(function (x) { BOATS.forEach(function (b) { x.beginPath(); x.ellipse((b[0]+b[2])/2, (b[1]+b[3])/2, (b[2]-b[0])/2, (b[3]-b[1])/2, 0, 0, Math.PI*2); x.fill() }) })
  // calm zone: no surface warping around boats (and their reflections), the rock island and the slab
  const calm = layer(function (x) {
    BOATS.forEach(function (b) { x.beginPath(); x.ellipse((b[0]+b[2])/2, (b[1]+b[3])/2 + 10, (b[2]-b[0])*0.9, (b[3]-b[1])*1.25, 0, 0, Math.PI*2); x.fill() })
    x.lineJoin = "round"; x.lineWidth = 70; x.strokeStyle = "#fff";
    [ROCK, SLAB].forEach(function (pts) { x.beginPath(); pts.forEach(function (p, i) { if (i) x.lineTo(p[0], p[1]); else x.moveTo(p[0], p[1]) }); x.closePath(); x.fill(); x.stroke() })
  })
  function chan(d: Uint8ClampedArray) { const a = new Float32Array(W * H); for (let i = 0; i < W * H; i++) a[i] = d[i * 4 + 3] / 255; return a }
  function blur(a: Float32Array, r: number) {
    const t = new Float32Array(a.length), o = new Float32Array(a.length)
    let x, y, k, s
    for (y = 0; y < H; y++) for (x = 0; x < W; x++) { s = 0; for (k = -r; k <= r; k++) s += a[y*W + Math.min(W-1, Math.max(0, x+k))]; t[y*W+x] = s / (2*r+1) }
    for (y = 0; y < H; y++) for (x = 0; x < W; x++) { s = 0; for (k = -r; k <= r; k++) s += t[Math.min(H-1, Math.max(0, y+k))*W + x]; o[y*W+x] = s / (2*r+1) }
    return o
  }
  const R = blur(blur(chan(water), 6), 4), G = new Float32Array(W * H), B = blur(chan(boats), 3), A = blur(blur(chan(calm), 5), 3)
  // sky field: 0 at the silhouette, rising to 1 a short way above it, so sun and moon slip behind land
  for (let yy = 0; yy < H; yy++) for (let xx = 0; xx < W; xx++) {
    const sy = SKYLINE[Math.round(xx / (W - 1) * 1023)], yn = (yy + 0.5) / H
    G[yy * W + xx] = Math.max(0, Math.min(1, (sy - yn) / 0.06 + 0.5 / H / 0.06))
  }
  const out = new Uint8Array(W * H * 4)
  for (let i = 0; i < W * H; i++) { out[i*4] = R[i]*255; out[i*4+1] = G[i]*255; out[i*4+2] = B[i]*255; out[i*4+3] = A[i]*255 }
  return { w: W, h: H, data: out }
}
