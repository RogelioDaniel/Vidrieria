'use client'

import * as React from 'react'
import Image from 'next/image'
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type GlassEffect =
  | 'impact'
  | 'mirror-flip'
  | 'mosaic'
  | 'vertical-split'
  | 'tile-dissolve'
  | 'hinge'

type GlassSlide = {
  id: string
  src: string
  alt: string
  label: string
  material: string
  detail: string
  effect: GlassEffect
  sourceAspect: number
}

const GLASS_SLIDES: readonly GlassSlide[] = [
  {
    id: 'bronce',
    src: '/images/hero-glass-3x4.png',
    alt: 'Panel de cristal traslúcido con acabado cobrizo iluminado en el taller',
    label: 'Cristal bronce',
    material: 'Traslúcida',
    detail: '10 mm',
    effect: 'impact',
    sourceAspect: 3 / 4,
  },
  {
    id: 'espejo',
    src: '/images/project-espejo.png',
    alt: 'Espejo circular de autor con marco metálico e iluminación posterior',
    label: 'Espejo de autor',
    material: 'Reflejante',
    detail: '6 mm',
    effect: 'mirror-flip',
    sourceAspect: 1,
  },
  {
    id: 'vitral',
    src: '/images/project-vitral.png',
    alt: 'Vitral artesanal geométrico en tonos ámbar y humo',
    label: 'Vitral artesanal',
    material: 'Emplomado',
    detail: 'Pieza única',
    effect: 'mosaic',
    sourceAspect: 1,
  },
  {
    id: 'mampara',
    src: '/images/project-mampara.png',
    alt: 'Mampara de cristal transparente instalada en un baño contemporáneo',
    label: 'Mampara templada',
    material: 'Extra claro',
    detail: '9 mm',
    effect: 'vertical-split',
    sourceAspect: 1,
  },
  {
    id: 'fachada',
    src: '/images/project-fachada.png',
    alt: 'Fachada arquitectónica de cristal que refleja la ciudad al atardecer',
    label: 'Fachada reflectante',
    material: 'Control solar',
    detail: 'Doble vidrio',
    effect: 'tile-dissolve',
    sourceAspect: 1,
  },
  {
    id: 'puerta',
    src: '/images/project-puerta.png',
    alt: 'Puerta pivotante de cristal enmarcada en una fachada azul',
    label: 'Puerta de cristal',
    material: 'Templado',
    detail: '12 mm',
    effect: 'hinge',
    sourceAspect: 1,
  },
]

const COLS = 5
const ROWS = 6
const PANEL_ASPECT = 3 / 4
const ease = [0.65, 0, 0.35, 1] as const

type ConnectionWithSaveData = EventTarget & {
  saveData?: boolean
}

function seededRand(seed: number) {
  let value = seed >>> 0
  return () => {
    value += 0x6d2b79f5
    let mixed = value
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1)
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61)
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296
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

function shuffledSlides() {
  const result = [...GLASS_SLIDES]
  const rand = seededRand(randomSeed())
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function shardTarget(
  effect: GlassEffect,
  row: number,
  col: number,
  seed: number,
) {
  const rand = seededRand(seed + row * COLS * 97 + col * 193 + 41)
  const seedRand = seededRand(seed ^ 0x9e3779b9)
  const impactX = 0.2 + seedRand() * 0.6
  const impactY = 0.2 + seedRand() * 0.6
  const xNorm = (col + 0.5) / COLS
  const yNorm = (row + 0.5) / ROWS
  const centerX = xNorm - 0.5
  const centerY = yNorm - 0.5
  const fromImpactX = xNorm - impactX
  const fromImpactY = yNorm - impactY
  const distance = Math.hypot(fromImpactX, fromImpactY)
  const jitterX = rand() * 2 - 1
  const jitterY = rand() * 2 - 1
  const turn = rand() * 2 - 1

  switch (effect) {
    case 'mirror-flip':
      return {
        x: centerX * 28 + jitterX * 10,
        y: jitterY * 14,
        rotate: turn * 8,
        rotateX: jitterY * 16,
        rotateY: (col % 2 === 0 ? -1 : 1) * (82 + rand() * 34),
        scale: 0.92,
        opacity: 0.12,
        delay: Math.min(0.34, Math.abs(centerX) * 0.42),
        origin: col < COLS / 2 ? 'right center' : 'left center',
      }
    case 'mosaic':
      return {
        x: centerX * 72 + jitterX * 18,
        y: centerY * 68 + jitterY * 16,
        rotate: turn * 24,
        rotateX: jitterY * 28,
        rotateY: jitterX * 28,
        scale: 0.88,
        opacity: 0.18,
        delay: Math.min(0.35, distance * 0.4),
        origin: 'center',
      }
    case 'vertical-split': {
      const direction = col < COLS / 2 ? -1 : 1
      return {
        x: direction * (58 + Math.abs(centerX) * 55 + rand() * 20),
        y: jitterY * 10,
        rotate: turn * 5,
        rotateX: 0,
        rotateY: direction * (42 + rand() * 24),
        scale: 0.96,
        opacity: 0.14,
        delay: Math.min(0.34, Math.abs(centerX) * 0.5),
        origin: direction < 0 ? 'right center' : 'left center',
      }
    }
    case 'tile-dissolve':
      return {
        x: jitterX * 34,
        y: 54 + row * 12 + rand() * 42,
        rotate: turn * 32,
        rotateX: jitterY * 34,
        rotateY: jitterX * 34,
        scale: 0.72,
        opacity: 0,
        delay: Math.min(0.38, row * 0.045 + rand() * 0.08),
        origin: 'center',
      }
    case 'hinge': {
      const direction = col < COLS / 2 ? -1 : 1
      return {
        x: direction * (24 + Math.abs(centerX) * 38),
        y: jitterY * 8,
        rotate: turn * 4,
        rotateX: 0,
        rotateY: direction * (74 + col * 5 + rand() * 18),
        scale: 0.95,
        opacity: 0.16,
        delay: Math.min(0.36, col * 0.055),
        origin: direction < 0 ? 'right center' : 'left center',
      }
    }
    case 'impact':
    default: {
      const safeDistance = Math.max(distance, 0.08)
      return {
        x:
          (fromImpactX / safeDistance) * (64 + distance * 94) + jitterX * 20,
        y:
          (fromImpactY / safeDistance) * (58 + distance * 82) +
          jitterY * 18 -
          10,
        rotate: turn * 42,
        rotateX: jitterY * 38,
        rotateY: jitterX * 38,
        scale: 0.86,
        opacity: 0.06,
        delay: Math.min(0.36, distance * 0.46),
        origin: 'center',
      }
    }
  }
}

function shardBackground(slide: GlassSlide, row: number, col: number) {
  const coverWidth =
    slide.sourceAspect >= PANEL_ASPECT
      ? COLS * (slide.sourceAspect / PANEL_ASPECT)
      : COLS
  const coverHeight =
    slide.sourceAspect >= PANEL_ASPECT
      ? ROWS
      : ROWS * (PANEL_ASPECT / slide.sourceAspect)
  const imageX = (COLS - coverWidth) / 2
  const imageY = (ROWS - coverHeight) / 2
  const positionX =
    coverWidth === 1 ? 50 : ((imageX - col) / (1 - coverWidth)) * 100
  const positionY =
    coverHeight === 1 ? 50 : ((imageY - row) / (1 - coverHeight)) * 100

  return {
    backgroundImage: `url("${slide.src}")`,
    backgroundSize: `${coverWidth * 100}% ${coverHeight * 100}%`,
    backgroundPosition: `${positionX}% ${positionY}%`,
    backgroundRepeat: 'no-repeat',
  }
}

function GlassShard({
  slide,
  row,
  col,
  seed,
  progress,
  moving,
}: {
  slide: GlassSlide
  row: number
  col: number
  seed: number
  progress: MotionValue<number>
  moving: boolean
}) {
  const target = React.useMemo(
    () => shardTarget(slide.effect, row, col, seed),
    [slide.effect, row, col, seed],
  )
  const input = React.useMemo(
    () => [target.delay, 1] as [number, number],
    [target.delay],
  )
  const x = useTransform(progress, input, [0, target.x], { clamp: true })
  const y = useTransform(progress, input, [0, target.y], { clamp: true })
  const rotate = useTransform(progress, input, [0, target.rotate], {
    clamp: true,
  })
  const rotateX = useTransform(progress, input, [0, target.rotateX], {
    clamp: true,
  })
  const rotateY = useTransform(progress, input, [0, target.rotateY], {
    clamp: true,
  })
  const scale = useTransform(progress, input, [1, target.scale], {
    clamp: true,
  })
  const opacity = useTransform(
    progress,
    [0, Math.min(0.92, target.delay + 0.06), 1],
    [1, 1, target.opacity],
    { clamp: true },
  )

  return (
    <motion.div
      aria-hidden="true"
      className="h-full w-full bg-[#100f0d] [backface-visibility:hidden]"
      style={{
        ...shardBackground(slide, row, col),
        x,
        y,
        rotate,
        rotateX,
        rotateY,
        scale,
        opacity,
        transformOrigin: target.origin,
        transformStyle: 'preserve-3d',
        willChange: moving ? 'transform, opacity' : 'auto',
      }}
    />
  )
}

export function HeroGlassCarousel() {
  const reduce = useReducedMotion()
  const [slides, setSlides] = React.useState<readonly GlassSlide[]>(GLASS_SLIDES)
  const [position, setPosition] = React.useState(0)
  const [mounted, setMounted] = React.useState(false)
  const [saveData, setSaveData] = React.useState(false)
  const [hovered, setHovered] = React.useState(false)
  const [focused, setFocused] = React.useState(false)
  const [inView, setInView] = React.useState(true)
  const [pageVisible, setPageVisible] = React.useState(true)
  const [autoEnabled, setAutoEnabled] = React.useState(true)
  const [busy, setBusy] = React.useState(false)
  const [moving, setMoving] = React.useState(false)
  const [seed, setSeed] = React.useState(11)
  const [announcement, setAnnouncement] = React.useState('')
  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const pointerStartRef = React.useRef<{
    id: number
    x: number
    y: number
  } | null>(null)
  const animationRef = React.useRef<{ stop: () => void } | null>(null)
  const holdTimerRef = React.useRef<number | null>(null)
  const frameRefs = React.useRef<number[]>([])
  const actionRef = React.useRef(0)
  const autoStepsRef = React.useRef(0)
  const preloadersRef = React.useRef<HTMLImageElement[]>([])
  const fracture = useMotionValue(0)
  const fallbackOpacity = useTransform(fracture, [0, 0.035], [1, 0], {
    clamp: true,
  })
  const staticMode = Boolean(reduce) || saveData
  const slide = slides[position] ?? GLASS_SLIDES[0]

  const clearScheduledFrames = React.useCallback(() => {
    frameRefs.current.forEach((frame) => cancelAnimationFrame(frame))
    frameRefs.current = []
  }, [])

  const clearHoldTimer = React.useCallback(() => {
    if (holdTimerRef.current !== null) {
      window.clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }
  }, [])

  const stopAnimation = React.useCallback(() => {
    animationRef.current?.stop()
    animationRef.current = null
    clearScheduledFrames()
    clearHoldTimer()
  }, [clearHoldTimer, clearScheduledFrames])

  const animateFracture = React.useCallback(
    (
      target: number,
      duration: number,
      action: number,
      onComplete?: () => void,
    ) => {
      animationRef.current?.stop()
      setMoving(true)
      animationRef.current = animate(fracture, target, {
        duration,
        ease,
        onComplete: () => {
          if (action !== actionRef.current) return
          animationRef.current = null
          setMoving(false)
          onComplete?.()
        },
      })
    },
    [fracture],
  )

  const rebuildAfterSlideSwap = React.useCallback(
    (action: number) => {
      const first = requestAnimationFrame(() => {
        const second = requestAnimationFrame(() => {
          frameRefs.current = []
          if (action !== actionRef.current) return
          animateFracture(0, 0.56, action, () => setBusy(false))
        })
        frameRefs.current.push(second)
      })
      frameRefs.current.push(first)
    },
    [animateFracture],
  )

  const changeSlide = React.useCallback(
    (step: number, manual: boolean) => {
      if (busy || slides.length < 2) return
      if (manual) {
        setAutoEnabled(false)
      } else {
        autoStepsRef.current += 1
        if (autoStepsRef.current >= slides.length - 1) setAutoEnabled(false)
      }

      const nextPosition =
        (position + step + slides.length) % slides.length
      const nextSlide = slides[nextPosition]
      if (manual) setAnnouncement(`Muestra: ${nextSlide.label}`)

      const action = ++actionRef.current
      stopAnimation()
      setBusy(true)
      setSeed(randomSeed())

      if (staticMode) {
        fracture.set(0)
        setPosition(nextPosition)
        setBusy(false)
        return
      }

      animateFracture(1, 0.42, action, () => {
        if (action !== actionRef.current) return
        setPosition(nextPosition)
        setSeed(randomSeed())
        rebuildAfterSlideSwap(action)
      })
    },
    [
      animateFracture,
      busy,
      fracture,
      position,
      rebuildAfterSlideSwap,
      slides,
      staticMode,
      stopAnimation,
    ],
  )

  const playTouchFracture = React.useCallback(() => {
    setAutoEnabled(false)
    if (staticMode || busy) return
    const action = ++actionRef.current
    stopAnimation()
    setBusy(true)
    setSeed(randomSeed())
    animateFracture(1, 0.34, action, () => {
      holdTimerRef.current = window.setTimeout(() => {
        holdTimerRef.current = null
        if (action !== actionRef.current) return
        animateFracture(0, 0.5, action, () => setBusy(false))
      }, 110)
    })
  }, [animateFracture, busy, staticMode, stopAnimation])

  React.useEffect(() => {
    setSlides(shuffledSlides())
    setSeed(randomSeed())
    setMounted(true)
  }, [])

  React.useEffect(() => {
    const connection = (
      navigator as Navigator & { connection?: ConnectionWithSaveData }
    ).connection
    const sync = () => setSaveData(Boolean(connection?.saveData))
    sync()
    connection?.addEventListener('change', sync)
    return () => connection?.removeEventListener('change', sync)
  }, [])

  React.useEffect(() => {
    if (!staticMode) return
    actionRef.current += 1
    stopAnimation()
    fracture.set(0)
    setBusy(false)
    setMoving(false)
  }, [fracture, staticMode, stopAnimation])

  React.useEffect(() => {
    const root = rootRef.current
    if (!root || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting && entry.intersectionRatio > 0.25),
      { threshold: [0, 0.25, 0.6] },
    )
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  React.useEffect(() => {
    const sync = () => setPageVisible(!document.hidden)
    sync()
    document.addEventListener('visibilitychange', sync)
    return () => document.removeEventListener('visibilitychange', sync)
  }, [])

  React.useEffect(() => {
    if (!mounted || staticMode || !slides.length) return
    const candidates = [
      slide,
      slides[(position + 1) % slides.length],
      slides[(position - 1 + slides.length) % slides.length],
    ]
    const preloaders = candidates.map((candidate) => {
      const image = new window.Image()
      image.src = candidate.src
      return image
    })
    preloadersRef.current.push(...preloaders)
    return () => {
      preloaders.forEach((image) => {
        image.onload = null
        image.onerror = null
      })
      preloadersRef.current = preloadersRef.current.filter(
        (image) => !preloaders.includes(image),
      )
    }
  }, [mounted, position, slide, slides, staticMode])

  React.useEffect(() => {
    if (
      !mounted ||
      staticMode ||
      !autoEnabled ||
      hovered ||
      focused ||
      busy ||
      moving ||
      !inView ||
      !pageVisible
    ) {
      return
    }
    const timer = window.setTimeout(() => changeSlide(1, false), 8000)
    return () => window.clearTimeout(timer)
  }, [
    autoEnabled,
    busy,
    changeSlide,
    focused,
    hovered,
    inView,
    mounted,
    moving,
    pageVisible,
    staticMode,
  ])

  React.useEffect(
    () => () => {
      actionRef.current += 1
      animationRef.current?.stop()
      clearScheduledFrames()
      clearHoldTimer()
      preloadersRef.current.forEach((image) => {
        image.onload = null
        image.onerror = null
      })
      preloadersRef.current = []
    },
    [clearHoldTimer, clearScheduledFrames],
  )

  const handlePointerEnter = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== 'mouse') return
    setHovered(true)
    if (staticMode || busy) return
    const action = ++actionRef.current
    stopAnimation()
    setSeed(randomSeed())
    animateFracture(1, 0.46, action)
  }

  const handlePointerLeave = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== 'mouse') return
    setHovered(false)
    if (staticMode || busy) return
    const action = ++actionRef.current
    stopAnimation()
    animateFracture(0, 0.58, action)
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'mouse') return
    pointerStartRef.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    }
  }

  const handlePointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'mouse') return
    const start = pointerStartRef.current
    pointerStartRef.current = null
    if (!start || start.id !== event.pointerId) return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy) * 1.25) {
      changeSlide(dx < 0 ? 1 : -1, true)
      return
    }
    if (Math.abs(dy) < 24) playTouchFracture()
  }

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carrusel"
      aria-label="Muestras de vidrio"
      className="relative h-full w-full"
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setFocused(false)
        }
      }}
    >
      <div
        aria-hidden="true"
        className="copper-pulse pointer-events-none absolute -inset-6 rounded-[2rem] opacity-70"
        style={{
          background:
            'radial-gradient(circle at 50% 45%, rgba(209,138,69,0.55) 0%, rgba(184,115,51,0.18) 40%, transparent 70%)',
        }}
      />

      <button
        type="button"
        aria-label={`Romper y reconstruir la muestra ${slide.label}`}
        className="glass-panel relative block h-full w-full cursor-pointer overflow-hidden rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-[#d18a45] focus-visible:ring-offset-2 focus-visible:ring-offset-[#100f0d]"
        style={{ touchAction: 'pan-y', perspective: '900px' }}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          pointerStartRef.current = null
        }}
        onClick={(event) => {
          if (event.detail === 0) playTouchFracture()
        }}
      >
        <motion.div className="absolute inset-0" style={{ opacity: staticMode ? 1 : fallbackOpacity }}>
          <Image
            key={slide.id}
            src={slide.src}
            alt={slide.alt}
            fill
            unoptimized
            sizes="(max-width: 1024px) 32svh, 30vw"
            className="object-cover"
          />
        </motion.div>

        {!staticMode && (
          <div
            aria-hidden="true"
            className="absolute inset-0 grid overflow-visible"
            style={{
              gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
              transformStyle: 'preserve-3d',
            }}
          >
            {Array.from({ length: ROWS }).map((_, row) =>
              Array.from({ length: COLS }).map((__, col) => (
                <GlassShard
                  key={`${slide.id}-${seed}-${row}-${col}`}
                  slide={slide}
                  row={row}
                  col={col}
                  seed={seed}
                  progress={fracture}
                  moving={moving}
                />
              )),
            )}
          </div>
        )}

        <div aria-hidden="true" className="absolute left-3 top-3 h-4 w-4 border-l border-t border-white/50" />
        <div aria-hidden="true" className="absolute right-3 top-3 h-4 w-4 border-r border-t border-white/50" />
        <div aria-hidden="true" className="absolute bottom-3 left-3 h-4 w-4 border-b border-l border-white/50" />
        <div aria-hidden="true" className="absolute bottom-3 right-3 h-4 w-4 border-b border-r border-white/50" />
        <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap bg-[#100f0d]/55 px-2 py-1 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-white/85 backdrop-blur-sm">
          {slide.label}
        </div>
      </button>

      <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20 flex items-center justify-between">
        <button
          type="button"
          aria-label="Muestra anterior"
          className="pointer-events-auto inline-flex h-11 w-11 cursor-pointer items-center justify-center border border-white/30 bg-[#100f0d]/75 text-white transition-colors hover:border-[#d18a45] hover:bg-[#100f0d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d18a45] disabled:cursor-wait disabled:opacity-50"
          disabled={busy}
          onClick={() => changeSlide(-1, true)}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <div className="pointer-events-none bg-[#100f0d]/75 px-3 py-2 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-white/85 backdrop-blur-sm">
          {String(position + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
        </div>
        <button
          type="button"
          aria-label="Siguiente muestra"
          className="pointer-events-auto inline-flex h-11 w-11 cursor-pointer items-center justify-center border border-white/30 bg-[#100f0d]/75 text-white transition-colors hover:border-[#d18a45] hover:bg-[#100f0d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d18a45] disabled:cursor-wait disabled:opacity-50"
          disabled={busy}
          onClick={() => changeSlide(1, true)}
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="glass-panel pointer-events-none absolute -right-4 top-1/3 hidden px-3 py-2 sm:block">
        <div className="hud-label text-[#b87333]">{slide.material}</div>
        <div className="font-mono text-[0.7rem] text-[#100f0d] dark:text-[#e6e8ea]">
          {slide.detail}
        </div>
      </div>
      <div className="glass-panel pointer-events-none absolute -left-6 bottom-1/4 hidden px-3 py-2 sm:block">
        <div className="hud-label text-[#b87333]">pieza</div>
        <div className="font-mono text-[0.7rem] text-[#100f0d] dark:text-[#e6e8ea]">
          {String(position + 1).padStart(3, '0')}
        </div>
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
    </div>
  )
}
