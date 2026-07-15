'use client'

/**
 * SectionScroller — the "guided pages" modality.
 *
 * Replaces rigid CSS scroll-snap with a controlled glide: on desktop, once a
 * section is scrolled to its edge, the next wheel/keyboard gesture eases to the
 * neighbouring section (native smooth scroll) — tall sections (catálogo,
 * agenda) still scroll freely inside, so nothing gets hijacked. Touch devices
 * keep fully native scrolling.
 *
 * Every section change fires a themed glass transition that briefly covers the
 * viewport, hiding the reposition behind glass:
 *   · first change  → "assemble": frosted shards converge and build a pane,
 *                      then clear to reveal the next section.
 *   · later changes → "sweep": a frosted refraction band sweeps in the scroll
 *                      direction with a copper glint.
 *
 * A diamond dot-rail (desktop) mirrors the logo mark and tracks/jumps sections.
 */

import * as React from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'

const ease = [0.65, 0, 0.35, 1] as const
const LOCK_MS = 950

const SECTIONS = [
  { id: 'top', label: 'inicio' },
  { id: 'catalogo', label: 'catálogo' },
  { id: 'cotizador', label: 'cotizador' },
  { id: 'proyectos', label: 'obras' },
  { id: 'proceso', label: 'proceso' },
  { id: 'clientes', label: 'clientes' },
  { id: 'cita', label: 'agenda' },
  { id: 'contacto', label: 'contacto' },
]

type Transition = { key: number; effect: 'assemble' | 'sweep'; dir: 1 | -1 }

const SHARD_COLS = 6
const SHARD_ROWS = 4

function introLocked() {
  // GlassIntro locks scroll via a <style> that sets html overflow hidden.
  return getComputedStyle(document.documentElement).overflow === 'hidden'
}

export function SectionScroller() {
  const reduce = useReducedMotion()
  const [active, setActive] = React.useState(0)
  const [transition, setTransition] = React.useState<Transition | null>(null)

  const activeRef = React.useRef(0)
  const animatingRef = React.useRef(false)
  const settledRef = React.useRef(false)
  const programmaticTargetRef = React.useRef<number | null>(null)
  const transitionCountRef = React.useRef(0)
  const coarseRef = React.useRef(false)

  const els = React.useCallback(
    () => SECTIONS.map((s) => document.getElementById(s.id)),
    [],
  )

  const currentIndex = React.useCallback(() => {
    const centerY = window.innerHeight / 2
    const nodes = els()
    for (let i = 0; i < nodes.length; i++) {
      const el = nodes[i]
      if (!el) continue
      const r = el.getBoundingClientRect()
      if (r.top <= centerY && r.bottom >= centerY) return i
    }
    return activeRef.current
  }, [els])

  const play = React.useCallback(
    (from: number, to: number) => {
      if (reduce) return
      const effect: Transition['effect'] =
        transitionCountRef.current === 0 && !coarseRef.current
          ? 'assemble'
          : 'sweep'
      transitionCountRef.current += 1
      setTransition({ key: Date.now(), effect, dir: to > from ? 1 : -1 })
    },
    [reduce],
  )

  const goTo = React.useCallback(
    (to: number) => {
      const target = Math.max(0, Math.min(SECTIONS.length - 1, to))
      const from = activeRef.current
      if (target === from || animatingRef.current) return
      const el = document.getElementById(SECTIONS[target].id)
      if (!el) return

      animatingRef.current = true
      programmaticTargetRef.current = target
      play(from, target)
      activeRef.current = target
      setActive(target)
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })

      window.setTimeout(() => {
        animatingRef.current = false
        programmaticTargetRef.current = null
      }, LOCK_MS)
    },
    [play, reduce],
  )

  // Desktop wheel + keyboard: advance a section when the current one is at its
  // scroll edge; otherwise let native scroll roll through tall sections.
  React.useEffect(() => {
    coarseRef.current =
      typeof window !== 'undefined' &&
      window.matchMedia('(pointer: coarse)').matches

    const desktop = () =>
      !coarseRef.current && window.matchMedia('(pointer: fine)').matches

    const onWheel = (e: WheelEvent) => {
      if (reduce || !desktop() || introLocked()) return
      if (animatingRef.current) {
        e.preventDefault()
        return
      }
      const idx = currentIndex()
      const el = document.getElementById(SECTIONS[idx].id)
      if (!el) return
      const r = el.getBoundingClientRect()
      const atBottom = r.bottom <= window.innerHeight + 2
      const atTop = r.top >= -2

      if (e.deltaY > 6 && idx < SECTIONS.length - 1 && atBottom) {
        e.preventDefault()
        goTo(idx + 1)
      } else if (e.deltaY < -6 && idx > 0 && atTop) {
        e.preventDefault()
        goTo(idx - 1)
      }
    }

    const onKey = (e: KeyboardEvent) => {
      if (reduce || introLocked() || animatingRef.current) return
      const t = e.target as HTMLElement | null
      // Don't hijack arrows from form fields or ARIA widgets that use them
      // (Radix slider / select / listbox / menu in the quote & booking forms).
      if (
        t &&
        (t.isContentEditable ||
          t.closest(
            'input, textarea, select, [contenteditable], [role="slider"], [role="listbox"], [role="combobox"], [role="menu"], [role="menuitem"], [role="spinbutton"], [role="textbox"]',
          ))
      )
        return
      const idx = currentIndex()
      if (e.key === 'PageDown' || e.key === 'ArrowDown') {
        const el = document.getElementById(SECTIONS[idx].id)
        const atBottom = el
          ? el.getBoundingClientRect().bottom <= window.innerHeight + 2
          : true
        if (atBottom && idx < SECTIONS.length - 1) {
          e.preventDefault()
          goTo(idx + 1)
        }
      } else if (e.key === 'PageUp' || e.key === 'ArrowUp') {
        const el = document.getElementById(SECTIONS[idx].id)
        const atTop = el ? el.getBoundingClientRect().top >= -2 : true
        if (atTop && idx > 0) {
          e.preventDefault()
          goTo(idx - 1)
        }
      }
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
    }
  }, [currentIndex, goTo, reduce])

  // Active-section tracking. On native (touch) scroll this also fires the
  // transition; on programmatic glides goTo already fired it, so we skip.
  React.useEffect(() => {
    let raf = 0
    const compute = () => {
      raf = 0
      const idx = currentIndex()
      if (idx !== activeRef.current) {
        const from = activeRef.current
        activeRef.current = idx
        setActive(idx)
        if (settledRef.current && programmaticTargetRef.current === null) {
          play(from, idx)
        }
      }
      settledRef.current = true
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(compute)
    }
    compute()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [currentIndex, play])

  const jumpTo = (i: number) => goTo(i)
  const clearTransition = React.useCallback(() => setTransition(null), [])

  return (
    <>
      {transition && !reduce && (
        <GlassTransition
          key={transition.key}
          effect={transition.effect}
          dir={transition.dir}
          onDone={clearTransition}
        />
      )}

      <nav
        aria-label="Secciones"
        className="fixed right-5 top-1/2 z-[70] hidden -translate-y-1/2 flex-col items-center gap-1.5 lg:flex"
      >
        {SECTIONS.map((s, i) => {
          const isActive = active === i
          return (
            <button
              key={s.id}
              onClick={() => jumpTo(i)}
              aria-label={s.label}
              aria-current={isActive ? 'true' : undefined}
              className="group relative flex h-6 w-6 items-center justify-center"
            >
              <span
                className={`block rotate-45 border transition-all duration-300 ${
                  isActive
                    ? 'h-2.5 w-2.5 border-[#b87333] bg-[#b87333] shadow-[0_0_10px_rgba(184,115,51,0.6)]'
                    : 'h-1.5 w-1.5 border-[#7f858f] opacity-50 group-hover:opacity-100'
                }`}
              />
              <span className="pointer-events-none absolute right-7 whitespace-nowrap font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[#7f858f] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                {s.label}
              </span>
            </button>
          )
        })}
      </nav>
    </>
  )
}

/* ---------- transition overlays ---------- */

function GlassTransition({
  effect,
  dir,
  onDone,
}: {
  effect: 'assemble' | 'sweep'
  dir: 1 | -1
  onDone: () => void
}) {
  // Safety net: guarantee cleanup even if onAnimationComplete never fires
  // (e.g. the tab is backgrounded mid-transition and framer-motion pauses).
  React.useEffect(() => {
    const t = window.setTimeout(onDone, 1500)
    return () => window.clearTimeout(t)
  }, [onDone])

  if (effect === 'assemble') return <AssembleGlass onDone={onDone} />
  return <SweepGlass dir={dir} onDone={onDone} />
}

// Frosted shards converge from scattered positions into a full pane, then the
// pane clears — "gathering glass to build the next section".
function AssembleGlass({ onDone }: { onDone: () => void }) {
  const shards = React.useMemo(
    () =>
      Array.from({ length: SHARD_COLS * SHARD_ROWS }).map(() => ({
        x: (Math.random() - 0.5) * 180,
        y: (Math.random() - 0.5) * 180,
        r: (Math.random() - 0.5) * 90,
      })),
    [],
  )

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.01 } },
  }
  const shardV: Variants = {
    hidden: (c: { x: number; y: number; r: number }) => ({
      x: c.x,
      y: c.y,
      rotate: c.r,
      opacity: 0,
    }),
    show: {
      x: 0,
      y: 0,
      rotate: 0,
      opacity: 1,
      transition: { duration: 0.5, ease },
    },
  }

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[85] overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{ duration: 0.95, times: [0, 0.3, 0.62, 1], ease }}
      onAnimationComplete={onDone}
    >
      <motion.div
        className="grid h-full w-full"
        style={{
          gridTemplateColumns: `repeat(${SHARD_COLS}, 1fr)`,
          gridTemplateRows: `repeat(${SHARD_ROWS}, 1fr)`,
        }}
        variants={container}
        initial="hidden"
        animate="show"
      >
        {shards.map((c, i) => (
          <motion.div
            key={i}
            custom={c}
            variants={shardV}
            className="h-full w-full"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(194,208,216,0.32) 45%, rgba(184,115,51,0.14) 100%)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              boxShadow:
                'inset 0 0 0 1px rgba(255,255,255,0.4), inset 0 0 22px rgba(184,115,51,0.08)',
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  )
}

// A frosted refraction band sweeps across the viewport in the scroll direction.
function SweepGlass({ dir, onDone }: { dir: 1 | -1; onDone: () => void }) {
  // On phones this fires on every native section crossing, so skip the
  // whole-viewport backdrop-filter (very GPU-heavy) and use a translucent
  // frost tint that still reads as glass but is cheap to composite.
  const coarse =
    typeof window !== 'undefined' &&
    window.matchMedia('(pointer: coarse)').matches

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[85] overflow-hidden"
    >
      {/* frost bloom */}
      <motion.div
        className="absolute inset-0"
        style={
          coarse
            ? {
                background:
                  'linear-gradient(180deg, rgba(194,208,216,0.5), rgba(184,115,51,0.16))',
              }
            : {
                backdropFilter: 'blur(9px) saturate(115%)',
                WebkitBackdropFilter: 'blur(9px) saturate(115%)',
                background:
                  'linear-gradient(180deg, rgba(194,208,216,0.14), rgba(184,115,51,0.06))',
              }
        }
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, coarse ? 0.7 : 0.9, 0] }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
      {/* refraction band */}
      <motion.div
        className="absolute inset-x-[-8%] h-[55vh]"
        style={{
          background:
            'linear-gradient(180deg, transparent, rgba(255,255,255,0.35) 30%, rgba(209,138,69,0.35) 55%, rgba(194,208,216,0.2) 70%, transparent)',
          filter: 'blur(6px)',
        }}
        initial={{ y: dir === 1 ? '120vh' : '-75vh', skewY: -5 }}
        animate={{ y: dir === 1 ? '-75vh' : '120vh', skewY: -5 }}
        transition={{ duration: 0.6, ease }}
        onAnimationComplete={onDone}
      />
    </div>
  )
}
