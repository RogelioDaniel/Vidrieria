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
 * Every real section change — down or up, wheel, keyboard, touch, or rail —
 * fires the same themed transition: smoked/frosted tiles arrive from the scroll
 * direction, assemble a pane, then clear to reveal the neighbouring section.
 *
 * A diamond dot-rail (desktop) mirrors the logo mark and tracks/jumps sections.
 */

import * as React from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'

const ease = [0.65, 0, 0.35, 1] as const
const LOCK_MS = 850

const SECTIONS = [
  { id: 'top', label: 'inicio' },
  { id: 'catalogo', label: 'catálogo' },
  { id: 'cotizador', label: 'cotizador' },
  { id: 'proyectos', label: 'obras' },
  { id: 'proceso', label: 'proceso' },
  { id: 'clientes', label: 'clientes' },
  { id: 'cita', label: 'agenda' },
  { id: 'contacto', label: 'contacto' },
  { id: 'pie', label: 'final' },
]

type Transition = { key: number; dir: 1 | -1 }

function pageLocked() {
  return (
    getComputedStyle(document.documentElement).overflow === 'hidden' ||
    getComputedStyle(document.body).overflow === 'hidden'
  )
}

function nestedScrollOwnsGesture(target: EventTarget | null, deltaY: number) {
  if (!(target instanceof Element)) return false
  if (target.closest('[role="dialog"], [data-radix-scroll-area-viewport]')) {
    return true
  }

  let node: Element | null = target
  while (node && node !== document.body) {
    if (node instanceof HTMLElement) {
      const style = getComputedStyle(node)
      const scrollable = /(auto|scroll)/.test(style.overflowY)
      if (scrollable && node.scrollHeight > node.clientHeight + 1) {
        const canContinueDown =
          deltaY > 0 &&
          node.scrollTop + node.clientHeight < node.scrollHeight - 1
        const canContinueUp = deltaY < 0 && node.scrollTop > 1
        if (canContinueDown || canContinueUp) return true
      }
    }
    node = node.parentElement
  }
  return false
}

export function SectionScroller() {
  const reduce = useReducedMotion()
  const [active, setActive] = React.useState(0)
  const [transition, setTransition] = React.useState<Transition | null>(null)

  const activeRef = React.useRef(0)
  const animatingRef = React.useRef(false)
  const settledRef = React.useRef(false)
  const programmaticTargetRef = React.useRef<number | null>(null)
  const transitionKeyRef = React.useRef(0)
  const coarseRef = React.useRef(false)

  // Browsers normally restore the previous scroll offset on reload. PRISMA's
  // overture starts a new visit, so always begin it at the hero instead.
  React.useLayoutEffect(() => {
    const navigation = window.performance.getEntriesByType(
      'navigation',
    )[0] as PerformanceNavigationTiming | undefined
    const shouldReset =
      !navigation ||
      navigation.type === 'reload' ||
      navigation.type === 'navigate'
    // Preserve the expected position when the visitor uses Back/Forward.
    if (!shouldReset) return

    const previousRestoration = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    let raf = 0
    let secondRaf = 0
    let settleTimer = 0

    const forceTop = () => {
      const root = document.documentElement
      const previousBehavior = root.style.scrollBehavior
      root.style.scrollBehavior = 'auto'
      window.scrollTo(0, 0)
      root.style.scrollBehavior = previousBehavior
    }

    const resetAfterLayout = () => {
      forceTop()
      raf = window.requestAnimationFrame(() => {
        forceTop()
        secondRaf = window.requestAnimationFrame(forceTop)
      })
      settleTimer = window.setTimeout(forceTop, 250)
    }

    resetAfterLayout()
    window.addEventListener('pageshow', resetAfterLayout)
    return () => {
      window.history.scrollRestoration = previousRestoration
      window.removeEventListener('pageshow', resetAfterLayout)
      window.cancelAnimationFrame(raf)
      window.cancelAnimationFrame(secondRaf)
      window.clearTimeout(settleTimer)
    }
  }, [])

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
      transitionKeyRef.current += 1
      setTransition({
        key: transitionKeyRef.current,
        dir: to > from ? 1 : -1,
      })
    },
    [reduce],
  )

  const goTo = React.useCallback(
    (to: number) => {
      const target = Math.max(0, Math.min(SECTIONS.length - 1, to))
      const from = activeRef.current
      if (target === from || animatingRef.current) return false
      const el = document.getElementById(SECTIONS[target].id)
      if (!el) return false

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
      return true
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
      if (
        reduce ||
        !desktop() ||
        pageLocked() ||
        e.ctrlKey ||
        e.metaKey ||
        e.defaultPrevented ||
        nestedScrollOwnsGesture(e.target, e.deltaY)
      )
        return
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
        if (goTo(idx + 1)) e.preventDefault()
      } else if (e.deltaY < -6 && idx > 0 && atTop) {
        if (goTo(idx - 1)) e.preventDefault()
      }
    }

    const onKey = (e: KeyboardEvent) => {
      if (reduce || pageLocked() || animatingRef.current) return
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
          if (goTo(idx + 1)) e.preventDefault()
        }
      } else if (e.key === 'PageUp' || e.key === 'ArrowUp') {
        const el = document.getElementById(SECTIONS[idx].id)
        const atTop = el ? el.getBoundingClientRect().top >= -2 : true
        if (atTop && idx > 0) {
          if (goTo(idx - 1)) e.preventDefault()
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
                    ? 'h-2.5 w-2.5 border-accent bg-accent shadow-[0_0_10px_rgba(184,115,51,0.6)]'
                    : 'h-1.5 w-1.5 border-muted-foreground opacity-50 group-hover:opacity-100'
                }`}
              />
              <span className="pointer-events-none absolute right-7 whitespace-nowrap font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100">
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
  dir,
  onDone,
}: {
  dir: 1 | -1
  onDone: () => void
}) {
  // Safety net: guarantee cleanup even if onAnimationComplete never fires
  // (e.g. the tab is backgrounded mid-transition and framer-motion pauses).
  React.useEffect(() => {
    const t = window.setTimeout(onDone, 1500)
    return () => window.clearTimeout(t)
  }, [onDone])

  return <AssembleGlass dir={dir} onDone={onDone} />
}

// Frosted panes converge from the gesture's direction into a full sheet, then
// clear — "gathering glass to build the next section".
function AssembleGlass({
  dir,
  onDone,
}: {
  dir: 1 | -1
  onDone: () => void
}) {
  const compact =
    typeof window !== 'undefined' &&
    window.matchMedia('(max-width: 640px)').matches
  const columns = compact ? 4 : 6
  const rows = compact ? 6 : 4
  const panes = React.useMemo(
    () =>
      Array.from({ length: columns * rows }).map(() => ({
        x: (Math.random() - 0.5) * (compact ? 90 : 180),
        y:
          dir * (35 + Math.random() * (compact ? 90 : 150)) +
          (Math.random() - 0.5) * 70,
        r: (Math.random() - 0.5) * (compact ? 36 : 70),
      })),
    [columns, compact, dir, rows],
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
      transition={{ duration: 0.82, times: [0, 0.24, 0.62, 1], ease }}
      onAnimationComplete={onDone}
    >
      <motion.div
        className="grid h-full w-full"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
        variants={container}
        initial="hidden"
        animate="show"
      >
        {panes.map((c, i) => (
          <motion.div
            key={i}
            custom={c}
            variants={shardV}
            className="section-transition-pane h-full w-full"
          />
        ))}
      </motion.div>
    </motion.div>
  )
}
