'use client'

import * as React from 'react'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
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
  return (
    <section id="proceso" className="atelier-dark relative overflow-hidden bg-foreground py-24 text-background sm:py-32">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            'radial-gradient(circle at 15% 30%, rgba(184,115,51,0.35) 0%, transparent 40%), radial-gradient(circle at 85% 70%, rgba(194,208,216,0.15) 0%, transparent 40%)',
        }}
      />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
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
            <p className="mt-5 max-w-md text-sm leading-relaxed text-background/70 sm:text-base">
              Cuatro etapas controladas. Cada pieza pasa por medición,
              elaboración, horno y entrega. Trazabilidad completa y tiempos
              claros desde el primer día.
            </p>

            <div className="relative mt-10 aspect-[4/3] w-full max-w-sm overflow-hidden border border-white/10">
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
            <ol className="relative">
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
          </div>
        </div>
      </div>
    </section>
  )
}
