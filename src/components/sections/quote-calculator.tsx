'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Image from 'next/image'
import { Check, Loader2, ArrowUpRight, Ruler, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { GlassReveal } from '@/components/glass-reveal'

type Product = {
  id: string
  name: string
  slug: string
  pricePerM2: number
  thickness: string
  image: string
  finish: string
}

const FINISHES = [
  'Incoloro',
  'Bronce',
  'Esmerilado',
  'Cobre envejecido',
  'Templado',
]

const ease = [0.65, 0, 0.35, 1] as const

function formatMXN(n: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(n)
}

export function QuoteCalculator() {
  const reduce = useReducedMotion()
  const [products, setProducts] = React.useState<Product[]>([])
  const [slug, setSlug] = React.useState('')
  const [width, setWidth] = React.useState('100')
  const [height, setHeight] = React.useState('120')
  const [finish, setFinish] = React.useState('Incoloro')
  const [mobileStep, setMobileStep] = React.useState<0 | 1>(0)

  const [calc, setCalc] = React.useState<{ estimatedPrice: number; areaM2: number; product: string } | null>(null)
  const [calcLoading, setCalcLoading] = React.useState(false)

  const [submitting, setSubmitting] = React.useState(false)
  const [done, setDone] = React.useState(false)

  // form fields
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [phone, setPhone] = React.useState('')

  React.useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((d) => {
        setProducts(d.products ?? [])
        if (d.products?.[0]) setSlug(d.products[0].slug)
      })
  }, [])

  // debounced live calculation
  React.useEffect(() => {
    if (!slug) return
    const w = Number(width)
    const h = Number(height)
    if (!w || !h || w < 10 || h < 10) {
      setCalc(null)
      return
    }
    setCalcLoading(true)
    const t = setTimeout(() => {
      fetch('/api/quotes/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productSlug: slug, width: w, height: h, finish }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.ok) {
            setCalc({ estimatedPrice: d.estimatedPrice, areaM2: d.areaM2, product: d.product })
          } else {
            setCalc(null)
          }
        })
        .catch(() => setCalc(null))
        .finally(() => setCalcLoading(false))
    }, 350)
    return () => clearTimeout(t)
  }, [slug, width, height, finish])

  const selected = products.find((p) => p.slug === slug)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!calc) {
      toast.error('Ajusta las medidas para calcular el precio.')
      return
    }
    if (!name || !email || !phone) {
      toast.error('Completa nombre, correo y teléfono.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          productSlug: slug,
          width: Number(width),
          height: Number(height),
          finish,
        }),
      })
      const d = await res.json()
      if (d.ok) {
        setDone(true)
        toast.success('Cotización registrada. Un asesor te contacta hoy.')
      } else {
        toast.error(d.error ?? 'No se pudo registrar.')
      }
    } catch {
      toast.error('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="cotizador" className="viewport-section relative overflow-hidden bg-[#100f0d] text-[#e6e8ea]">
      {/* ambient */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background:
            'radial-gradient(circle at 80% 20%, rgba(184,115,51,0.22) 0%, transparent 45%), radial-gradient(circle at 10% 90%, rgba(194,208,216,0.12) 0%, transparent 40%)',
        }}
      />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-3 border-b border-white/10 pb-5 md:flex-row md:items-end md:justify-between md:gap-6 md:pb-7">
          <div className="max-w-2xl">
            <GlassReveal>
              <div className="mb-2 flex items-center gap-3 sm:mb-3">
                <span className="hud-label text-[#d18a45]">02 · cotizador</span>
                <span className="h-px w-12 bg-[#b87333]/50" />
              </div>
              <h2 className="font-display text-3xl font-light leading-[1.02] tracking-[-0.02em] sm:text-4xl lg:text-5xl">
                Precio al instante,
                <br />
                <span className="italic text-[#d18a45]">sin esperas.</span>
              </h2>
            </GlassReveal>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-[#c2d0d8]/70 sm:mt-3 sm:text-base">
              Elige el material, mide y obtén un estimado en tiempo real. Cuando
              lo confirmes, un asesor del taller revisa y programa la medición
              certificada.
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-[#c2d0d8]/50">
            <Sparkles className="h-3.5 w-3.5 text-[#b87333]" />
            cálculo en vivo
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 border border-white/15 lg:hidden" aria-label="Pasos del cotizador">
          <button
            type="button"
            onClick={() => setMobileStep(0)}
            aria-current={mobileStep === 0 ? 'step' : undefined}
            className={`min-h-11 px-3 font-mono text-[0.64rem] uppercase tracking-[0.12em] transition-colors ${mobileStep === 0 ? 'bg-[#b87333] text-[#100f0d]' : 'text-[#c2d0d8]/70'}`}
          >
            01 · medidas
          </button>
          <button
            type="button"
            onClick={() => setMobileStep(1)}
            aria-current={mobileStep === 1 ? 'step' : undefined}
            className={`min-h-11 border-l border-white/15 px-3 font-mono text-[0.64rem] uppercase tracking-[0.12em] transition-colors ${mobileStep === 1 ? 'bg-[#b87333] text-[#100f0d]' : 'text-[#c2d0d8]/70'}`}
          >
            02 · solicitar
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-5 lg:mt-7 lg:grid-cols-12 lg:gap-8">
          {/* Controls */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease }}
            className={`${mobileStep === 0 ? 'block' : 'hidden'} lg:col-span-7 lg:block`}
          >
            <div className="glass-panel rounded-sm p-4 sm:p-5 lg:p-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="prod" className="hud-label mb-2 block text-[#c2d0d8]/70">
                    Material
                  </Label>
                  <Select value={slug} onValueChange={setSlug}>
                    <SelectTrigger
                      id="prod"
                      className="h-12 rounded-none border-white/20 bg-white/5 font-sans text-[#e6e8ea] hover:border-[#b87333]/60 focus:border-[#b87333]"
                    >
                      <SelectValue placeholder="Elige un material" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-white/20 bg-[#1a1815] text-[#e6e8ea]">
                      {products.map((p) => (
                        <SelectItem key={p.slug} value={p.slug} className="rounded-none focus:bg-white/10 focus:text-[#d18a45]">
                          {p.name} · {formatMXN(p.pricePerM2)}/m²
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="w" className="hud-label mb-2 block text-[#c2d0d8]/70">
                    Ancho (cm)
                  </Label>
                  <div className="relative">
                    <Ruler className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b87333]" />
                    <Input
                      id="w"
                      type="number"
                      min={10}
                      max={600}
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      className="h-12 rounded-none border-white/20 bg-white/5 pl-10 font-mono text-lg text-[#e6e8ea] tnum focus:border-[#b87333]"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="h" className="hud-label mb-2 block text-[#c2d0d8]/70">
                    Alto (cm)
                  </Label>
                  <div className="relative">
                    <Ruler className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b87333]" />
                    <Input
                      id="h"
                      type="number"
                      min={10}
                      max={600}
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="h-12 rounded-none border-white/20 bg-white/5 pl-10 font-mono text-lg text-[#e6e8ea] tnum focus:border-[#b87333]"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <Label className="hud-label mb-2 block text-[#c2d0d8]/70">
                    Acabado
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {FINISHES.map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFinish(f)}
                        className={`h-11 border px-3 font-mono text-[0.63rem] uppercase tracking-[0.1em] transition-colors sm:px-4 sm:text-[0.65rem] sm:tracking-[0.12em] ${
                          finish === f
                            ? 'border-[#b87333] bg-[#b87333] text-[#100f0d]'
                            : 'border-white/20 text-[#c2d0d8]/70 hover:border-[#b87333]/60'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dimension visualization */}
              <div className="mt-5 hidden items-center gap-4 border-t border-white/10 pt-5 sm:flex">
                <div className="relative h-20 w-32 border border-dashed border-white/30">
                  <div className="absolute inset-2 bg-[#b87333]/10" />
                  <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 font-mono text-[0.6rem] text-[#c2d0d8]/60 tnum">
                    {width} cm
                  </span>
                  <span className="absolute -right-10 top-1/2 -translate-y-1/2 font-mono text-[0.6rem] text-[#c2d0d8]/60 tnum">
                    {height}
                  </span>
                </div>
                <div className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-[#c2d0d8]/50">
                  {selected ? (
                    <>
                      <div>{selected.name}</div>
                      <div className="mt-0.5 text-[#b87333]">{selected.thickness}</div>
                    </>
                  ) : (
                    'selecciona material'
                  )}
                </div>
              </div>

              <Button
                type="button"
                onClick={() => setMobileStep(1)}
                disabled={!calc}
                className="mt-4 h-11 w-full rounded-none bg-[#b87333] font-mono text-[0.68rem] uppercase tracking-[0.14em] text-[#100f0d] hover:bg-[#d18a45] disabled:opacity-40 lg:hidden"
              >
                Ver estimado y solicitar <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>

          {/* Price panel */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, delay: 0.1, ease }}
            className={`${mobileStep === 1 ? 'block' : 'hidden'} lg:col-span-5 lg:block`}
          >
            <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-sm border border-[#b87333]/30 bg-gradient-to-br from-[#1a1815] to-[#100f0d] p-4 sm:p-5 lg:p-6">
              {selected && (
                <div className="absolute right-0 top-0 h-32 w-32 opacity-20">
                  <Image src={selected.image} alt="" fill className="object-cover" sizes="128px" />
                </div>
              )}
              <div className="relative">
                <div className="hud-label text-[#d18a45]">estimado</div>
                <div className="mt-3 flex items-end gap-2">
                  {calcLoading ? (
                    <Loader2 className="mb-3 h-8 w-8 animate-spin text-[#b87333]" />
                  ) : calc ? (
                    <motion.div
                      key={calc.estimatedPrice}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease }}
                      className="font-display text-4xl font-light tracking-tight tnum text-[#e6e8ea] sm:text-5xl lg:text-6xl"
                    >
                      {formatMXN(calc.estimatedPrice)}
                    </motion.div>
                  ) : (
                    <div className="font-display text-4xl font-light tracking-tight text-[#c2d0d8]/30 sm:text-5xl lg:text-6xl">
                      —
                    </div>
                  )}
                </div>
                <div className="mt-2 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-[#c2d0d8]/60">
                  {calc
                    ? `${calc.areaM2} m² · instalado en CDMX`
                    : 'ajusta medidas para calcular'}
                </div>
              </div>

              <div className="relative mt-4 lg:mt-6">
                {done ? (
                  <div className="flex flex-col items-start gap-3 border border-[#b87333]/40 bg-[#b87333]/10 p-5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#b87333] text-[#100f0d]">
                        <Check className="h-4 w-4" />
                      </span>
                      <span className="font-mono text-xs uppercase tracking-[0.14em] text-[#d18a45]">
                        cotización registrada
                      </span>
                    </div>
                    <p className="text-sm text-[#c2d0d8]/80">
                      Folio <span className="font-mono">PR-{Date.now().toString().slice(-6)}</span>.
                      Un asesor te contacta hoy en horario hábil (9–19 h).
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDone(false)}
                      className="h-9 rounded-none px-0 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-[#c2d0d8]/70 hover:bg-transparent hover:text-[#d18a45]"
                    >
                      ← nueva cotización
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <Input
                      placeholder="Nombre completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-11 rounded-none border-white/20 bg-white/5 font-sans text-[#e6e8ea] placeholder:text-[#c2d0d8]/40 focus:border-[#b87333]"
                    />
                    <Input
                      type="email"
                      placeholder="correo@electronico.mx"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 rounded-none border-white/20 bg-white/5 font-sans text-[#e6e8ea] placeholder:text-[#c2d0d8]/40 focus:border-[#b87333]"
                    />
                    <Input
                      type="tel"
                      placeholder="55 1234 5678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-11 rounded-none border-white/20 bg-white/5 font-sans text-[#e6e8ea] placeholder:text-[#c2d0d8]/40 focus:border-[#b87333]"
                    />
                    <Button
                      type="submit"
                      disabled={submitting || !calc}
                      className="h-12 w-full gap-2 rounded-none bg-[#b87333] font-mono text-xs uppercase tracking-[0.16em] text-[#100f0d] hover:bg-[#d18a45] disabled:opacity-40"
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Solicitar cotización <ArrowUpRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                    <p className="font-mono text-[0.6rem] leading-relaxed text-[#c2d0d8]/40">
                      Al solicitar aceptas que un asesor te contacte. Sin costo ni
                      compromiso. El precio final se confirma tras medición.
                    </p>
                  </form>
                )}
              </div>

              <button
                type="button"
                onClick={() => setMobileStep(0)}
                className="mt-2 min-h-11 self-start font-mono text-[0.63rem] uppercase tracking-[0.12em] text-[#c2d0d8]/60 transition-colors hover:text-[#d18a45] lg:hidden"
              >
                ← cambiar medidas
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
