'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { LivePresence } from '@/components/live-presence'
import { HeroGlassCarousel } from '@/components/hero-glass-carousel'
import { Marquee } from '@/components/sections/marquee'

const easeInOutCubic = [0.65, 0, 0.35, 1] as const

export function Hero() {
  const reduce = useReducedMotion()

  return (
    <section
      id="top"
      className="relative isolate flex h-[100svh] min-h-0 items-center overflow-hidden bg-[#100f0d] text-[#e6e8ea]"
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
      <div className="relative z-10 mx-auto grid h-full w-full max-w-7xl grid-cols-1 content-center items-center gap-2 px-5 pb-3 pt-20 sm:gap-5 sm:px-8 sm:pb-8 sm:pt-24 lg:grid-cols-12 lg:gap-8 lg:pb-12 lg:pt-24">
        {/* Left: headline */}
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: easeInOutCubic }}
            className="mb-3 flex items-center gap-3 sm:mb-5"
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
            className="font-display text-[clamp(2.05rem,10vw,2.6rem)] font-light leading-[0.92] tracking-[-0.02em] sm:text-[clamp(2.6rem,7vw,5.5rem)] sm:leading-[0.95]"
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
            className="mt-4 max-w-md text-sm leading-relaxed text-[#c2d0d8]/80 sm:mt-6 sm:text-lg"
          >
            Del taller al inmueble: cristales, espejos, mamparas y vitrales
            fabricados a medida en la CDMX, con medición certificada e
            instalación garantizada.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.8, ease: easeInOutCubic }}
            className="mt-4 flex flex-wrap items-center gap-2 sm:mt-8 sm:gap-3"
          >
            <Link
              href="#cotizador"
              className="group inline-flex h-11 items-center gap-2 bg-[#b87333] px-4 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-[#100f0d] transition-colors hover:bg-[#d18a45] sm:h-12 sm:px-6 sm:text-xs sm:tracking-[0.16em]"
            >
              Cotizar proyecto
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              href="#catalogo"
              className="inline-flex h-11 items-center gap-2 border border-[#c2d0d8]/30 px-4 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-[#e6e8ea] transition-colors hover:border-[#c2d0d8]/70 hover:bg-[#c2d0d8]/5 sm:h-12 sm:px-6 sm:text-xs sm:tracking-[0.16em]"
            >
              Ver catálogo
            </Link>
            <div className="ml-1">
              <LivePresence variant="solid" />
            </div>
          </motion.div>
        </div>

        {/* Right: interactive material carousel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 1.1, ease: easeInOutCubic }}
          className="relative flex min-h-0 items-center justify-center lg:col-span-5"
        >
          <div className="relative mx-auto aspect-[3/4] h-[30svh] min-h-48 max-h-[17rem] w-auto lg:h-auto lg:min-h-0 lg:max-h-none lg:w-full lg:max-w-sm">
            <HeroGlassCarousel />
          </div>
        </motion.div>
      </div>

      {/* Scroll prompt */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.8 }}
        className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 sm:bottom-[4.5rem]"
      >
        <span className="hud-label text-[#c2d0d8]/60">recorre el taller</span>
        <motion.div
          animate={reduce ? {} : { y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: easeInOutCubic }}
        >
          <ArrowDown className="h-4 w-4 text-[#b87333]" />
        </motion.div>
      </motion.div>

      {/* The workshop ticker belongs to the hero sheet, not between stops. */}
      <div className="absolute inset-x-0 bottom-0 z-10 hidden sm:block">
        <Marquee />
      </div>

      {/* bottom fade into next section */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-background" />
    </section>
  )
}
