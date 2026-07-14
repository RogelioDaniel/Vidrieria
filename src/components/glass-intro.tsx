'use client'

/**
 * GlassIntro — PRISMA's signature loading overture.
 *
 * A single frosted pane bearing the wordmark shatters from an impact point
 * (the "loading" beat), the shards hang in the copper light, then reverse and
 * *reconstruct* into the intact pane before the whole thing dissolves to reveal
 * the site. Built on one BufferGeometry of triangular shards driven by a custom
 * shader — the entire shatter is a single draw call (per ui-ux-pro-max's
 * threejs guideline: never one Mesh per shard).
 *
 * Plays once per browser session (sessionStorage). Respects prefers-reduced-
 * motion and silently no-ops if WebGL is unavailable — the page is always
 * revealed either way.
 */

import * as React from 'react'
import * as THREE from 'three'

const SESSION_KEY = 'prisma-intro-shown'

// Palette (mirrors globals.css design tokens)
const FROST = new THREE.Color('#c2d0d8')
const COPPER = new THREE.Color('#d18a45')
const OBSIDIAN = '#100f0d'

// Fracture resolution
const RINGS = 8
const SECTORS = 20

// Timeline (seconds)
const T = {
  formIn: 0.45, // pane fades in intact
  shatter: 1.35, // explode outward — the "loading" break
  hold: 1.75, // shards suspended, progress fills
  reconstruct: 2.95, // shards fly back, pane reforms
  reveal: 3.35, // refraction flash + dissolve
  end: 3.75, // remove from DOM
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
) {
  const rand = mulberry32(0xc0ffee)
  const maxR = Math.hypot(paneW / 2, paneH / 2) * 1.08

  // Shared node grid so the assembled pane is seamless (no gaps).
  // nodes[k][j] for ring k (0=impact center) and sector j.
  const nodes: THREE.Vector2[][] = []
  for (let k = 0; k <= RINGS; k++) {
    const row: THREE.Vector2[] = []
    const radius = maxR * Math.pow(k / RINGS, 1.35)
    for (let j = 0; j < SECTORS; j++) {
      if (k === 0) {
        row.push(impact.clone())
        continue
      }
      const jitterA = (rand() - 0.5) * ((Math.PI * 2) / SECTORS) * 0.55
      const jitterR = 1 + (rand() - 0.5) * 0.28
      const ang = (j / SECTORS) * Math.PI * 2 + jitterA
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
  ) => {
    const tri = [a, b, cc]
    for (let i = 0; i < 3; i++) {
      const p = tri[i]
      positions.push(p.x, p.y, 0)
      centroids.push(centroid.x, centroid.y, 0)
      barys.push(B[i][0], B[i][1], B[i][2])
      randoms.push(rnd[0], rnd[1], rnd[2])
      delays.push(delay)
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
      // crack propagates outward → inner shards break first
      const delay = k / RINGS

      if (k === 0) {
        // triangle fan at the impact core (p00 === p01 === center)
        pushTri(nodes[0][0], p10, p11, centroid, rnd, delay)
      } else {
        pushTri(p00, p10, p11, centroid, rnd, delay)
        pushTri(p00, p11, p01, centroid, rnd, delay)
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
  geo.setAttribute('aUv', new THREE.Float32BufferAttribute(uvs, 2))
  return geo
}

// Small deterministic PRNG so the fracture pattern is stable.
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

const VERT = /* glsl */ `
  attribute vec3 aCentroid;
  attribute vec3 aBary;
  attribute vec3 aRandom;
  attribute float aDelay;
  attribute vec2 aUv;

  uniform float uShatter;
  uniform vec2 uImpact;

  varying vec3 vBary;
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
  uniform float uFlash;

  varying vec3 vBary;
  varying vec2 vUv;
  varying float vShatter;
  varying float vDist;

  void main() {
    // Frosted base
    vec3 col = mix(uFrost * 0.42, uFrost * 0.72, 0.5);

    // Copper light pooling around the impact
    float glow = exp(-vDist * 0.55);
    col = mix(col, uCopper, glow * 0.55);

    // Etched wordmark
    vec4 tex = texture2D(uTex, vUv);
    col = mix(col, vec3(0.96, 0.97, 0.98), tex.a * 0.92);

    // Facet edges catching light — stronger as shards separate
    float e = min(vBary.x, min(vBary.y, vBary.z));
    float edge = 1.0 - smoothstep(0.0, 0.045, e);
    col += edge * (0.35 + vShatter * 0.65) * vec3(1.0, 0.9, 0.74);

    // Reveal flash
    col += uFlash * vec3(1.0, 0.97, 0.92);

    float alpha = (0.82 + edge * 0.18) * uOpacity;
    gl_FragColor = vec4(col, alpha);
  }
`

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext('webgl') || c.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}

export function GlassIntro() {
  const [active, setActive] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [phase, setPhase] = React.useState<'break' | 'rebuild'>('break')
  const mountRef = React.useRef<HTMLDivElement | null>(null)

  // Decide whether to play (client-only, once per session).
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const force = new URLSearchParams(window.location.search).has('intro')
    const seen = sessionStorage.getItem(SESSION_KEY)
    if (seen && !force) return
    setActive(true)
  }, [])

  // Run the overture only once the overlay (and its mount point) is in the DOM.
  React.useEffect(() => {
    if (!active) return

    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    document.body.style.overflow = 'hidden'

    let cleanup = () => {}
    if (reduce || !hasWebGL()) {
      // Accessible fallback: brief branded fade, then reveal.
      const to = window.setTimeout(() => finish(), 900)
      cleanup = () => window.clearTimeout(to)
    } else {
      cleanup = runThree()
    }

    function finish() {
      sessionStorage.setItem(SESSION_KEY, '1')
      document.body.style.overflow = ''
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
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setClearColor(0x000000, 0)
      mount.appendChild(renderer.domElement)

      // Pane sized to over-cover the viewport at z=0.
      const vH = 2 * camera.position.z * Math.tan((50 * Math.PI) / 360)
      const vW = vH * aspect
      const paneW = vW * 1.55
      const paneH = vH * 1.55
      const impact = new THREE.Vector2(-paneW * 0.06, paneH * 0.05)

      const geometry = buildShardGeometry(paneW, paneH, impact)
      const wordmark = makeWordmarkTexture(paneW / paneH)

      const uniforms = {
        uShatter: { value: 0 },
        uImpact: { value: impact },
        uTex: { value: wordmark },
        uFrost: { value: FROST },
        uCopper: { value: COPPER },
        uOpacity: { value: 0 },
        uFlash: { value: 0 },
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

      // Map elapsed time → uniforms + HUD, then render one frame.
      const renderFrame = (t: number) => {
        let shatter = 0
        let opacity = 1
        let flash = 0

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
          // reverse — reconstruct the pane
          const k = (t - T.hold) / (T.reconstruct - T.hold)
          shatter = 1 - easeInOutCubic(k)
        } else if (t < T.reveal) {
          // crisp pane + refraction flash building
          shatter = 0
          const k = (t - T.reconstruct) / (T.reveal - T.reconstruct)
          flash = Math.sin(k * Math.PI) * 0.6
        } else {
          // dissolve to reveal the site
          const k = (t - T.reveal) / (T.end - T.reveal)
          shatter = 0
          opacity = 1 - easeInOutCubic(Math.min(k, 1))
          flash = (1 - k) * 0.25
        }

        uniforms.uShatter.value = shatter
        uniforms.uOpacity.value = opacity
        uniforms.uFlash.value = flash

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
      let onVis: (() => void) | null = null

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
        start = performance.now()
        raf = requestAnimationFrame(tick)
        // Wall-clock safety net: the overlay can never get stuck even if rAF
        // is throttled mid-play.
        watchdog = window.setTimeout(() => finish(), (T.end + 3) * 1000)
      }

      // rAF is paused while the tab is hidden — start the overture only once
      // the page is actually visible so the user never misses it.
      if (document.hidden) {
        onVis = () => {
          if (!document.hidden) {
            document.removeEventListener('visibilitychange', onVis!)
            onVis = null
            beginTimeline()
          }
        }
        document.addEventListener('visibilitychange', onVis)
      } else {
        beginTimeline()
      }

      return () => {
        cancelAnimationFrame(raf)
        window.clearTimeout(watchdog)
        if (onVis) document.removeEventListener('visibilitychange', onVis)
        window.removeEventListener('resize', onResize)
        if (process.env.NODE_ENV !== 'production') {
          delete (window as unknown as Record<string, unknown>).__prismaIntro
        }
        geometry.dispose()
        material.dispose()
        wordmark.dispose()
        renderer.dispose()
        if (renderer.domElement.parentNode === mount) {
          mount.removeChild(renderer.domElement)
        }
      }
    }

    return () => {
      document.body.style.overflow = ''
      cleanup()
    }
  }, [active])

  if (!active) return null

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{ background: OBSIDIAN }}
    >
      {/* copper ambient glow, echoing the hero */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[120vmax] w-[120vmax] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(circle at center, rgba(184,115,51,0.28) 0%, rgba(184,115,51,0.08) 32%, transparent 62%)',
        }}
      />
      {/* three.js canvas mounts here */}
      <div ref={mountRef} className="absolute inset-0" />

      {/* HUD readout — real loading feedback */}
      <div className="pointer-events-none absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2">
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
