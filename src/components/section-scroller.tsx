'use client'

/**
 * SectionScroller — the "guided pages" modality.
 *
 * Replaces rigid CSS scroll-snap with controlled section stepping on desktop.
 * Tall sections still scroll freely inside, while touch devices keep fully
 * native scrolling.
 *
 * Visible transitions freeze the current section as glass, fracture it, swap
 * to the target only while fully covered, then reconstruct/reveal the target.
 * Wheel transitions remain alternating; explicit desktop links always play.
 *
 * A diamond dot-rail (desktop) mirrors the logo mark and tracks/jumps sections.
 */

import * as React from 'react'
import { useReducedMotion } from 'framer-motion'
import {
  GlassNavigationTransition,
  type GlassImpact,
} from '@/components/glass-intro'

const LOCK_MS = 640

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

type Transition = {
  key: number
  targetIndex: number
  updateHash: boolean
}

type QueuedTarget = Pick<Transition, 'targetIndex' | 'updateHash'>

function isCompactViewport() {
  return (
    typeof window !== 'undefined' &&
    (window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(max-width: 640px)').matches)
  )
}

function prefersDataSaving() {
  if (typeof navigator === 'undefined') return false
  return Boolean(
    (
      navigator as Navigator & {
        connection?: { saveData?: boolean }
      }
    ).connection?.saveData,
  )
}

function pageLocked() {
  return (
    getComputedStyle(document.documentElement).overflow === 'hidden' ||
    getComputedStyle(document.body).overflow === 'hidden'
  )
}

function nestedScrollOwnsGesture(target: EventTarget | null, deltaY: number) {
  if (!(target instanceof Element)) return false
  // Horizontal sample racks expose `overflow-y: auto` as a browser side effect
  // of `overflow-x: auto`. Their 1–2px paint overflow must not consume the
  // wheel gesture that advances the guided section.
  if (target.closest('[data-section-carousel]')) return false
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
  const transitionRef = React.useRef<Transition | null>(null)

  const activeRef = React.useRef(0)
  const animatingRef = React.useRef(false)
  const transitionKeyRef = React.useRef(0)
  const transitionCountRef = React.useRef(0)
  const coarseRef = React.useRef(false)
  const queuedTargetRef = React.useRef<QueuedTarget | null>(null)
  const quietTimerRef = React.useRef<number | null>(null)

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

  const commitSection = React.useCallback(
    (
      targetIndex: number,
      updateHash: boolean,
      impact: GlassImpact = { x: 50, y: 50 },
    ) => {
      const section = SECTIONS[targetIndex]
      const element = section && document.getElementById(section.id)
      if (!section || !element) return

      // The target changes only while the fracture fully covers the viewport.
      // Disable the global smooth behavior for this single frame so no page
      // glide can leak behind the reconstructing glass.
      const root = document.documentElement
      const previousBehavior = root.style.scrollBehavior
      root.style.scrollBehavior = 'auto'
      element.scrollIntoView({ behavior: 'auto', block: 'start' })
      window.requestAnimationFrame(() => {
        root.style.scrollBehavior = previousBehavior
      })

      // Reconstruct the actual destination DOM — text, imagery and controls —
      // through the same irregular impact point instead of merely placing a
      // decorative pane over a smooth scroll.
      const rect = element.getBoundingClientRect()
      const centerX = Math.max(6, Math.min(94, impact.x))
      const centerY = Math.max(
        4,
        Math.min(
          96,
          (((impact.y / 100) * window.innerHeight - rect.top) /
            Math.max(1, rect.height)) *
            100,
        ),
      )
      const radii = Array.from({ length: 30 }, () => 0.78 + Math.random() * 0.4)
      const polygonAt = (radius: number) =>
        `polygon(${radii
          .map((jitter, index) => {
            const angle = (index / radii.length) * Math.PI * 2
            const spike = index % 7 === 0 ? 1.16 : 1
            const x = centerX + Math.cos(angle) * radius * jitter * spike
            const y = centerY + Math.sin(angle) * radius * jitter * spike
            return `${x.toFixed(2)}% ${y.toFixed(2)}%`
          })
          .join(', ')})`

      if (
        !reduce &&
        !prefersDataSaving() &&
        typeof element.animate === 'function'
      ) {
        const reveal = element.animate(
          [
            {
              clipPath: polygonAt(1.2),
              opacity: 0.72,
              transform: 'scale(0.996)',
            },
            {
              clipPath: polygonAt(64),
              opacity: 0.94,
              transform: 'scale(0.999)',
              offset: 0.64,
            },
            {
              clipPath: polygonAt(240),
              opacity: 1,
              transform: 'scale(1)',
            },
          ],
          {
            duration: 610,
            easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
            fill: 'both',
          },
        )
        void reveal.finished.then(() => reveal.cancel()).catch(() => {})
      }

      activeRef.current = targetIndex
      setActive(targetIndex)
      if (updateHash && window.location.hash !== `#${section.id}`) {
        window.history.pushState(null, '', `#${section.id}`)
      }
    },
    [reduce],
  )

  const beginFracture = React.useCallback(
    (targetIndex: number, updateHash: boolean) => {
      const target = Math.max(0, Math.min(SECTIONS.length - 1, targetIndex))
      const element = document.getElementById(SECTIONS[target].id)
      if (!element || animatingRef.current) return false

      const from = currentIndex()
      const alreadyAtTarget =
        target === from && Math.abs(element.getBoundingClientRect().top) <= 2
      if (alreadyAtTarget) return false

      animatingRef.current = true
      transitionKeyRef.current += 1
      const pending: Transition = {
        key: transitionKeyRef.current,
        targetIndex: target,
        updateHash,
      }
      transitionRef.current = pending
      setTransition(pending)
      return true
    },
    [currentIndex],
  )

  const finishFracture = React.useCallback(() => {
    transitionRef.current = null
    setTransition(null)
    animatingRef.current = false
    const queued = queuedTargetRef.current
    queuedTargetRef.current = null
    if (queued) {
      window.requestAnimationFrame(() => {
        beginFracture(queued.targetIndex, queued.updateHash)
      })
    }
  }, [beginFracture])

  const revealTarget = React.useCallback((impact: GlassImpact) => {
    const pending = transitionRef.current
    if (!pending) return
    commitSection(pending.targetIndex, pending.updateHash, impact)
  }, [commitSection])

  // Explicit navigation always wins. A click received during motion is queued
  // (last click wins) so it cannot leak a native hash jump under the glass and
  // still receives its own complete fracture/reconstruction cycle afterward.
  const requestFracture = React.useCallback(
    (targetIndex: number, updateHash: boolean) => {
      const target = Math.max(0, Math.min(SECTIONS.length - 1, targetIndex))
      if (!document.getElementById(SECTIONS[target].id)) return false

      if (animatingRef.current) {
        queuedTargetRef.current = { targetIndex: target, updateHash }
        return true
      }

      return beginFracture(target, updateHash)
    },
    [beginFracture],
  )

  const goTo = React.useCallback(
    (to: number) => {
      if (isCompactViewport() || animatingRef.current) return false
      const target = Math.max(0, Math.min(SECTIONS.length - 1, to))
      const from = currentIndex()
      if (target === from) return false
      const element = document.getElementById(SECTIONS[target].id)
      if (!element) return false

      // One guided step fractures; the next stays quiet, as requested.
      transitionCountRef.current += 1
      const visibleTransition =
        !reduce &&
        !prefersDataSaving() &&
        transitionCountRef.current % 2 === 1
      if (visibleTransition) return beginFracture(target, false)

      animatingRef.current = true
      activeRef.current = target
      setActive(target)
      element.scrollIntoView({
        behavior: reduce ? 'auto' : 'smooth',
        block: 'start',
      })
      if (quietTimerRef.current !== null) {
        window.clearTimeout(quietTimerRef.current)
      }
      quietTimerRef.current = window.setTimeout(() => {
        quietTimerRef.current = null
        animatingRef.current = false
        const queued = queuedTargetRef.current
        queuedTargetRef.current = null
        if (queued) {
          beginFracture(queued.targetIndex, queued.updateHash)
        }
      }, LOCK_MS)
      return true
    },
    [beginFracture, currentIndex, reduce],
  )

  // Desktop section links pause their native hash jump. The destination is
  // committed only once the fracture reports full coverage. Mobile/coarse,
  // reduced-motion and Save-Data keep ordinary native anchor navigation.
  React.useEffect(() => {
    const onSectionLinkClick = (event: MouseEvent) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        reduce ||
        prefersDataSaving() ||
        isCompactViewport()
      )
        return

      const target = event.target
      if (!(target instanceof Element)) return
      const anchor = target.closest<HTMLAnchorElement>('a[href^="#"]')
      if (!anchor || anchor.hasAttribute('download')) return
      const targetWindow = anchor.getAttribute('target')
      if (targetWindow && targetWindow !== '_self') return

      const href = anchor.getAttribute('href')
      if (!href || href === '#') return

      let id = ''
      try {
        id = decodeURIComponent(href.slice(1))
      } catch {
        return
      }
      const targetIndex = SECTIONS.findIndex((section) => section.id === id)
      const targetElement = document.getElementById(id)
      if (targetIndex < 0 || !targetElement) return

      const from = currentIndex()
      const alreadyAtTarget =
        targetIndex === from &&
        Math.abs(targetElement.getBoundingClientRect().top) <= 2
      if (alreadyAtTarget) return

      event.preventDefault()
      if (!requestFracture(targetIndex, true)) return

      // Radix close actions ignore default-prevented clicks. If the CTA lives
      // inside a modal, close that layer explicitly; the target swap will not
      // happen until the glass is opaque, comfortably after this microtask.
      if (anchor.closest('[role="dialog"]')) {
        window.queueMicrotask(() => {
          document.dispatchEvent(
            new KeyboardEvent('keydown', {
              key: 'Escape',
              code: 'Escape',
              bubbles: true,
              cancelable: true,
            }),
          )
        })
      }
    }

    document.addEventListener('click', onSectionLinkClick, true)
    return () =>
      document.removeEventListener('click', onSectionLinkClick, true)
  }, [currentIndex, reduce, requestFracture])

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
      if (reduce || !desktop() || pageLocked())
        return
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
      if (animatingRef.current) {
        if (
          e.key === 'PageDown' ||
          e.key === 'ArrowDown' ||
          e.key === 'PageUp' ||
          e.key === 'ArrowUp'
        ) {
          e.preventDefault()
        }
        return
      }
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

  // Active-section tracking never creates an effect by itself. This is what
  // keeps touch scrolling completely native and free of glass overlays.
  React.useEffect(() => {
    let raf = 0
    const compute = () => {
      raf = 0
      const idx = currentIndex()
      if (idx !== activeRef.current) {
        activeRef.current = idx
        setActive(idx)
      }
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
  }, [currentIndex])

  React.useEffect(
    () => () => {
      if (quietTimerRef.current !== null) {
        window.clearTimeout(quietTimerRef.current)
      }
    },
    [],
  )

  const jumpTo = (i: number) => {
    if (reduce || prefersDataSaving()) {
      commitSection(i, true)
      return
    }
    requestFracture(i, true)
  }

  return (
    <>
      {transition && !reduce && (
        <GlassNavigationTransition
          key={transition.key}
          onCovered={revealTarget}
          onComplete={finishFracture}
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
