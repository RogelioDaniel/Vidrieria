'use client'

import * as React from 'react'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, ChevronLeft, ChevronRight, Loader2, MapPin } from 'lucide-react'
import { GlassReveal } from '@/components/glass-reveal'

type Project = {
  id: string
  title: string
  category: string
  location: string
  year: string
  image: string
  description: string
}

const FILTERS = [
  { id: 'all', label: 'Todo' },
  { id: 'mamparas', label: 'Mamparas' },
  { id: 'barandales', label: 'Barandales' },
  { id: 'espejos', label: 'Espejos' },
  { id: 'vitrales', label: 'Vitrales' },
  { id: 'puertas', label: 'Puertas' },
  { id: 'fachadas', label: 'Fachadas' },
]

const ease = [0.65, 0, 0.35, 1] as const

export function Projects() {
  const reduce = useReducedMotion()
  const carouselRef = React.useRef<HTMLDivElement>(null)
  const [projects, setProjects] = React.useState<Project[]>([])
  const [loading, setLoading] = React.useState(true)
  const [active, setActive] = React.useState('all')

  React.useEffect(() => {
    setLoading(true)
    carouselRef.current?.scrollTo({ left: 0, behavior: 'auto' })
    const q = active === 'all' ? '' : `?category=${active}`
    fetch(`/api/projects${q}`)
      .then((r) => {
        if (!r.ok) throw new Error('No se pudieron cargar las obras')
        return r.json()
      })
      .then((d) => {
        setProjects(d.projects ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [active])

  const moveCarousel = (direction: -1 | 1) => {
    const node = carouselRef.current
    if (!node) return
    node.scrollBy({
      left: direction * Math.max(280, node.clientWidth * 0.82),
      behavior: reduce ? 'auto' : 'smooth',
    })
  }

  return (
    <section id="proyectos" className="viewport-section relative bg-background">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-end md:justify-between lg:pb-6">
          <div className="max-w-2xl">
            <GlassReveal>
              <div className="mb-4 flex items-center gap-3">
                <span className="hud-label text-accent">03 · obras</span>
                <span className="h-px w-12 bg-accent/40" />
              </div>
              <h2 className="font-display text-4xl font-light leading-[1.05] tracking-[-0.02em] sm:text-5xl">
                Obras instaladas
                <br />
                <span className="italic text-accent">en la capital.</span>
              </h2>
            </GlassReveal>
          </div>
          <div className="flex max-w-full flex-wrap gap-2 pb-1">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setActive(f.id)}
                className={`h-11 shrink-0 border px-3 font-mono text-[0.62rem] uppercase tracking-[0.12em] transition-colors sm:h-9 ${
                  active === f.id
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border text-foreground/60 hover:border-foreground/50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex h-[24rem] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
          </div>
        ) : (
          <div className="relative mt-5">
            <div
              ref={carouselRef}
              role="region"
              aria-label="Carrusel de obras instaladas"
              data-section-carousel
              className="grid min-w-0 gap-4 pb-2 sm:grid-cols-2 lg:flex lg:snap-x lg:snap-mandatory lg:overflow-x-auto"
            >
            {projects.map((p, i) => (
              <motion.article
                key={p.id}
                initial={reduce ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: (i % 3) * 0.08, ease }}
                className="group relative min-w-0 w-full overflow-hidden border border-border lg:shrink-0 lg:basis-[31.8%] lg:snap-start"
              >
                <div className="relative h-[20rem] overflow-hidden bg-muted sm:h-[23rem] lg:h-[24rem]">
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />

                  {/* top meta */}
                  <div className="absolute left-4 top-4 flex items-center gap-2">
                    <span className="border border-white/30 bg-background/30 px-2 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-background backdrop-blur">
                      {p.category}
                    </span>
                    <span className="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-background/70">
                      {p.year}
                    </span>
                  </div>

                  {/* bottom content */}
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h3 className="font-display text-2xl font-medium leading-tight tracking-tight text-background">
                      {p.title}
                    </h3>
                    <p className="mt-1.5 max-w-md text-sm leading-relaxed text-background/75">
                      {p.description}
                    </p>
                    <div className="mt-3 flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-background/60">
                      <MapPin className="h-3 w-3 text-accent" />
                      {p.location}
                    </div>
                  </div>

                  {/* hover arrow */}
                  <div className="absolute right-4 top-4 flex h-9 w-9 translate-y-2 items-center justify-center bg-accent text-background opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>
              </motion.article>
            ))}
            </div>

            {projects.length > 1 && (
              <div className="mt-3 hidden items-center justify-between lg:flex">
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
                  {projects.length} obras · desliza para recorrer
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => moveCarousel(-1)}
                    aria-label="Obras anteriores"
                    className="flex h-11 w-11 items-center justify-center border border-border transition-colors hover:border-accent hover:text-accent"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveCarousel(1)}
                    aria-label="Obras siguientes"
                    className="flex h-11 w-11 items-center justify-center border border-border transition-colors hover:border-accent hover:text-accent"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {!loading && projects.length === 0 && (
          <div className="flex h-72 items-center justify-center font-mono text-sm uppercase tracking-[0.16em] text-muted-foreground">
            sin obras en esta categoría
          </div>
        )}
      </div>
    </section>
  )
}
