'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Star, Quote, Loader2 } from 'lucide-react'
import { GlassReveal } from '@/components/glass-reveal'

type Testimonial = {
  id: string
  name: string
  role: string
  location: string
  content: string
  rating: number
}

const ease = [0.65, 0, 0.35, 1] as const

export function Testimonials() {
  const reduce = useReducedMotion()
  const [items, setItems] = React.useState<Testimonial[]>([])
  const [loading, setLoading] = React.useState(true)
  const [active, setActive] = React.useState(0)

  React.useEffect(() => {
    fetch('/api/testimonials')
      .then((r) => r.json())
      .then((d) => {
        setItems(d.testimonials ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  React.useEffect(() => {
    if (items.length < 2) return
    const t = setInterval(() => setActive((a) => (a + 1) % items.length), 6000)
    return () => clearInterval(t)
  }, [items.length])

  if (loading) {
    return (
      <section className="flex h-64 items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </section>
    )
  }

  if (items.length === 0) return null

  return (
    <section id="clientes" className="relative overflow-hidden border-y border-border bg-background py-24 sm:py-32">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'radial-gradient(circle, #100f0d 0.5px, transparent 0.5px)',
          backgroundSize: '4px 4px',
        }}
      />
      <div className="relative mx-auto max-w-5xl px-5 sm:px-8">
        <div className="mb-12 flex flex-col items-center text-center">
          <GlassReveal className="flex flex-col items-center">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-10 bg-accent/50" />
              <span className="hud-label text-accent">05 · clientes</span>
              <span className="h-px w-10 bg-accent/50" />
            </div>
            <h2 className="font-display text-3xl font-light leading-[1.1] tracking-[-0.02em] sm:text-4xl">
              Lo que dicen quienes
              <br />
              <span className="italic text-accent">ya instalaron.</span>
            </h2>
          </GlassReveal>
        </div>

        <div className="relative min-h-[280px]">
          {items.map((t, i) => (
            <motion.blockquote
              key={t.id}
              initial={false}
              animate={{
                opacity: i === active ? 1 : 0,
                y: i === active ? 0 : 16,
                pointerEvents: i === active ? 'auto' : 'none',
              }}
              transition={{ duration: 0.7, ease }}
              className={`absolute inset-0 flex flex-col items-center text-center ${i === active ? '' : 'pointer-events-none'}`}
              aria-hidden={i !== active}
            >
              <Quote className="mb-6 h-8 w-8 text-accent/60" />
              <p className="max-w-3xl font-display text-xl font-light leading-relaxed tracking-tight text-foreground sm:text-2xl">
                “{t.content}”
              </p>
              <div className="mt-6 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star
                    key={s}
                    className={`h-4 w-4 ${s < t.rating ? 'fill-accent text-accent' : 'text-muted-foreground/30'}`}
                  />
                ))}
              </div>
              <div className="mt-4">
                <div className="font-display text-lg font-medium tracking-tight">{t.name}</div>
                <div className="mt-0.5 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
                  {t.role} · {t.location}
                </div>
              </div>
            </motion.blockquote>
          ))}
        </div>

        {/* dots */}
        <div className="mt-8 flex items-center justify-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Ir al testimonio ${i + 1}`}
              className={`h-1.5 transition-all duration-300 ${
                i === active ? 'w-8 bg-accent' : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
