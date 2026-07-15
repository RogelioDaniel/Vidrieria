'use client'

/**
 * SnapNavigation — the "fixed pages" modality layer.
 *
 * Pairs with `scroll-snap-type: y proximity` on <html> (globals.css): each
 * scroll gesture settles on a section, and every time the active section
 * changes this component fires a fast glass flash — a frost pulse plus a
 * copper refraction band sweeping in the scroll direction (~0.4s, transform/
 * opacity only). A diamond dot-rail on the right (desktop) mirrors the site's
 * rotated-square logo mark and jumps between sections.
 *
 * Active-section tracking is a rAF-throttled scroll handler that queries the
 * DOM live on every check — resilient to sections that mount late (catálogo,
 * clientes render after their fetch resolves), unlike a one-shot
 * IntersectionObserver binding.
 */

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const ease = [0.65, 0, 0.35, 1] as const

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

export function SnapNavigation() {
  const reduce = useReducedMotion()
  const [active, setActive] = React.useState('top')
  const [flash, setFlash] = React.useState<{ key: number; dir: 1 | -1 } | null>(
    null,
  )
  const activeRef = React.useRef('top')
  const settledRef = React.useRef(false)

  React.useEffect(() => {
    let raf = 0

    const compute = () => {
      raf = 0
      const centerY = window.innerHeight / 2
      let current: string | null = null
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id)
        if (!el) continue
        const r = el.getBoundingClientRect()
        if (r.top <= centerY && r.bottom >= centerY) {
          current = s.id
          break
        }
      }
      if (current && current !== activeRef.current) {
        const prev = SECTIONS.findIndex((x) => x.id === activeRef.current)
        const next = SECTIONS.findIndex((x) => x.id === current)
        activeRef.current = current
        setActive(current)
        // No flash for the very first settle (initial load / scroll restore).
        if (settledRef.current) {
          setFlash({ key: Date.now(), dir: next > prev ? 1 : -1 })
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
  }, [])

  const jumpTo = (id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <>
      {/* Glass flash on section change */}
      {flash && !reduce && (
        <div
          key={flash.key}
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[80] overflow-hidden"
        >
          {/* frost pulse */}
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(194,208,216,0.12), rgba(184,115,51,0.07))',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0] }}
            transition={{ duration: 0.34, ease: 'easeOut' }}
          />
          {/* copper refraction band sweeping in scroll direction */}
          <motion.div
            className="absolute left-[-10%] right-[-10%] top-0 h-[42vh]"
            style={{
              background:
                'linear-gradient(180deg, transparent, rgba(194,208,216,0.18) 35%, rgba(209,138,69,0.24) 55%, transparent)',
              filter: 'blur(7px)',
            }}
            initial={{ y: flash.dir === 1 ? '105vh' : '-45vh', skewY: -6 }}
            animate={{ y: flash.dir === 1 ? '-45vh' : '105vh', skewY: -6 }}
            transition={{ duration: 0.42, ease }}
            onAnimationComplete={() => setFlash(null)}
          />
        </div>
      )}

      {/* Section dot-rail (desktop) */}
      <nav
        aria-label="Secciones"
        className="fixed right-5 top-1/2 z-[70] hidden -translate-y-1/2 flex-col items-center gap-1 lg:flex"
      >
        {SECTIONS.map((s) => {
          const isActive = active === s.id
          return (
            <button
              key={s.id}
              onClick={() => jumpTo(s.id)}
              aria-label={s.label}
              aria-current={isActive ? 'true' : undefined}
              className="group relative flex h-6 w-6 items-center justify-center"
            >
              <span
                className={`block rotate-45 border transition-all duration-300 ${
                  isActive
                    ? 'h-2 w-2 border-[#b87333] bg-[#b87333] shadow-[0_0_8px_rgba(184,115,51,0.6)]'
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
