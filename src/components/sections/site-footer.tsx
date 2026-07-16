'use client'

import Link from 'next/link'
import { ArrowUpRight, ChevronDown, Instagram, Facebook, MessageCircle } from 'lucide-react'

const COLS = [
  {
    title: 'Catálogo',
    links: [
      { label: 'Cristales', href: '#catalogo' },
      { label: 'Espejos', href: '#catalogo' },
      { label: 'Vidrio templado', href: '#catalogo' },
      { label: 'Mamparas', href: '#catalogo' },
      { label: 'Barandales', href: '#catalogo' },
      { label: 'Vitrales de autor', href: '#catalogo' },
    ],
  },
  {
    title: 'Servicios',
    links: [
      { label: 'Cotizador instantáneo', href: '#cotizador' },
      { label: 'Agenda de medición', href: '#cita' },
      { label: 'Instalación', href: '#proceso' },
      { label: 'Garantía', href: '#proceso' },
    ],
  },
  {
    title: 'Estudio',
    links: [
      { label: 'Proyectos', href: '#proyectos' },
      { label: 'Proceso', href: '#proceso' },
      { label: 'Clientes', href: '#proyectos' },
      { label: 'Contacto', href: '#contacto' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer id="pie" className="viewport-section atelier-dark mt-auto border-t border-border bg-foreground text-background">
      <div className="viewport-section__body mx-auto w-full max-w-7xl px-5 sm:px-8">
        {/* CTA banner */}
        <div className="flex flex-col items-start justify-between gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end md:gap-6 md:pb-8">
          <div className="max-w-xl">
            <div className="hud-label text-[#d18a45]">¿listo para empezar?</div>
            <h2 className="mt-2 font-display text-3xl font-light leading-[1.05] tracking-[-0.02em] sm:text-4xl lg:text-5xl">
              Cuéntanos tu proyecto
              <br />
              <span className="italic text-[#d18a45]">y lo cotizamos hoy.</span>
            </h2>
          </div>
          <Link
            href="#cotizador"
            className="group inline-flex h-11 items-center gap-2 bg-[#b87333] px-6 font-mono text-xs uppercase tracking-[0.16em] text-[#100f0d] transition-colors hover:bg-[#d18a45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d18a45] focus-visible:ring-offset-2 focus-visible:ring-offset-[#100f0d]"
          >
            Cotizar
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* Main grid */}
        <div className="py-5 md:grid md:grid-cols-4 md:gap-10 md:py-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-8 w-8 items-center justify-center">
                <span className="absolute inset-0 rotate-45 border border-background/70" />
                <span className="absolute inset-[5px] rotate-45 border border-[#b87333]/80" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#b87333]" />
              </span>
              <span className="font-display text-lg font-semibold tracking-tight">
                PRISMA
              </span>
            </div>
            <p className="mt-3 max-w-xs font-mono text-[0.7rem] leading-relaxed text-background/60">
              Vidriería de autor en la Ciudad de México. Vidrio hecho a la
              medida desde 1998.
            </p>
            <div className="mt-3 flex gap-2 md:mt-5">
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-11 w-11 items-center justify-center border border-white/15 text-background/70 transition-colors hover:border-[#b87333] hover:text-[#d18a45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d18a45]"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-11 w-11 items-center justify-center border border-white/15 text-background/70 transition-colors hover:border-[#b87333] hover:text-[#d18a45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d18a45]"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="WhatsApp"
                className="flex h-11 w-11 items-center justify-center border border-white/15 text-background/70 transition-colors hover:border-[#b87333] hover:text-[#d18a45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d18a45]"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Mobile link drawers keep the whole footer inside one guided stop. */}
          <div className="mt-4 divide-y divide-white/10 border-y border-white/10 md:hidden">
            {COLS.map((col) => (
              <details key={col.title} className="group">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between font-mono text-[0.68rem] uppercase tracking-[0.14em] text-[#d18a45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#d18a45] [&::-webkit-details-marker]:hidden">
                  {col.title}
                  <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                </summary>
                <ul className="grid grid-cols-2 gap-x-4 gap-y-1 pb-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="flex min-h-11 items-center font-mono text-[0.65rem] uppercase tracking-[0.08em] text-background/65 transition-colors hover:text-background"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>

          {/* Desktop link columns */}
          {COLS.map((col) => (
            <div key={col.title} className="hidden md:block">
              <div className="hud-label text-[#d18a45]">{col.title}</div>
              <ul className="mt-4 space-y-1">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="flex min-h-9 items-center font-mono text-[0.72rem] uppercase tracking-[0.1em] text-background/65 transition-colors hover:text-background"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-4 md:flex-row md:items-center md:pt-5">
          <div className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-background/50">
            © {new Date().getFullYear()} PRISMA Vidriería de Autor · Hecho en CDMX
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-background/50 md:gap-5">
            <span>NOM-006</span>
            <span>·</span>
            <span>Garantía 5 años</span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#b87333]" />
              atelier en vivo
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
