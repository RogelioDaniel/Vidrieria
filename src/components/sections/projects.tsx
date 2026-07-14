'use client'

import * as React from 'react'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Loader2, MapPin } from 'lucide-react'

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
  const [projects, setProjects] = React.useState<Project[]>([])
  const [loading, setLoading] = React.useState(true)
  const [active, setActive] = React.useState('all')

  React.useEffect(() => {
    setLoading(true)
    const q = active === 'all' ? '' : `?category=${active}`
    fetch(`/api/projects${q}`)
      .then((r) => r.json())
      .then((d) => {
        setProjects(d.projects ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [active])

  return (
    <section id="proyectos" className="relative bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-6 border-b border-border pb-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="hud-label text-accent">03 · obras</span>
              <span className="h-px w-12 bg-accent/40" />
            </div>
            <h2 className="font-display text-4xl font-light leading-[1.05] tracking-[-0.02em] sm:text-5xl">
              Obras instaladas
              <br />
              <span className="italic text-accent">en la capital.</span>
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setActive(f.id)}
                className={`h-8 border px-3 font-mono text-[0.62rem] uppercase tracking-[0.12em] transition-colors ${
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
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => (
              <motion.article
                key={p.id}
                initial={reduce ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: (i % 3) * 0.08, ease }}
                className={`group relative overflow-hidden border border-border ${
                  i % 5 === 0 ? 'md:col-span-2' : ''
                }`}
              >
                <div className={`relative overflow-hidden bg-muted ${i % 5 === 0 ? 'aspect-[16/9]' : 'aspect-[4/5]'}`}>
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
        )}
      </div>
    </section>
  )
}
