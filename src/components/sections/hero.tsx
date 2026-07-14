'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Image from 'next/image'
import { ArrowDown, ArrowUpRight, Plus } from 'lucide-react'
import Link from 'next/link'
import { LivePresence } from '@/components/live-presence'

const easeInOutCubic = [0.65, 0, 0.35, 1] as const

export function Hero() {
  const reduce = useReducedMotion()

  return (
    <section
      id="top"
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-[#100f0d] text-[#e6e8ea]"
    >
      {/* Atmospheric background */}
      <div className="absolute inset-0 -z-10">
        {/* radial copper glow */}
        <div
          className="absolute left-1/2 top-1/2 h-[120vw] w-[120vw] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60"
          style={{
            background:
              'radial-gradient(circle at center, rgba(184,115,51,0.38) 0%, rgba(184,115,51,0.12) 30%, transparent 60%)',
          }}
        />
        {/* cool glass tint */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(circle at 20% 80%, rgba(194,208,216,0.18) 0%, transparent 40%), radial-gradient(circle at 80% 20%, rgba(194,208,216,0.12) 0%, transparent 35%)',
          }}
        />
        {/* grain via subtle dots */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'radial-gradient(circle, #ffffff 0.5px, transparent 0.5px)',
            backgroundSize: '3px 3px',
          }}
        />
      </div>

      {/* Floating motes */}
      {!reduce &&
        Array.from({ length: 14 }).map((_, i) => (
          <span
            key={i}
            className="float-mote pointer-events-none absolute rounded-full bg-[#c2d0d8]"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
              width: `${1 + (i % 3)}px`,
              height: `${1 + (i % 3)}px`,
              animationDelay: `${(i % 6) * 0.8}s`,
              opacity: 0.35,
            }}
          />
        ))}

      {/* HUD top-left */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.8, ease: easeInOutCubic }}
        className="absolute left-5 top-20 z-20 hidden sm:left-8 sm:top-24 sm:block"
      >
        <div className="hud-label text-[#c2d0d8]/70">est · 1998 · CDMX</div>
        <div className="mt-2 font-mono text-[0.65rem] leading-relaxed text-[#c2d0d8]/50">
          <div>TEL · 55 7842 9900</div>
          <div>OFICINA · COL. DEL VALLE</div>
        </div>
      </motion.div>

      {/* HUD top-right */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.8, ease: easeInOutCubic }}
        className="absolute right-5 top-20 z-20 hidden text-right sm:right-8 sm:top-24 sm:block"
      >
        <div className="hud-label text-[#c2d0d8]/70">cristal · 6mm · templado</div>
        <div className="mt-2 font-mono text-[0.65rem] leading-relaxed text-[#c2d0d8]/50">
          <div>COMP · SiO₂ 73%</div>
          <div>HORNO · 720°C</div>
        </div>
      </motion.div>

      {/* Main composition */}
      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-5 pb-24 pt-32 sm:px-8 lg:grid-cols-12 lg:gap-8 lg:pb-16 lg:pt-28">
        {/* Left: headline */}
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: easeInOutCubic }}
            className="mb-5 flex items-center gap-3"
          >
            <span className="h-px w-10 bg-[#b87333]" />
            <span className="hud-label text-[#c2d0d8]/80">
              Vidriería de autor · Ciudad de México
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.9, ease: easeInOutCubic }}
            className="font-display text-[clamp(2.6rem,7vw,5.5rem)] font-light leading-[0.95] tracking-[-0.02em]"
          >
            Vidrio hecho
            <br />
            <span className="italic font-normal text-[#d18a45]">a la medida</span>
            <br />
            <span className="text-[#aeb4bc]">de tu obra.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8, ease: easeInOutCubic }}
            className="mt-6 max-w-md text-base leading-relaxed text-[#c2d0d8]/80 sm:text-lg"
          >
            Del taller al inmueble. Cristales, espejos, templado, mamparas,
            barandales y vitrales de autor fabricados con precisión milimétrica
            en la CDMX. Cotización instantánea, medición certificada e
            instalación garantizada.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.8, ease: easeInOutCubic }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link
              href="#cotizador"
              className="group inline-flex h-12 items-center gap-2 bg-[#b87333] px-6 font-mono text-xs uppercase tracking-[0.16em] text-[#100f0d] transition-colors hover:bg-[#d18a45]"
            >
              Cotizar proyecto
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              href="#catalogo"
              className="inline-flex h-12 items-center gap-2 border border-[#c2d0d8]/30 px-6 font-mono text-xs uppercase tracking-[0.16em] text-[#e6e8ea] transition-colors hover:border-[#c2d0d8]/70 hover:bg-[#c2d0d8]/5"
            >
              Ver catálogo
            </Link>
            <div className="ml-1">
              <LivePresence variant="solid" />
            </div>
          </motion.div>
        </div>

        {/* Right: lit-from-within glass panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 1.1, ease: easeInOutCubic }}
          className="relative lg:col-span-5"
        >
          <div className="relative mx-auto aspect-[3/4] w-full max-w-sm">
            {/* copper glow behind */}
            <div
              className="copper-pulse absolute -inset-6 rounded-[2rem] opacity-70"
              style={{
                background:
                  'radial-gradient(circle at 50% 45%, rgba(209,138,69,0.55) 0%, rgba(184,115,51,0.18) 40%, transparent 70%)',
              }}
            />
            {/* glass image */}
            <div className="glass-panel relative h-full w-full overflow-hidden rounded-sm">
              <Image
                src="/images/hero-glass.png"
                alt="Panel de cristal iluminado desde su interior con luz cobriza"
                fill
                priority
                sizes="(max-width: 1024px) 80vw, 30vw"
                className="object-cover opacity-95"
              />
              {/* refraction sweep */}
              {!reduce && (
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  <div
                    className="refraction-sweep absolute -inset-y-10 left-0 w-1/3"
                    style={{
                      background:
                        'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)',
                      filter: 'blur(8px)',
                    }}
                  />
                </div>
              )}
              {/* corner ticks */}
              <div className="absolute left-3 top-3 h-4 w-4 border-l border-t border-white/50" />
              <div className="absolute right-3 top-3 h-4 w-4 border-r border-t border-white/50" />
              <div className="absolute bottom-3 left-3 h-4 w-4 border-b border-l border-white/50" />
              <div className="absolute bottom-3 right-3 h-4 w-4 border-b border-r border-white/50" />
              {/* HUD label bottom */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/80">
                pieza · 001 · firma del maestro
              </div>
            </div>

            {/* floating spec chip */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.7, ease: easeInOutCubic }}
              className="glass-panel absolute -right-4 top-1/3 hidden px-3 py-2 sm:block"
            >
              <div className="hud-label text-[#b87333]">traslúcida</div>
              <div className="font-mono text-[0.7rem] text-[#100f0d]">92% luz</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.15, duration: 0.7, ease: easeInOutCubic }}
              className="glass-panel absolute -left-6 bottom-1/4 hidden px-3 py-2 sm:block"
            >
              <div className="hud-label text-[#b87333]">espesor</div>
              <div className="font-mono text-[0.7rem] text-[#100f0d]">10 mm</div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Scroll prompt */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.8 }}
        className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <span className="hud-label text-[#c2d0d8]/60">recorre el taller</span>
        <motion.div
          animate={reduce ? {} : { y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: easeInOutCubic }}
        >
          <ArrowDown className="h-4 w-4 text-[#b87333]" />
        </motion.div>
      </motion.div>

      {/* bottom fade into next section */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[#e6e8ea]" />
    </section>
  )
}
