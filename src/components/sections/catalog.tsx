'use client'

import * as React from 'react'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { GlassReveal } from '@/components/glass-reveal'

type Product = {
  id: string
  name: string
  slug: string
  category: string
  summary: string
  description: string
  pricePerM2: number
  thickness: string
  finish: string
  features: string
  image: string
  featured: boolean
}

const CATEGORIES = [
  { id: 'all', label: 'Todo' },
  { id: 'cristales', label: 'Cristales' },
  { id: 'espejos', label: 'Espejos' },
  { id: 'templado', label: 'Templado' },
  { id: 'mamparas', label: 'Mamparas' },
  { id: 'barandales', label: 'Barandales' },
  { id: 'vitrales', label: 'Vitrales' },
  { id: 'puertas', label: 'Puertas' },
  { id: 'aluminio', label: 'Aluminio' },
]

const ease = [0.65, 0, 0.35, 1] as const

function formatMXN(n: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(n)
}

export function Catalog() {
  const reduce = useReducedMotion()
  const [products, setProducts] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState(true)
  const [active, setActive] = React.useState('all')

  React.useEffect(() => {
    let cancel = false
    setLoading(true)
    const q = active === 'all' ? '' : `?category=${active}`
    fetch(`/api/products${q}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancel) {
          setProducts(d.products ?? [])
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancel) setLoading(false)
      })
    return () => {
      cancel = true
    }
  }, [active])

  return (
    <section id="catalogo" className="relative bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Section header */}
        <div className="flex flex-col gap-6 border-b border-border pb-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <GlassReveal>
              <div className="mb-4 flex items-center gap-3">
                <span className="hud-label text-accent">01 · catálogo</span>
                <span className="h-px w-12 bg-accent/40" />
              </div>
              <h2 className="font-display text-4xl font-light leading-[1.05] tracking-[-0.02em] sm:text-5xl">
                Materiales y piezas
                <br />
                <span className="italic text-accent">del taller.</span>
              </h2>
            </GlassReveal>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              Cada material se fabrica o se corta a la medida exacta de tu
              proyecto. Precios por metro cuadrado, instalación incluida en la
              CDMX.
            </p>
          </div>
          <div className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">
            <div>{products.length} piezas</div>
            <div className="mt-1 text-accent">precio · MXN / m²</div>
          </div>
        </div>

        {/* Category filter */}
        <div className="mt-8 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              className={`h-9 border px-4 font-mono text-[0.7rem] uppercase tracking-[0.14em] transition-colors ${
                active === c.id
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-transparent text-foreground/70 hover:border-foreground/60 hover:text-foreground'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p, i) => (
              <motion.article
                key={p.id}
                initial={reduce ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: (i % 3) * 0.08, ease }}
                className="group relative flex flex-col border border-border bg-card transition-colors hover:border-foreground/40"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  {p.featured && (
                    <Badge
                      variant="outline"
                      className="absolute left-3 top-3 border-accent/60 bg-background/80 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-accent backdrop-blur"
                    >
                      firma
                    </Badge>
                  )}
                  <div className="absolute bottom-3 right-3 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-background/90">
                    {p.category}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-xl font-medium leading-tight tracking-tight">
                      {p.name}
                    </h3>
                    <span className="hud-label shrink-0 text-muted-foreground">
                      {p.thickness}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {p.summary}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {p.features.split('|').slice(0, 3).map((f) => (
                      <span
                        key={f}
                        className="border border-border/80 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted-foreground"
                      >
                        {f}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
                    <div>
                      <div className="hud-label text-muted-foreground">desde</div>
                      <div className="font-display text-2xl font-medium tnum text-foreground">
                        {formatMXN(p.pricePerM2)}
                        <span className="ml-1 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
                          /m²
                        </span>
                      </div>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 gap-1.5 rounded-none px-3 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-foreground hover:bg-foreground hover:text-background"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Ficha
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg gap-0 overflow-hidden rounded-none border-border bg-card p-0">
                        <div className="relative aspect-[16/10] w-full overflow-hidden">
                          <Image
                            src={p.image}
                            alt={p.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 640px"
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                          <div className="absolute bottom-4 left-5">
                            <Badge variant="outline" className="border-accent/60 bg-background/70 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-accent backdrop-blur">
                              {p.category}
                            </Badge>
                          </div>
                        </div>
                        <DialogHeader className="px-6 pb-2 pt-5">
                          <DialogTitle className="font-display text-2xl font-medium tracking-tight">
                            {p.name}
                          </DialogTitle>
                          <DialogDescription className="text-sm text-muted-foreground">
                            {p.thickness} · {p.finish}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="px-6 pb-6">
                          <p className="text-sm leading-relaxed text-foreground/80">
                            {p.description}
                          </p>
                          <div className="mt-5 grid grid-cols-2 gap-3">
                            {p.features.split('|').map((f) => (
                              <div key={f} className="border border-border p-3">
                                <div className="hud-label text-accent">detalle</div>
                                <div className="mt-1 font-mono text-xs text-foreground">
                                  {f}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-5 flex items-center justify-between border-t border-border pt-5">
                            <div>
                              <div className="hud-label text-muted-foreground">desde</div>
                              <div className="font-display text-3xl font-medium tnum">
                                {formatMXN(p.pricePerM2)}
                                <span className="ml-1 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">/m²</span>
                              </div>
                            </div>
                            <DialogClose asChild>
                              <Button asChild className="h-11 gap-2 rounded-none bg-foreground font-mono text-xs uppercase tracking-[0.14em]">
                                <a href="#cotizador">
                                  Cotizar <ArrowUpRight className="h-4 w-4" />
                                </a>
                              </Button>
                            </DialogClose>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="flex h-48 items-center justify-center font-mono text-sm uppercase tracking-[0.16em] text-muted-foreground">
            sin piezas en esta categoría
          </div>
        )}
      </div>
    </section>
  )
}
