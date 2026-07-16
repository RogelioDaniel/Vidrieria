'use client'

import * as React from 'react'
import Image from 'next/image'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { GlassReveal } from '@/components/glass-reveal'

const ease = [0.65, 0, 0.35, 1] as const

// This is a TRUE sequence (real process), so numbered markers are appropriate.
const STEPS = [
  {
    n: '01',
    temp: 'ambient',
    title: 'Medición certificada',
    desc: 'Un técnico visita tu obra con láser digital, registra las medidas exactas y valida plomos y nivel. La cotización se ajusta al milímetro.',
    detail: 'precisión · ±1 mm',
  },
  {
    n: '02',
    temp: 'ambiente',
    title: 'Corte y elaboración',
    desc: 'Cortamos el vidrio en taller con mesa CNC. Biselado, pulido diamante y perforaciones según el diseño acordado.',
    detail: 'mesa CNC · 6 ejes',
  },
  {
    n: '03',
    temp: '720°C',
    title: 'Horno y templado',
    desc: 'El vidrio entra al horno a 720°C y se templa. Enfriamiento controlado que multiplica por cinco su resistencia.',
    detail: 'horno · 720°C',
  },
  {
    n: '04',
    temp: 'obra',
    title: 'Instalación y garantía',
    desc: 'Equipo certificado instala con herrajes y selladores de alta performance. Entregamos garantía por escrito de 5 años.',
    detail: 'garantía · 5 años',
  },
]

export function Process() {
  const reduce = useReducedMotion()
  const [active, setActive] = React.useState(0)
  const step = STEPS[active]
  return (
    <section id="proceso" className="viewport-section atelier-dark relative overflow-hidden bg-foreground text-background">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            'radial-gradient(circle at 15% 30%, rgba(184,115,51,0.35) 0%, transparent 40%), radial-gradient(circle at 85% 70%, rgba(194,208,216,0.15) 0%, transparent 40%)',
        }}
      />
      <div className="viewport-section__body relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-12">
          {/* Left intro */}
          <div className="lg:col-span-5">
            <GlassReveal>
              <div className="mb-4 flex items-center gap-3">
                <span className="hud-label text-[#d18a45]">04 · proceso</span>
                <span className="h-px w-12 bg-[#b87333]/50" />
              </div>
              <h2 className="font-display text-4xl font-light leading-[1.05] tracking-[-0.02em] sm:text-5xl">
                Del taller
                <br />
                <span className="italic text-[#d18a45]">a tu obra.</span>
              </h2>
            </GlassReveal>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-background/70 sm:text-base lg:mt-5">
              Cuatro etapas controladas. Cada pieza pasa por medición,
              elaboración, horno y entrega. Trazabilidad completa y tiempos
              claros desde el primer día.
            </p>

            <div className="relative mt-5 h-36 w-full overflow-hidden border border-white/10 sm:h-44 lg:mt-10 lg:aspect-[4/3] lg:h-auto lg:max-w-sm">
              <Image
                src="/images/artisan-workshop.png"
                alt="Maestro vidriero trabajando vidrio fundido con tenazas de cobre en el taller"
                fill
                sizes="(max-width: 1024px) 80vw, 30vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
              <div className="absolute bottom-3 left-3 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-background/80">
                taller · col. del valle
              </div>
            </div>
          </div>

          {/* Right steps */}
          <div className="lg:col-span-7">
            <ol className="relative hidden lg:block">
              {/* vertical line */}
              <div className="absolute left-[2.25rem] top-2 bottom-2 w-px bg-gradient-to-b from-[#b87333]/60 via-white/15 to-transparent" />
              {STEPS.map((s, i) => (
                <motion.li
                  key={s.n}
                  initial={reduce ? false : { opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease }}
                  className="group relative flex gap-6 pb-10 last:pb-0"
                >
                  <div className="relative z-10 flex h-[4.5rem] w-[4.5rem] shrink-0 flex-col items-center justify-center border border-white/15 bg-foreground/80 backdrop-blur transition-colors group-hover:border-[#b87333]">
                    <span className="font-display text-2xl font-light text-[#d18a45] tnum">{s.n}</span>
                    <span className="font-mono text-[0.55rem] uppercase tracking-[0.12em] text-background/50">{s.temp}</span>
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="font-display text-2xl font-medium tracking-tight">{s.title}</h3>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-background/70">{s.desc}</p>
                    <div className="mt-3 inline-flex items-center gap-2 border border-white/15 px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-[#d18a45]">
                      {s.detail}
                    </div>
                  </div>
                </motion.li>
              ))}
            </ol>

            <div className="lg:hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.article
                  key={step.n}
                  initial={reduce ? false : { opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduce ? undefined : { opacity: 0, x: -20 }}
                  transition={{ duration: 0.25, ease }}
                  aria-live="polite"
                  className="border border-white/15 bg-black/15 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center border border-[#b87333]/70">
                      <span className="font-display text-2xl font-light text-[#d18a45] tnum">{step.n}</span>
                      <span className="font-mono text-[0.52rem] uppercase tracking-[0.12em] text-background/50">{step.temp}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-xl font-medium tracking-tight">{step.title}</h3>
                      <div className="mt-1 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-[#d18a45]">
                        {step.detail}
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-background/70">{step.desc}</p>
                </motion.article>
              </AnimatePresence>

              <div className="mt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActive((value) => (value - 1 + STEPS.length) % STEPS.length)}
                  aria-label="Etapa anterior"
                  className="flex h-11 w-11 items-center justify-center border border-white/20 text-background transition-colors hover:border-[#b87333] hover:text-[#d18a45]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex gap-2" aria-label="Etapas del proceso">
                  {STEPS.map((item, index) => (
                    <button
                      key={item.n}
                      type="button"
                      onClick={() => setActive(index)}
                      aria-label={`Ver etapa ${item.n}: ${item.title}`}
                      aria-current={index === active ? 'step' : undefined}
                      className={`flex h-11 w-11 items-center justify-center font-mono text-[0.62rem] transition-colors ${
                        index === active
                          ? 'bg-[#b87333] text-[#100f0d]'
                          : 'border border-white/20 text-background/60'
                      }`}
                    >
                      {item.n}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setActive((value) => (value + 1) % STEPS.length)}
                  aria-label="Etapa siguiente"
                  className="flex h-11 w-11 items-center justify-center border border-white/20 text-background transition-colors hover:border-[#b87333] hover:text-[#d18a45]"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
