"use client"

import { useEffect, useRef } from "react"
import { buildMask } from "@/lib/elnido/masks"
import { FS, VS } from "@/lib/elnido/shader"
import { ASP, BAKED, LOOK, SRC, fmt, label, nowHour, posterPlate, sky, skyAt, skyPos, type Plate, type Zone } from "@/lib/elnido/sky"

export type SceneStatus = { label: string; clock: string; mode: "live" | "elnido" | "preview" | "playing" }

type ClockState = { live: boolean; playing: boolean; hour: number; playStart: number; playFrom: number }

type Props = {
  /** Called when the time-of-day label or the displayed minute changes. */
  onStatus?: (status: SceneStatus) => void
  /** Whose clock the live scene follows: the visitor's, or El Nido's. */
  zone?: Zone
}

const IS_DEV = process.env.NODE_ENV === "development"

/**
 * Full-screen El Nido background. The still photo shows first (see lib/elnido/poster-script.ts),
 * then the WebGL scene is set up after first paint and fades in over it.
 */
export function LivingScene({ onStatus, zone = "local" }: Props) {
  const posterRef = useRef<HTMLDivElement>(null)
  const glRef = useRef<HTMLCanvasElement>(null)
  const birdsRef = useRef<HTMLCanvasElement>(null)
  const consoleRef = useRef<HTMLDivElement>(null)
  const onStatusRef = useRef(onStatus)
  const zoneRef = useRef(zone)
  const redrawRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    onStatusRef.current = onStatus
  }, [onStatus])

  // Redraw straight away so a paused (reduced-motion) scene and the status line follow the new clock
  useEffect(() => {
    zoneRef.current = zone
    redrawRef.current?.()
  }, [zone])

  useEffect(() => {
    const poster = posterRef.current!
    const canvas = glRef.current!
    const birdsCv = birdsRef.current!
    const params = new URLSearchParams(location.search)
    const controls = IS_DEV && params.has("controls")
    const consoleEl = controls ? consoleRef.current : null
    const hourIn = consoleEl?.querySelector<HTMLInputElement>("[data-hour]") ?? null
    const liveBtn = consoleEl?.querySelector<HTMLButtonElement>("[data-live]") ?? null
    const playBtn = consoleEl?.querySelector<HTMLButtonElement>("[data-play]") ?? null
    if (consoleEl) consoleEl.hidden = false

    let reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const state: ClockState = { live: true, playing: false, hour: nowHour(zoneRef.current), playStart: 0, playFrom: 0 }
    // Dev only: ?controls&hour=18.25 opens the preview at a fixed hour
    const fixed = controls ? parseFloat(params.get("hour") ?? "") : NaN
    if (!isNaN(fixed)) { state.hour = ((fixed % 24) + 24) % 24; state.live = false }
    if (hourIn) hourIn.value = state.hour.toFixed(2)
    liveBtn?.setAttribute("aria-pressed", String(state.live))

    let lastLabel = "", lastClock = "", lastMode = ""
    function report(h: number, lb: string) {
      const mode = state.playing ? "playing" : !state.live ? "preview" : zoneRef.current === "elnido" ? "elnido" : "live"
      const clock = fmt(h)
      if (lb === lastLabel && clock === lastClock && mode === lastMode) return
      lastLabel = lb; lastClock = clock; lastMode = mode
      onStatusRef.current?.({ label: lb, clock, mode })
    }

    const s0 = skyAt(state.hour, zoneRef.current)
    poster.style.backgroundImage = "url(" + SRC[posterPlate(s0)] + ")"

    let disposed = false
    let raf = 0, running = false, bootRaf = 0, bootTimer = 0, slowTimer = 0
    const cleanups: (() => void)[] = []
    const on = (t: EventTarget, type: string, fn: EventListener) => {
      t.addEventListener(type, fn); cleanups.push(() => t.removeEventListener(type, fn))
    }

    // Without WebGL the still photo is the scene, so it changes with the clock too
    function startUIOnly() {
      const h = state.live ? nowHour(zoneRef.current) : state.hour, s = skyAt(h, zoneRef.current)
      poster.style.backgroundImage = "url(" + SRC[posterPlate(s)] + ")"
      report(h, label(s))
    }
    redrawRef.current = startUIOnly

    function init() {
      if (disposed) return
      // ---------- WebGL ----------
      const gl = canvas.getContext("webgl", { antialias: false, alpha: false, premultipliedAlpha: false })
      if (!gl) { canvas.hidden = true; return startUIOnly() }

      function sh(type: number, src: string) { const s = gl!.createShader(type)!; gl!.shaderSource(s, src); gl!.compileShader(s); if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) { console.error(gl!.getShaderInfoLog(s)) } return s }
      const prog = gl.createProgram()!
      const vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS)
      gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog)
      const ownTextures: WebGLTexture[] = []
      let buf: WebGLBuffer | null = null
      cleanups.push(() => {
        ownTextures.forEach((tx) => gl.deleteTexture(tx))
        gl.deleteBuffer(buf)
        gl.deleteProgram(prog); gl.deleteShader(vs); gl.deleteShader(fs)
      })
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.error(gl.getProgramInfoLog(prog)); canvas.hidden = true; return startUIOnly() }
      gl.useProgram(prog)
      buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW)
      const loc = gl.getAttribLocation(prog, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
      const U: Record<string, WebGLUniformLocation | null> = {};
      ["tA","tB","tM","mixF","t","ripple","sparkle","fog","stars","lantern","drift","asp","fogC","bakedA","bakedB","uvS","uvO","sun","sunCol","moon","moonPhase","warmth"].forEach(function (k) { U[k] = gl.getUniformLocation(prog, k) })
      gl.uniform1f(U.asp, ASP)

      function newTex() { const tx = gl!.createTexture()!; ownTextures.push(tx); gl!.bindTexture(gl!.TEXTURE_2D, tx)
        gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR); gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR)
        gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE); gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE); return tx }

      const mk = buildMask()
      gl.activeTexture(gl.TEXTURE2); const mTex = newTex(); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, mk.w, mk.h, 0, gl.RGBA, gl.UNSIGNED_BYTE, mk.data)

      const textures: Partial<Record<Plate, WebGLTexture>> = {}, pending: Partial<Record<Plate, Promise<void>>> = {}
      function load(name: Plate): Promise<void> {
        if (textures[name]) return Promise.resolve()
        if (pending[name]) return pending[name]!
        pending[name] = new Promise(function (res) {
          const im = new Image(); im.decoding = "async"
          im.onload = function () { if (disposed) return res(); gl!.activeTexture(gl!.TEXTURE5); const tx = newTex(); gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGB, gl!.RGB, gl!.UNSIGNED_BYTE, im); textures[name] = tx; res() }
          im.onerror = function () { res() }
          im.src = SRC[name]
        })
        return pending[name]!
      }

      let view = { sx: 1, sy: 1, ox: 0, oy: 0 }
      function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
        const w = Math.round(innerWidth * dpr), h = Math.round(innerHeight * dpr)
        if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h }
        const bd = Math.min(window.devicePixelRatio || 1, 2)
        birdsCv.width = Math.round(innerWidth * bd); birdsCv.height = Math.round(innerHeight * bd)
        gl!.viewport(0, 0, w, h)
        const sa = w / h
        let sx = 1, sy = 1
        if (sa > ASP) sy = ASP / sa; else sx = sa / ASP
        const ox = (1 - sx) * 0.5, oy = (1 - sy) * 0.5
        gl!.uniform2f(U.uvS, sx, sy); gl!.uniform2f(U.uvO, ox, oy)
        view = { sx: sx, sy: sy, ox: ox, oy: oy }
      }
      resize()
      on(window, "resize", function () { resize(); if (reduce) frame(performance.now()) })

      function lerp(a: number, b: number, f: number) { return a + (b - a) * f }
      function clamp01(x: number) { return Math.max(0, Math.min(1, x)) }
      function currentHour(ms: number) {
        if (state.playing) { const el = (ms - state.playStart) / 1000; return (state.playFrom + el * 0.5) % 24 }
        if (state.live) return nowHour(zoneRef.current)
        return state.hour
      }

      // ---------- birds (2D overlay) ----------
      const bx = birdsCv.getContext("2d")!
      function drawBirds(ms: number, amount: number) {
        bx.setTransform(1, 0, 0, 1, 0, 0); bx.clearRect(0, 0, birdsCv.width, birdsCv.height)
        if (amount <= 0.01) return
        const s = birdsCv.width / innerWidth, t = ms / 1000, cycle = 34
        const flock = [[0, 0.20, 1.0], [0.9, 0.215, 0.8], [1.7, 0.19, 0.9], [14, 0.27, 0.85], [15.1, 0.28, 0.7]]
        bx.lineCap = "round"; bx.lineJoin = "round"
        flock.forEach(function (b) {
          const local = ((t - b[0]) % cycle + cycle) % cycle, prog = local / 22
          if (prog > 1) return
          const ix = 0.05 + prog * 0.9, iy = b[1] - prog * 0.05 + Math.sin(local * 0.8 + b[0]) * 0.006
          const X = (ix - view.ox) / view.sx * innerWidth, Y = (iy - view.oy) / view.sy * innerHeight
          const size = 7 * b[2], flap = Math.sin(local * 7 + b[0] * 3) * 0.6
          bx.strokeStyle = "rgba(20,24,28," + (0.55 * amount) + ")"; bx.lineWidth = 1.4 * s
          bx.beginPath()
          bx.moveTo((X - size) * s, (Y - size * flap) * s)
          bx.quadraticCurveTo((X - size * 0.4) * s, (Y - size * 0.2) * s, X * s, Y * s)
          bx.quadraticCurveTo((X + size * 0.4) * s, (Y - size * 0.2) * s, (X + size) * s, (Y - size * flap) * s)
          bx.stroke()
        })
      }

      function frame(ms: number) {
        if (disposed) return
        const h = currentHour(ms)
        const sk = sky(h, Date.now() + (h - nowHour(zoneRef.current)) * 3600000)
        if (!textures[sk.A] || !textures[sk.B]) { load(sk.A); load(sk.B) }
        const A = textures[sk.A] || textures[sk.B], B = textures[sk.B] || textures[sk.A]
        if (A && B) {
          const nameA = textures[sk.A] ? sk.A : sk.B, nameB = textures[sk.B] ? sk.B : sk.A
          const f = (textures[sk.A] && textures[sk.B]) ? sk.f : 0
          gl!.activeTexture(gl!.TEXTURE0); gl!.bindTexture(gl!.TEXTURE_2D, A)
          gl!.activeTexture(gl!.TEXTURE1); gl!.bindTexture(gl!.TEXTURE_2D, B)
          gl!.activeTexture(gl!.TEXTURE2); gl!.bindTexture(gl!.TEXTURE_2D, mTex)
          gl!.uniform1i(U.tA, 0); gl!.uniform1i(U.tB, 1); gl!.uniform1i(U.tM, 2)
          gl!.uniform3fv(U.bakedA, BAKED[nameA]); gl!.uniform3fv(U.bakedB, BAKED[nameB])
          const la = LOOK[nameA], lb = LOOK[nameB]
          gl!.uniform1f(U.mixF, f)
          gl!.uniform1f(U.t, reduce ? 0 : (ms / 1000) % 3600)
          gl!.uniform1f(U.ripple, lerp(la.ripple, lb.ripple, f))
          gl!.uniform1f(U.sparkle, lerp(la.sparkle, lb.sparkle, f))
          gl!.uniform1f(U.fog, lerp(la.fog, lb.fog, f))
          gl!.uniform1f(U.lantern, lerp(la.lantern, lb.lantern, f))
          gl!.uniform1f(U.drift, lerp(la.drift, lb.drift, f))
          gl!.uniform3f(U.fogC, lerp(la.fog_c[0], lb.fog_c[0], f), lerp(la.fog_c[1], lb.fog_c[1], f), lerp(la.fog_c[2], lb.fog_c[2], f))

          // Sun: size, colour and strength from its height
          // Sun drops almost straight down onto the light path in each photo: the morning glow sits right of the valley, the sunset streak at its centre
          const sp = [sk.morning ? 0.5675 + 0.0005 * Math.max(sk.e, 0) : 0.5075 + 0.0003 * Math.max(sk.e, 0), 0.398 - 0.0115 * sk.e]
          const lowS = clamp01(1 - sk.e / 25)
          const sunR = lerp(0.019, 0.034, lowS * lowS)
          const sunC = [1.0, lerp(0.97, 0.62, lowS), lerp(0.88, 0.32, lowS)]
          const sunW = clamp01((sk.e + 1.5) / 3)
          gl!.uniform4f(U.sun, sp[0], sp[1], sunR, sunW)
          gl!.uniform3f(U.sunCol, sunC[0], sunC[1], sunC[2])
          gl!.uniform1f(U.warmth, clamp01((sk.e - 2) / 6) * clamp01((24 - sk.e) / 14) * 0.85)

          // Moon: today's phase on its nightly arc, faint by day
          const mpos = skyPos(sk.Hm, sk.em)
          // Moon appears only once the sun is down: fades in through dusk, gone before dawn
          const dark = clamp01((-sk.e - 1) / 6)
          let moonW = clamp01((sk.em + 1) / 3) * dark * dark * (3 - 2 * dark)
          // keep it in the open sky: it fades into the haze before it can reach the islands
          moonW *= 1 - clamp01((mpos[1] - 0.22) / 0.08)
          gl!.uniform4f(U.moon, mpos[0], mpos[1], 0.03, moonW)
          gl!.uniform1f(U.moonPhase, sk.phase)
          gl!.uniform1f(U.stars, clamp01((-sk.e - 4) / 8))

          gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4)
          if (!canvas.classList.contains("ready")) canvas.classList.add("ready")
          drawBirds(ms, reduce ? 0 : lerp(la.birds, lb.birds, f))
        }
        report(h, label(sk))
        if (hourIn && (state.live || state.playing)) hourIn.value = h.toFixed(2)
      }

      function loop(ms: number) { frame(ms); raf = requestAnimationFrame(loop) }
      function start() { if (running || reduce || disposed) return; running = true; raf = requestAnimationFrame(loop) }
      function stop() { running = false; cancelAnimationFrame(raf) }
      on(document, "visibilitychange", function () { if (document.hidden) stop(); else start() })
      cleanups.push(stop)

      Promise.all([load(s0.A), load(s0.B)]).then(function () {
        if (disposed) return
        frame(performance.now())
        redrawRef.current = function () { frame(performance.now()) }
        start()
        ;(["night", "sunrise", "day", "sunset"] as Plate[]).forEach(load)
        if (reduce) slowTimer = window.setInterval(function () { frame(performance.now()) }, 60000)
      })

      // ---------- controls (development builds, ?controls) ----------
      if (hourIn && liveBtn && playBtn) {
        on(hourIn, "input", function () {
          state.hour = parseFloat(hourIn.value); state.live = false; state.playing = false
          liveBtn.setAttribute("aria-pressed", "false"); playBtn.setAttribute("aria-pressed", "false")
          if (reduce) frame(performance.now())
        })
        on(liveBtn, "click", function () {
          state.live = true; state.playing = false
          liveBtn.setAttribute("aria-pressed", "true"); playBtn.setAttribute("aria-pressed", "false")
          if (reduce) frame(performance.now())
        })
        on(playBtn, "click", function () {
          if (state.playing) { state.hour = currentHour(performance.now()); state.playing = false; playBtn.setAttribute("aria-pressed", "false"); return }
          state.playFrom = parseFloat(hourIn.value); state.playStart = performance.now(); state.playing = true; state.live = false
          playBtn.setAttribute("aria-pressed", "true"); liveBtn.setAttribute("aria-pressed", "false")
          if (reduce) { reduce = false; start() }
        })
      }
    }

    // Report the label straight away so the overlay text never waits on WebGL
    startUIOnly()
    // Set up WebGL after first paint
    bootRaf = requestAnimationFrame(() => { bootTimer = window.setTimeout(init, 0) })

    return () => {
      disposed = true
      redrawRef.current = null
      cancelAnimationFrame(bootRaf)
      clearTimeout(bootTimer)
      clearInterval(slowTimer)
      cleanups.splice(0).reverse().forEach((fn) => fn())
      canvas.classList.remove("ready")
    }
  }, [])

  return (
    <div className="scene">
      <div ref={posterRef} className="scene-poster" aria-hidden="true" />
      <canvas
        ref={glRef}
        className="scene-gl"
        role="img"
        aria-label="The Big Lagoon in El Nido, Palawan, lit by the real sun and moon for your time of day"
      />
      <canvas ref={birdsRef} className="scene-birds" aria-hidden="true" />
      {IS_DEV ? (
        <div ref={consoleRef} className="scene-console" role="group" aria-label="Scene time (development)" hidden>
          <input data-hour type="range" min="0" max="24" step="0.05" defaultValue="12" aria-label="Time of day" />
          {/* Form-fill extensions stamp attributes like fdprocessedid onto buttons before hydration */}
          <button data-live type="button" suppressHydrationWarning aria-pressed="true">Live</button>
          <button data-play type="button" suppressHydrationWarning aria-pressed="false">Play a day</button>
        </div>
      ) : null}
    </div>
  )
}
