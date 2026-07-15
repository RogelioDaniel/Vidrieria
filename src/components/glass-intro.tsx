'use client'

/**
 * GlassIntro — PRISMA's signature loading overture.
 *
 * A single frosted pane bearing the wordmark shatters from an impact point
 * (the "loading" beat), the shards hang in the copper light, then reverse and
 * *reconstruct* into the intact pane before the whole thing dissolves to reveal
 * the actual hero beneath it. The landing page is revealed from the outside
 * inward while the shards return, so it feels assembled from glass instead of
 * appearing after a white flash. Built on one BufferGeometry of triangular
 * shards driven by a custom shader — the entire shatter is one draw call.
 *
 * Each load gets a new fracture seed and impact point. Respects reduced motion,
 * Save-Data, and silently no-ops if WebGL is unavailable — the page is always
 * revealed either way.
 */

import * as React from 'react'
import * as THREE from 'three'

// Palette (mirrors globals.css design tokens)
const FROST = new THREE.Color('#c2d0d8')
const COPPER = new THREE.Color('#d18a45')
const OBSIDIAN = '#100f0d'

// A denser radial graph creates fine, irregular hairline cracks instead of the
// heavy geometric web produced by a coarse pane.
const RINGS = 10
const SECTORS = 28

// Timeline (seconds) — paced to make the material transformation legible
// without overstaying its welcome (~4.7s total).
const T = {
  formIn: 0.5, // pane fades in intact
  shatter: 1.65, // explode outward — the "loading" break
  hold: 2.25, // shards suspended, progress fills
  reconstruct: 3.8, // shards return while the landing page is revealed
  settle: 4.3, // intact clear pane catches one restrained refraction
  end: 4.7, // glass dissolves, leaving the real page in place
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}
function easeOutBack(t: number) {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

/** Offscreen canvas → wordmark texture painted onto the pane. */
function makeWordmarkTexture(paneAspect: number): THREE.Texture {
  const w = 2048
  const h = Math.round(w / paneAspect)
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  ctx.clearRect(0, 0, w, h)

  const cx = w / 2
  const cy = h / 2

  // Wordmark — a high-contrast serif reads as etched glass.
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = 'rgba(255,255,255,0.98)'
  const titleSize = Math.round(w * 0.115)
  ctx.font = `600 ${titleSize}px Georgia, "Times New Roman", serif`
  ctx.fillText('PRISMA', cx, cy - titleSize * 0.12)

  // Copper hairline under the wordmark
  const lineW = w * 0.28
  ctx.fillStyle = 'rgba(209,138,69,0.95)'
  ctx.fillRect(cx - lineW / 2, cy + titleSize * 0.5, lineW, Math.max(2, w * 0.0016))

  // Mono subtitle
  const subSize = Math.round(w * 0.02)
  ctx.fillStyle = 'rgba(230,232,234,0.85)'
  ctx.font = `500 ${subSize}px "Courier New", monospace`
  ctx.fillText(
    'V I D R I E R Í A   D E   A U T O R',
    cx,
    cy + titleSize * 0.5 + subSize * 2.4,
  )

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.minFilter = THREE.LinearFilter
  tex.magFilter = THREE.LinearFilter
  return tex
}

/** Build the shard geometry: radial-fracture quads around an impact point. */
function buildShardGeometry(
  paneW: number,
  paneH: number,
  impact: THREE.Vector2,
  seed: number,
) {
  const rand = mulberry32(seed)
  const maxR = Math.hypot(paneW / 2, paneH / 2) * 1.08
  const angularOffset = rand() * Math.PI * 2
  const radiusPower = 1.45 + rand() * 0.25

  // Shared node grid so the assembled pane is seamless (no gaps).
  // nodes[k][j] for ring k (0=impact center) and sector j.
  const nodes: THREE.Vector2[][] = []
  for (let k = 0; k <= RINGS; k++) {
    const row: THREE.Vector2[] = []
    const radius = maxR * Math.pow(k / RINGS, radiusPower)
    for (let j = 0; j < SECTORS; j++) {
      if (k === 0) {
        row.push(impact.clone())
        continue
      }
      const jitterA =
        (rand() - 0.5) * ((Math.PI * 2) / SECTORS) * (0.42 + rand() * 0.22)
      const jitterR = 1 + (rand() - 0.5) * (0.2 + rand() * 0.16)
      const ang = (j / SECTORS) * Math.PI * 2 + angularOffset + jitterA
      row.push(
        new THREE.Vector2(
          impact.x + Math.cos(ang) * radius * jitterR,
          impact.y + Math.sin(ang) * radius * jitterR,
        ),
      )
    }
    nodes.push(row)
  }

  const positions: number[] = []
  const centroids: number[] = []
  const barys: number[] = []
  const randoms: number[] = []
  const delays: number[] = []
  const edgeMasks: number[] = []
  const uvs: number[] = []

  const B = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ]

  const toUv = (p: THREE.Vector2) => [
    (p.x + paneW / 2) / paneW,
    (p.y + paneH / 2) / paneH,
  ]

  const pushTri = (
    a: THREE.Vector2,
    b: THREE.Vector2,
    cc: THREE.Vector2,
    centroid: THREE.Vector2,
    rnd: number[],
    delay: number,
    edgeMask: number[],
  ) => {
    const tri = [a, b, cc]
    for (let i = 0; i < 3; i++) {
      const p = tri[i]
      positions.push(p.x, p.y, 0)
      centroids.push(centroid.x, centroid.y, 0)
      barys.push(B[i][0], B[i][1], B[i][2])
      randoms.push(rnd[0], rnd[1], rnd[2])
      delays.push(delay)
      edgeMasks.push(edgeMask[0], edgeMask[1], edgeMask[2])
      const uv = toUv(p)
      uvs.push(uv[0], uv[1])
    }
  }

  for (let k = 0; k < RINGS; k++) {
    for (let j = 0; j < SECTORS; j++) {
      const j2 = (j + 1) % SECTORS
      const p00 = nodes[k][j]
      const p01 = nodes[k][j2]
      const p10 = nodes[k + 1][j]
      const p11 = nodes[k + 1][j2]

      const centroid = new THREE.Vector2()
        .add(p00)
        .add(p01)
        .add(p10)
        .add(p11)
        .multiplyScalar(0.25)
      const rnd = [rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1]
      // Keep radial/circumferential cuts; only a few diagonals become real
      // secondary cracks. This removes the uniform triangulated-grid look.
      const branch = rand() < 0.18 ? 1 : 0
      // crack propagates outward → inner shards break first
      const delay = k / RINGS

      if (k === 0) {
        // triangle fan at the impact core (p00 === p01 === center)
        pushTri(nodes[0][0], p10, p11, centroid, rnd, delay, [1, 1, 1])
      } else {
        pushTri(p00, p10, p11, centroid, rnd, delay, [1, branch, 1])
        pushTri(p00, p11, p01, centroid, rnd, delay, [1, 1, branch])
      }
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3),
  )
  geo.setAttribute('aCentroid', new THREE.Float32BufferAttribute(centroids, 3))
  geo.setAttribute('aBary', new THREE.Float32BufferAttribute(barys, 3))
  geo.setAttribute('aRandom', new THREE.Float32BufferAttribute(randoms, 3))
  geo.setAttribute('aDelay', new THREE.Float32BufferAttribute(delays, 1))
  geo.setAttribute(
    'aEdgeMask',
    new THREE.Float32BufferAttribute(edgeMasks, 3),
  )
  geo.setAttribute('aUv', new THREE.Float32BufferAttribute(uvs, 2))
  return geo
}

// Small deterministic PRNG: one coherent pattern per run, a new seed per load.
function mulberry32(seed: number) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function randomSeed() {
  try {
    const value = new Uint32Array(1)
    window.crypto.getRandomValues(value)
    return value[0]
  } catch {
    return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0
  }
}

const VERT = /* glsl */ `
  attribute vec3 aCentroid;
  attribute vec3 aBary;
  attribute vec3 aRandom;
  attribute float aDelay;
  attribute vec3 aEdgeMask;
  attribute vec2 aUv;

  uniform float uShatter;
  uniform vec2 uImpact;

  varying vec3 vBary;
  varying vec3 vEdgeMask;
  varying vec2 vUv;
  varying float vShatter;
  varying float vDist;

  vec3 rotateAxis(vec3 v, vec3 axis, float angle) {
    axis = normalize(axis);
    float c = cos(angle);
    float s = sin(angle);
    return v * c + cross(axis, v) * s + axis * dot(axis, v) * (1.0 - c);
  }

  void main() {
    // Staggered so the crack radiates from the impact outward.
    float d = aDelay * 0.6;
    float s = clamp((uShatter - d) / (1.0 - d), 0.0, 1.0);
    s = smoothstep(0.0, 1.0, s);

    vec2 dir = normalize(aCentroid.xy - uImpact + vec2(0.0001));
    float spread = 1.6 + aRandom.y * 0.9;

    // Rigid-body: rotate the whole shard around its own centroid.
    vec3 local = position - aCentroid;
    vec3 axis = normalize(aRandom + vec3(0.0, 0.0, 0.6));
    float ang = s * (2.2 + aRandom.x * 2.4);
    vec3 rotated = rotateAxis(local, axis, ang);

    vec3 explode;
    explode.xy = dir * s * spread;
    explode.z = s * (1.4 + aRandom.z * 1.2); // toward the camera
    explode.y -= s * s * 0.5;                 // a little gravity

    vec3 pos = aCentroid + rotated + explode;

    vBary = aBary;
    vEdgeMask = aEdgeMask;
    vUv = aUv;
    vShatter = s;
    vDist = length(aCentroid.xy - uImpact);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const FRAG = /* glsl */ `
  precision highp float;

  uniform sampler2D uTex;
  uniform vec3 uFrost;
  uniform vec3 uCopper;
  uniform float uOpacity;
  uniform float uReveal;
  uniform float uGlint;

  varying vec3 vBary;
  varying vec3 vEdgeMask;
  varying vec2 vUv;
  varying float vShatter;
  varying float vDist;

  void main() {
    // Clear low-iron glass: present enough to catch light, transparent enough
    // for the real section beneath to remain the visual subject.
    vec3 col = mix(uFrost * 0.26, uFrost * 0.48, 0.5);

    // Copper light pooling around the impact
    float glow = exp(-vDist * 0.55);
    col = mix(col, uCopper, glow * 0.24);

    // Etched wordmark leaves as the real landing page takes its place.
    vec4 tex = texture2D(uTex, vUv);
    col = mix(
      col,
      vec3(0.96, 0.97, 0.98),
      tex.a * 0.92 * (1.0 - uReveal)
    );

    // Two-stage crack: a very thin charcoal cut plus a restrained silver/copper
    // core. This reads as laminated glass hairlines, not glowing grout.
    vec3 edgeCuts =
      (vec3(1.0) - smoothstep(vec3(0.0), vec3(0.011), vBary)) * vEdgeMask;
    vec3 coreCuts =
      (vec3(1.0) - smoothstep(vec3(0.0), vec3(0.0028), vBary)) * vEdgeMask;
    float edge = max(edgeCuts.x, max(edgeCuts.y, edgeCuts.z));
    float edgeCore = max(coreCuts.x, max(coreCuts.y, coreCuts.z));
    col = mix(col, vec3(0.018, 0.022, 0.024), edge * 0.68);
    col += edgeCore * (0.08 + vShatter * 0.20) * vec3(0.82, 0.76, 0.68);

    // As it reforms, the pane clears rather than flashing opaque white.
    col = mix(col, col * 0.52 + vec3(0.026, 0.034, 0.038), uReveal * 0.55);

    // A narrow copper refraction confirms the pane is intact. It never floods
    // the screen, so the hero remains readable throughout the handoff.
    float glintLine = mix(-0.25, 1.35, uGlint);
    float glint = 1.0 - smoothstep(
      0.0,
      0.035,
      abs(vUv.x + vUv.y * 0.22 - glintLine)
    );
    col += glint * uReveal * vec3(0.22, 0.13, 0.06);

    float glassAlpha = mix(0.46, 0.055, uReveal);
    float edgeAlpha = mix(0.12, 0.22, uReveal);
    float alpha = (glassAlpha + edge * edgeAlpha) * uOpacity;
    gl_FragColor = vec4(col, alpha);
  }
`

function hasWebGL(): boolean {
  // Creating a disposable probe context on every navigation eventually hits
  // the browser's WebGL-context limit. The renderer constructor below is the
  // authoritative capability check and already has a safe fallback.
  return typeof window !== 'undefined' && Boolean(window.WebGLRenderingContext)
}

export function GlassIntro() {
  // Starts active so the overlay is server-rendered and covers the page from
  // the very first paint — otherwise the landing flashes for a frame before
  // the client mounts the intro. It plays on every load, then removes itself.
  const [active, setActive] = React.useState(true)
  const [progress, setProgress] = React.useState(0)
  const [phase, setPhase] = React.useState<'break' | 'rebuild'>('break')
  const mountRef = React.useRef<HTMLDivElement | null>(null)
  const backdropRef = React.useRef<HTMLDivElement | null>(null)
  const hudRef = React.useRef<HTMLDivElement | null>(null)

  // Run the overture once the overlay (and its mount point) is in the DOM.
  React.useEffect(() => {
    if (!active) return

    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    const saveData = Boolean(
      (
        navigator as Navigator & {
          connection?: { saveData?: boolean }
        }
      ).connection?.saveData,
    )

    const previousHtmlOverflow = document.documentElement.style.overflow
    const previousBodyOverflow = document.body.style.overflow
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    let cleanup = () => {}
    if (reduce || saveData || !hasWebGL()) {
      // Accessible fallback: brief branded fade, then reveal.
      const to = window.setTimeout(() => finish(), 500)
      cleanup = () => window.clearTimeout(to)
    } else {
      cleanup = runThree()
    }

    function finish() {
      document.documentElement.style.overflow = previousHtmlOverflow
      document.body.style.overflow = previousBodyOverflow
      setActive(false)
    }

    function runThree() {
      const mount = mountRef.current
      if (!mount) {
        // Should not happen, but never leave the overlay stuck.
        const to = window.setTimeout(() => finish(), 300)
        return () => window.clearTimeout(to)
      }

      const scene = new THREE.Scene()
      const aspect = window.innerWidth / window.innerHeight
      const camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 100)
      camera.position.z = 6

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setClearColor(0x000000, 0)
      mount.appendChild(renderer.domElement)

      // Pane sized to over-cover the viewport at z=0.
      const vH = 2 * camera.position.z * Math.tan((50 * Math.PI) / 360)
      const vW = vH * aspect
      const paneW = vW * 1.55
      const paneH = vH * 1.55
      const seed = randomSeed()
      const rand = mulberry32(seed ^ 0x9e3779b9)
      const impact = new THREE.Vector2(
        paneW * (-0.14 + rand() * 0.28),
        paneH * (-0.11 + rand() * 0.22),
      )

      const geometry = buildShardGeometry(
        paneW,
        paneH,
        impact,
        seed ^ 0x85ebca6b,
      )
      const wordmark = makeWordmarkTexture(paneW / paneH)

      const uniforms = {
        uShatter: { value: 0 },
        uImpact: { value: impact },
        uTex: { value: wordmark },
        uFrost: { value: FROST },
        uCopper: { value: COPPER },
        uOpacity: { value: 0 },
        uReveal: { value: 0 },
        uGlint: { value: 0 },
      }

      const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      })

      const mesh = new THREE.Mesh(geometry, material)
      scene.add(mesh)

      const onResize = () => {
        const a = window.innerWidth / window.innerHeight
        camera.aspect = a
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
      }
      window.addEventListener('resize', onResize)

      const revealLanding = (amount: number) => {
        const backdrop = backdropRef.current
        if (!backdrop) return

        // The fracture reconstructs from the outer rings inward. Shrinking the
        // opaque circle in the same direction reveals the real hero exactly
        // where those returning shards have already settled.
        const currentVW = vH * camera.aspect
        const xPct = 50 + (impact.x / currentVW) * 100
        const yPct = 50 - (impact.y / vH) * 100
        const impactX = (xPct / 100) * window.innerWidth
        const impactY = (yPct / 100) * window.innerHeight
        const farX = Math.max(impactX, window.innerWidth - impactX)
        const farY = Math.max(impactY, window.innerHeight - impactY)
        const radius = Math.hypot(farX, farY) * 1.04 * (1 - amount)
        backdrop.style.clipPath = `circle(${Math.max(0, radius)}px at ${xPct}% ${yPct}%)`
      }

      // Map elapsed time → uniforms + HUD, then render one frame.
      const renderFrame = (t: number) => {
        let shatter = 0
        let opacity = 1
        let reveal = 0
        let glint = 0

        if (t < T.formIn) {
          // pane fades in intact
          shatter = 0
          opacity = t / T.formIn
        } else if (t < T.shatter) {
          // break outward
          const k = (t - T.formIn) / (T.shatter - T.formIn)
          shatter = Math.min(
            easeOutBack(Math.min(k, 1)) * 0.5 + easeInOutCubic(k) * 0.5,
            1,
          )
        } else if (t < T.hold) {
          shatter = 1
        } else if (t < T.reconstruct) {
          // Reverse the fracture while the actual hero is assembled beneath it.
          const k = (t - T.hold) / (T.reconstruct - T.hold)
          shatter = 1 - easeInOutCubic(k)
          reveal = easeInOutCubic(Math.max(0, (k - 0.06) / 0.94))
        } else if (t < T.settle) {
          // The hero is now visible through an intact, nearly-clear pane.
          shatter = 0
          reveal = 1
          glint = (t - T.reconstruct) / (T.settle - T.reconstruct)
        } else {
          // Dissolve only the final glass skin; the real page is already there.
          const k = (t - T.settle) / (T.end - T.settle)
          shatter = 0
          reveal = 1
          glint = 1
          opacity = 1 - easeInOutCubic(Math.min(k, 1))
        }

        uniforms.uShatter.value = shatter
        uniforms.uOpacity.value = opacity
        uniforms.uReveal.value = reveal
        uniforms.uGlint.value = glint
        revealLanding(reveal)

        if (hudRef.current) {
          hudRef.current.style.opacity = String(
            1 - Math.min(1, reveal * 1.35),
          )
        }

        // HUD progress: fills through break + hold, then "rebuild"
        if (t < T.hold) {
          setProgress(Math.min(100, Math.round((t / T.hold) * 100)))
          setPhase('break')
        } else if (t < T.reconstruct) {
          setProgress(100)
          setPhase('rebuild')
        }

        renderer.render(scene, camera)
      }

      // Compile the shader up front so any GLSL error surfaces immediately and
      // the first visible frame is instant — even in a background tab where
      // requestAnimationFrame is paused. uOpacity is 0 here, so nothing shows.
      renderFrame(0)

      // Dev-only manual driver — lets the overture be inspected without rAF.
      if (process.env.NODE_ENV !== 'production') {
        ;(window as unknown as Record<string, unknown>).__prismaIntro = (
          s: number,
        ) => {
          uniforms.uShatter.value = s
          uniforms.uOpacity.value = 1
          uniforms.uReveal.value = 0
          uniforms.uGlint.value = 0
          renderer.render(scene, camera)
          const gl = renderer.getContext()
          const w = gl.drawingBufferWidth
          const h = gl.drawingBufferHeight
          const buf = new Uint8Array(w * h * 4)
          gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, buf)
          // Coverage: fraction of pixels the glass shards actually paint.
          let covered = 0
          const step = 4 * 17 // subsample for speed
          let sampled = 0
          for (let i = 3; i < buf.length; i += step) {
            sampled++
            if (buf[i] > 8) covered++
          }
          return {
            coveragePct: Math.round((covered / sampled) * 1000) / 10,
            glError: gl.getError(),
            triangles: geometry.attributes.position.count / 3,
          }
        }
      }

      let start = 0
      let raf = 0
      let watchdog = 0
      let done = false
      let pausedAt = 0
      let started = false

      const tick = () => {
        const t = (performance.now() - start) / 1000
        renderFrame(t)
        if (t >= T.end && !done) {
          done = true
          finish()
          return
        }
        raf = requestAnimationFrame(tick)
      }

      const beginTimeline = () => {
        started = true
        start = performance.now()
        raf = requestAnimationFrame(tick)
        // Wall-clock safety net: the overlay can never get stuck even if rAF
        // is throttled mid-play.
        watchdog = window.setTimeout(() => finish(), (T.end + 3) * 1000)
      }

      // Pause rendering in a hidden tab and preserve the timeline position.
      const onVisibilityChange = () => {
        if (document.hidden) {
          if (started && !pausedAt) {
            pausedAt = performance.now()
            cancelAnimationFrame(raf)
          }
        } else if (!started) {
          beginTimeline()
        } else if (pausedAt) {
          start += performance.now() - pausedAt
          pausedAt = 0
          raf = requestAnimationFrame(tick)
        }
      }
      document.addEventListener('visibilitychange', onVisibilityChange)
      if (!document.hidden) beginTimeline()

      return () => {
        cancelAnimationFrame(raf)
        window.clearTimeout(watchdog)
        document.removeEventListener('visibilitychange', onVisibilityChange)
        window.removeEventListener('resize', onResize)
        if (process.env.NODE_ENV !== 'production') {
          delete (window as unknown as Record<string, unknown>).__prismaIntro
        }
        geometry.dispose()
        material.dispose()
        wordmark.dispose()
        renderer.forceContextLoss()
        renderer.dispose()
        if (renderer.domElement.parentNode === mount) {
          mount.removeChild(renderer.domElement)
        }
      }
    }

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow
      document.body.style.overflow = previousBodyOverflow
      cleanup()
    }
  }, [active])

  if (!active) return null

  return (
    <div
      aria-hidden="true"
      className="prisma-intro-overlay fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
    >
      <div
        ref={backdropRef}
        className="absolute inset-0 overflow-hidden"
        style={{ background: OBSIDIAN, willChange: 'clip-path' }}
      >
        {/* Copper furnace light stays inside the receding opaque field. */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[120vmax] w-[120vmax] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              'radial-gradient(circle at center, rgba(184,115,51,0.28) 0%, rgba(184,115,51,0.08) 32%, transparent 62%)',
          }}
        />
      </div>
      {/* three.js canvas mounts here */}
      <div ref={mountRef} className="absolute inset-0" />

      {/* HUD readout — real loading feedback */}
      <div
        ref={hudRef}
        className="pointer-events-none absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <div className="font-mono text-[0.65rem] uppercase tracking-[0.35em] text-[#c2d0d8]/70">
          {phase === 'break' ? 'Fundiendo cristal' : 'Reconstruyendo'}
        </div>
        <div className="flex items-center gap-3">
          <div className="h-px w-24 overflow-hidden bg-[#c2d0d8]/15">
            <div
              className="h-full bg-[#d18a45] transition-[width] duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="font-mono text-[0.7rem] tabular-nums text-[#d18a45]">
            {String(progress).padStart(3, '0')}%
          </span>
        </div>
      </div>
    </div>
  )
}

const NAV_T = {
  form: 0.08,
  shatter: 0.42,
  hold: 0.52,
  reconstruct: 1.02,
  end: 1.26,
}

export type GlassImpact = { x: number; y: number }

/**
 * Short, interaction-driven version of the loading fracture. It reuses the
 * same shard geometry and shader, but has no HUD and never locks page scroll.
 * Once the pane becomes fully covered, onCovered swaps the real DOM target;
 * the returning shards and receding mask then reveal that target itself.
 */
export function GlassNavigationTransition({
  onCovered,
  onComplete,
}: {
  onCovered: (impact: GlassImpact) => void
  onComplete: () => void
}) {
  const mountRef = React.useRef<HTMLDivElement | null>(null)
  const backdropRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const saveData = Boolean(
      (
        navigator as Navigator & {
          connection?: { saveData?: boolean }
        }
      ).connection?.saveData,
    )
    if (reduce || saveData || !hasWebGL()) {
      onCovered({ x: 50, y: 50 })
      onComplete()
      return
    }

    const mount = mountRef.current
    if (!mount) {
      onCovered({ x: 50, y: 50 })
      onComplete()
      return
    }

    let impactPoint: GlassImpact = { x: 50, y: 50 }
    let covered = false
    const cover = () => {
      if (covered) return
      covered = true
      onCovered(impactPoint)
    }
    let finished = false
    const finish = () => {
      if (finished) return
      finished = true
      cover()
      onComplete()
    }

    const scene = new THREE.Scene()
    const aspect = window.innerWidth / window.innerHeight
    const camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 100)
    camera.position.z = 6

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: 'high-performance',
      })
    } catch {
      finish()
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    const vH = 2 * camera.position.z * Math.tan((50 * Math.PI) / 360)
    const vW = vH * aspect
    const paneW = vW * 1.55
    const paneH = vH * 1.55
    const seed = randomSeed()
    const rand = mulberry32(seed ^ 0x9e3779b9)
    const impact = new THREE.Vector2(
      paneW * (-0.14 + rand() * 0.28),
      paneH * (-0.11 + rand() * 0.22),
    )
    impactPoint = {
      x: 50 + (impact.x / vW) * 100,
      y: 50 - (impact.y / vH) * 100,
    }
    const geometry = buildShardGeometry(
      paneW,
      paneH,
      impact,
      seed ^ 0x85ebca6b,
    )
    const emptyTexture = new THREE.DataTexture(
      new Uint8Array([0, 0, 0, 0]),
      1,
      1,
      THREE.RGBAFormat,
    )
    emptyTexture.needsUpdate = true

    const uniforms = {
      uShatter: { value: 0 },
      uImpact: { value: impact },
      uTex: { value: emptyTexture },
      uFrost: { value: FROST },
      uCopper: { value: COPPER },
      uOpacity: { value: 0 },
      uReveal: { value: 0 },
      uGlint: { value: 0 },
    }
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
    scene.add(new THREE.Mesh(geometry, material))

    const setBackdrop = (reveal: number, opacity: number) => {
      const backdrop = backdropRef.current
      if (!backdrop) return
      const xPct = impactPoint.x
      const yPct = impactPoint.y
      const impactX = (xPct / 100) * window.innerWidth
      const impactY = (yPct / 100) * window.innerHeight
      const farX = Math.max(impactX, window.innerWidth - impactX)
      const farY = Math.max(impactY, window.innerHeight - impactY)
      const radius = Math.hypot(farX, farY) * 1.04 * (1 - reveal)
      backdrop.style.opacity = String(opacity)
      backdrop.style.clipPath = `circle(${Math.max(0, radius)}px at ${xPct}% ${yPct}%)`
    }

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    const start = performance.now()
    let raf = 0
    let watchdog = 0
    const tick = () => {
      const t = (performance.now() - start) / 1000
      let shatter = 0
      let opacity = 1
      let reveal = 0
      let backdropOpacity = 0

      if (t < NAV_T.form) {
        opacity = t / NAV_T.form
      } else if (t < NAV_T.shatter) {
        const k = (t - NAV_T.form) / (NAV_T.shatter - NAV_T.form)
        shatter = easeInOutCubic(k)
        backdropOpacity = easeInOutCubic(k)
      } else if (t < NAV_T.hold) {
        cover()
        shatter = 1
        backdropOpacity = 1
      } else if (t < NAV_T.reconstruct) {
        cover()
        const k = (t - NAV_T.hold) /
          (NAV_T.reconstruct - NAV_T.hold)
        shatter = 1 - easeInOutCubic(k)
        reveal = easeInOutCubic(Math.max(0, (k - 0.04) / 0.96))
        backdropOpacity = 1
      } else {
        const k = Math.min(
          1,
          (t - NAV_T.reconstruct) / (NAV_T.end - NAV_T.reconstruct),
        )
        reveal = 1
        opacity = 1 - easeInOutCubic(k)
        backdropOpacity = 1 - easeInOutCubic(k)
        uniforms.uGlint.value = k
      }

      uniforms.uShatter.value = shatter
      uniforms.uOpacity.value = opacity
      uniforms.uReveal.value = reveal
      setBackdrop(reveal, backdropOpacity)
      renderer.render(scene, camera)

      if (t >= NAV_T.end) {
        finish()
        return
      }
      raf = requestAnimationFrame(tick)
    }

    try {
      renderer.compile(scene, camera)
    } catch {
      geometry.dispose()
      material.dispose()
      emptyTexture.dispose()
      renderer.forceContextLoss()
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement)
      }
      finish()
      return
    }
    raf = requestAnimationFrame(tick)
    watchdog = window.setTimeout(finish, 2100)

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(watchdog)
      window.removeEventListener('resize', onResize)
      geometry.dispose()
      material.dispose()
      emptyTexture.dispose()
      renderer.forceContextLoss()
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [onComplete, onCovered])

  return (
    <div
      aria-hidden="true"
      data-prisma-navigation-transition="webgl"
      className="pointer-events-none fixed inset-0 z-[90] overflow-hidden"
    >
      <div
        ref={backdropRef}
        className="absolute inset-0 opacity-0"
        style={{
          background:
            'radial-gradient(circle at center, rgba(184,115,51,0.12), rgba(16,15,13,0.96) 64%)',
          willChange: 'clip-path, opacity',
        }}
      />
      <div ref={mountRef} className="absolute inset-0" />
    </div>
  )
}
