// Sky model for the El Nido scene, ported unchanged from design/elnido-scene/index.html.
// El Nido, Palawan (11.2°N); the scene clock is the visitor's local clock.

export type Plate = "sunrise" | "day" | "sunset" | "night"

export const SRC: Record<Plate, string> = {
  sunrise: "/scenery/elnido/sunrise.jpg",
  day: "/scenery/elnido/day.jpg",
  sunset: "/scenery/elnido/sunset.jpg",
  night: "/scenery/elnido/night.jpg",
}
export const IMG_W = 2752, IMG_H = 1536, ASP = IMG_W / IMG_H

// Each plate is also encoded as AVIF and WebP at these widths (the largest is the original size)
export const PLATE_WIDTHS = [1280, 1920, 2752]
// Browser colour for each plate: the top rows of the photo with the scene filter and top scrim applied
export const THEME: Record<Plate, string> = { sunrise: "#be9390", day: "#88a2b5", sunset: "#933e28", night: "#142f4f" }

/** The smallest encoded width that covers this screen at up to 2x density (keep in step with poster-script.ts). */
export function plateWidth() {
  const need = Math.max(innerWidth, innerHeight * ASP) * Math.min(window.devicePixelRatio || 1, 2)
  return PLATE_WIDTHS.find((w) => w >= need) ?? PLATE_WIDTHS[PLATE_WIDTHS.length - 1]
}
const plateFile = (p: Plate, w: number, ext: string) => "/scenery/elnido/" + p + "-" + w + "." + ext

/** CSS background for a still: AVIF or WebP at the right width where image-set() can pick by type, else the JPEG. */
export function posterImage(p: Plate) {
  const w = plateWidth()
  return CSS.supports("background-image", 'image-set(url("x.avif") type("image/avif"))')
    ? 'image-set(url("' + plateFile(p, w, "avif") + '") type("image/avif"), url("' + plateFile(p, w, "webp") + '") type("image/webp"))'
    : "url(" + SRC[p] + ")"
}

/** An image for a plate's texture: a detached <picture> lets the browser pick AVIF, WebP or the JPEG. */
export function plateImage(p: Plate) {
  const w = plateWidth(), pic = document.createElement("picture"), im = new Image()
  for (const ext of ["avif", "webp"]) {
    const so = document.createElement("source")
    so.type = "image/" + ext; so.srcset = plateFile(p, w, ext)
    pic.appendChild(so)
  }
  im.decoding = "async"
  pic.appendChild(im)
  return im
}
const D = Math.PI / 180

// Sun or moon painted into each plate (uv centre, radius in image-height units), removed before the live sky is drawn
export const BAKED: Record<Plate, [number, number, number]> = {
  sunrise: [0, 0, 0],
  sunset: [0, 0, 0],
  night: [0, 0, 0],
  day: [0, 0, 0],
}

export type Look = { ripple: number; sparkle: number; fog: number; stars: number; lantern: number; drift: number; birds: number; fog_c: [number, number, number] }

// Per-plate look: ripple, sparkle, fog, stars, lanterns, sky drift, birds, mist colour
export const LOOK: Record<Plate, Look> = {
  sunrise: { ripple: 1.0, sparkle: 0.55, fog: 1.0, stars: 0.0, lantern: 0, drift: 1.0, birds: 0.7, fog_c: [1.0, 0.86, 0.86] },
  day:     { ripple: 1.0, sparkle: 0.7,  fog: 0.15, stars: 0.0, lantern: 0, drift: 1.0, birds: 0.8, fog_c: [0.92, 0.96, 1.0] },
  sunset:  { ripple: 1.0, sparkle: 0.85, fog: 0.35, stars: 0.0, lantern: 0, drift: 1.0, birds: 0.8, fog_c: [1.0, 0.72, 0.48] },
  night:   { ripple: 0.8, sparkle: 0.55, fog: 0.15, stars: 1.0, lantern: 1, drift: 0.6, birds: 0.0, fog_c: [0.55, 0.66, 0.86] },
}

export type Sky = { e: number; H: number; em: number; Hm: number; phase: number; morning: boolean; A: Plate; B: Plate; f: number }

const LAT = 11.2 * D
function dayOfYear(d: Date) { const s = new Date(d.getFullYear(), 0, 0); return Math.floor((d.getTime() - s.getTime()) / 86400000) }
function declination(doy: number) { return 23.44 * D * Math.sin(2 * Math.PI * (284 + doy) / 365) }
function elevation(hourAngleDeg: number, dec: number) {
  return Math.asin(Math.sin(LAT) * Math.sin(dec) + Math.cos(LAT) * Math.cos(dec) * Math.cos(hourAngleDeg * D)) / D
}
function moonAge(ms: number) { const jd = ms / 86400000 + 2440587.5; const a = (jd - 2451550.1) % 29.530588; return a < 0 ? a + 29.530588 : a }
export function sky(h: number, ms: number): Sky {
  const date = new Date(ms), doy = dayOfYear(date), dec = declination(doy)
  const H = (h - 12.05) * 15
  const e = elevation(H, dec)
  const age = moonAge(ms), phase = age / 29.530588
  let Hm = H - phase * 360; Hm = ((Hm + 540) % 360) - 180
  const em = elevation(Hm, 0)
  const morning = H < 0
  const tw: Plate = morning ? "sunrise" : "sunset"
  let A: Plate, B: Plate, f: number
  function sm(x: number) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x) }
  if (e <= -12) { A = "night"; B = "night"; f = 0 }
  else if (e < -3) { A = "night"; B = tw; f = sm((e + 12) / 9) }
  else if (e <= 6) { A = tw; B = tw; f = 0 }
  else if (e < 20) { A = tw; B = "day"; f = sm((e - 6) / 14) }
  else { A = "day"; B = "day"; f = 0 }
  return { e: e, H: H, em: em, Hm: Hm, phase: phase, morning: morning, A: A, B: B, f: f }
}
export function label(s: Sky) {
  if (s.e < -12) return "Night"
  if (s.e < -4) return s.morning ? "Before dawn" : "Blue hour"
  if (s.e < 6) return s.morning ? "Sunrise" : "Sunset"
  if (s.e < 20) return s.morning ? "Morning light" : "Golden hour"
  return "Daytime"
}
// The moon, drawn over the night photo (.scene-moon): in open sky above the far islands, straight above the
// bright streak of moonlight on the water (centre x/y in image fractions, radius r in image heights)
export const MOON = { x: 0.565, y: 0.3, r: 0.022 }

// "local" is the visitor's clock; El Nido keeps Philippine time, UTC+8 with no daylight saving
export type Zone = "local" | "elnido"
export function nowHour(zone: Zone = "local") {
  const d = new Date()
  if (zone === "elnido") return (d.getUTCHours() + 8 + d.getUTCMinutes() / 60 + d.getUTCSeconds() / 3600) % 24
  return d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600
}
export function fmt(h: number) {
  h = ((h % 24) + 24) % 24
  const H = Math.floor(h), M = Math.floor((h - H) * 60)
  const ap = H >= 12 ? "PM" : "AM", h12 = H % 12 === 0 ? 12 : H % 12
  return h12 + ":" + (M < 10 ? "0" : "") + M + " " + ap
}

// Sky at a scene hour, dated relative to now (as the scene's frame loop does)
export function skyAt(h: number, zone: Zone = "local") { return sky(h, Date.now() + (h - nowHour(zone)) * 3600000) }
// The still photo that matches a sky, as the scene picks its poster
export function posterPlate(s: Sky): Plate { return s.f > 0.5 ? s.B : s.A }

// Land silhouette against the sky (traced from the daytime photo): image-height fraction for 1024 columns
export const SKYLINE = [0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0014,0.0026,0.0039,0.0046,0.0058,0.0072,0.0094,0.0117,0.0124,0.0124,0.0124,0.0129,0.0133,0.0156,0.0163,0.0234,0.0236,0.0241,0.0299,0.0412,0.0417,0.0417,0.0423,0.0573,0.0579,0.0579,0.0558,0.0547,0.0547,0.0553,0.0553,0.0553,0.0537,0.0515,0.0508,0.0501,0.0488,0.0471,0.0469,0.0469,0.0480,0.0498,0.0515,0.0556,0.0603,0.0654,0.0664,0.0668,0.0679,0.0690,0.0690,0.0690,0.0690,0.0701,0.0703,0.0702,0.0664,0.0612,0.0612,0.0612,0.0618,0.0618,0.0618,0.0612,0.0552,0.0469,0.0449,0.0449,0.0450,0.0485,0.0501,0.0514,0.0521,0.0531,0.0542,0.0553,0.0564,0.0591,0.0625,0.0666,0.0703,0.0762,0.0815,0.0867,0.0913,0.0978,0.1032,0.1070,0.1129,0.1165,0.1178,0.1184,0.1185,0.1198,0.1198,0.1198,0.1217,0.1224,0.1230,0.1250,0.1257,0.1262,0.1273,0.1289,0.1302,0.1323,0.1355,0.1393,0.1416,0.1445,0.1445,0.1452,0.1454,0.1465,0.1465,0.1465,0.1471,0.1478,0.1488,0.1515,0.1536,0.1536,0.1536,0.1536,0.1545,0.1615,0.1615,0.1628,0.1634,0.1634,0.1641,0.1641,0.1660,0.1660,0.1660,0.1608,0.1608,0.1612,0.1621,0.1621,0.1617,0.1615,0.1615,0.1615,0.1631,0.1641,0.1651,0.1732,0.1732,0.1732,0.1745,0.1758,0.1764,0.1777,0.1784,0.1784,0.1789,0.1800,0.1816,0.1868,0.1868,0.1868,0.1868,0.1882,0.1956,0.1985,0.1996,0.2007,0.2018,0.2036,0.2053,0.2058,0.2070,0.2093,0.2096,0.2096,0.2096,0.2098,0.2115,0.2122,0.2122,0.2129,0.2135,0.2135,0.2116,0.2116,0.2116,0.2116,0.2122,0.2122,0.2122,0.2117,0.2109,0.2109,0.2109,0.2120,0.2122,0.2129,0.2240,0.2246,0.2246,0.2251,0.2262,0.2279,0.2279,0.2279,0.2280,0.2291,0.2298,0.2306,0.2311,0.2322,0.2380,0.2428,0.2474,0.2500,0.2500,0.2507,0.2613,0.2637,0.2637,0.2633,0.2624,0.2624,0.2624,0.2653,0.2663,0.2674,0.2706,0.2741,0.2803,0.2875,0.2937,0.2962,0.2969,0.2973,0.3025,0.3077,0.3086,0.3086,0.3071,0.3000,0.2975,0.2964,0.2940,0.2929,0.2884,0.2858,0.2857,0.2852,0.2839,0.2812,0.2812,0.2806,0.2796,0.2780,0.2780,0.2780,0.2787,0.2799,0.2799,0.2786,0.2786,0.2786,0.2786,0.2781,0.2770,0.2767,0.2767,0.2767,0.2767,0.2761,0.2741,0.2726,0.2708,0.2691,0.2575,0.2493,0.2470,0.2410,0.2343,0.2331,0.2331,0.2331,0.2331,0.2285,0.2259,0.2259,0.2259,0.2259,0.2246,0.2235,0.2224,0.2220,0.2220,0.2204,0.2201,0.2201,0.2207,0.2228,0.2240,0.2259,0.2259,0.2252,0.2237,0.2233,0.2220,0.2220,0.2145,0.2142,0.2142,0.2145,0.2155,0.2155,0.2155,0.2147,0.2123,0.2105,0.2103,0.2103,0.2127,0.2152,0.2174,0.2174,0.2161,0.2141,0.2129,0.2112,0.2109,0.2109,0.2109,0.2118,0.2129,0.2160,0.2161,0.2161,0.2155,0.2155,0.2155,0.2161,0.2174,0.2195,0.2212,0.2266,0.2274,0.2285,0.2302,0.2318,0.2344,0.2348,0.2357,0.2363,0.2368,0.2370,0.2370,0.2358,0.2340,0.2337,0.2337,0.2350,0.2372,0.2389,0.2389,0.2389,0.2396,0.2468,0.2487,0.2497,0.2530,0.2549,0.2568,0.2578,0.2617,0.2651,0.2656,0.2656,0.2656,0.2663,0.2746,0.2789,0.2799,0.2806,0.2816,0.2834,0.2935,0.2992,0.3022,0.3052,0.3151,0.3172,0.3228,0.3229,0.3236,0.3236,0.3236,0.3236,0.3242,0.3242,0.3242,0.3249,0.3255,0.3272,0.3291,0.3320,0.3348,0.3361,0.3386,0.3421,0.3462,0.3490,0.3496,0.3499,0.3503,0.3515,0.3581,0.3579,0.3562,0.3538,0.3535,0.3535,0.3535,0.3535,0.3535,0.3535,0.3532,0.3522,0.3516,0.3499,0.3496,0.3490,0.3490,0.3490,0.3490,0.3490,0.3490,0.3490,0.3496,0.3503,0.3509,0.3521,0.3538,0.3556,0.3567,0.3581,0.3595,0.3613,0.3634,0.3687,0.3698,0.3726,0.3746,0.3763,0.3770,0.3776,0.3783,0.3794,0.3818,0.3836,0.3860,0.3874,0.3874,0.3862,0.3854,0.3852,0.3848,0.3843,0.3828,0.3821,0.3815,0.3815,0.3815,0.3822,0.3818,0.3815,0.3815,0.3815,0.3817,0.3822,0.3818,0.3696,0.3691,0.3687,0.3678,0.3671,0.3660,0.3649,0.3639,0.3633,0.3626,0.3620,0.3620,0.3613,0.3613,0.3613,0.3613,0.3622,0.3633,0.3639,0.3652,0.3667,0.3685,0.3742,0.3783,0.3783,0.3779,0.3770,0.3757,0.3750,0.3742,0.3731,0.3720,0.3711,0.3704,0.3698,0.3695,0.3685,0.3680,0.3675,0.3671,0.3659,0.3655,0.3646,0.3646,0.3663,0.3674,0.3685,0.3696,0.3704,0.3711,0.3717,0.3727,0.3738,0.3743,0.3750,0.3757,0.3762,0.3793,0.3802,0.3802,0.3802,0.3722,0.3711,0.3654,0.3626,0.3606,0.3576,0.3464,0.3295,0.3224,0.3216,0.3104,0.3022,0.3021,0.3021,0.3027,0.3027,0.2959,0.2884,0.2866,0.2858,0.2852,0.2852,0.2868,0.2878,0.2878,0.2874,0.2845,0.2845,0.2839,0.2839,0.2812,0.2771,0.2742,0.2693,0.2664,0.2622,0.2584,0.2561,0.2523,0.2513,0.2501,0.2493,0.2493,0.2474,0.2461,0.2459,0.2435,0.2428,0.2428,0.2428,0.2428,0.2428,0.2270,0.2246,0.2239,0.2233,0.2233,0.2229,0.2227,0.2212,0.2102,0.2081,0.2070,0.1999,0.1888,0.1874,0.1863,0.1822,0.1695,0.1680,0.1656,0.1654,0.1654,0.1647,0.1606,0.1471,0.1460,0.1445,0.1445,0.1445,0.1452,0.1452,0.1440,0.1419,0.1374,0.1342,0.1327,0.1296,0.1283,0.1283,0.1285,0.1296,0.1296,0.1278,0.1243,0.1196,0.1178,0.1177,0.1159,0.1152,0.1138,0.1133,0.1129,0.1094,0.1087,0.1065,0.1055,0.1055,0.1055,0.1061,0.1152,0.1158,0.1159,0.1154,0.1133,0.1121,0.1068,0.1055,0.1029,0.1022,0.1016,0.1016,0.1006,0.0982,0.0977,0.0977,0.0949,0.0920,0.0905,0.0898,0.0898,0.0890,0.0851,0.0840,0.0816,0.0814,0.0814,0.0819,0.0820,0.0833,0.0833,0.0830,0.0819,0.0814,0.0814,0.0814,0.0814,0.0749,0.0733,0.0703,0.0703,0.0703,0.0697,0.0697,0.0700,0.0710,0.0716,0.0716,0.0710,0.0703,0.0699,0.0690,0.0684,0.0684,0.0684,0.0684,0.0715,0.0723,0.0729,0.0729,0.0772,0.0781,0.0806,0.0807,0.0807,0.0795,0.0784,0.0781,0.0781,0.0781,0.0781,0.0782,0.0788,0.0788,0.0788,0.0788,0.0794,0.0918,0.0918,0.0964,0.0997,0.1016,0.1022,0.1022,0.1020,0.0973,0.0954,0.0936,0.0918,0.0889,0.0885,0.0885,0.0879,0.0877,0.0866,0.0866,0.0876,0.0905,0.0930,0.0956,0.0964,0.0969,0.0970,0.0990,0.0995,0.0996,0.0988,0.0983,0.0964,0.0955,0.0944,0.0938,0.0924,0.0924,0.0924,0.0931,0.0931,0.0926,0.0918,0.0918,0.0918,0.0911,0.0903,0.0874,0.0858,0.0840,0.0840,0.0840,0.0840,0.0840,0.0840,0.0846,0.0846,0.0846,0.0846,0.0801,0.0788,0.0762,0.0749,0.0742,0.0736,0.0736,0.0703,0.0650,0.0624,0.0578,0.0548,0.0422,0.0322,0.0295,0.0286,0.0280,0.0280,0.0267,0.0265,0.0234,0.0219,0.0195,0.0195,0.0195,0.0193,0.0167,0.0143,0.0130,0.0098,0.0072,0.0055,0.0046,0.0033,0.0026,0.0026,0.0026,0.0020,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0013,0.0068,0.0072,0.0072,0.0075,0.0085,0.0090,0.0091,0.0090,0.0072,0.0061,0.0057,0.0039,0.0033,0.0008,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000]
