'use client'

import Link from 'next/link'
import { ArrowUpRight, Instagram, Facebook, MessageCircle } from 'lucide-react'

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
    <footer className="mt-auto border-t border-border bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        {/* CTA banner */}
        <div className="flex flex-col items-start justify-between gap-6 border-b border-white/10 pb-12 md:flex-row md:items-end">
          <div className="max-w-xl">
            <div className="hud-label text-[#d18a45]">¿listo para empezar?</div>
            <h2 className="mt-3 font-display text-3xl font-light leading-[1.1] tracking-[-0.02em] sm:text-5xl">
              Cuéntanos tu proyecto
              <br />
              <span className="italic text-[#d18a45]">y lo cotizamos hoy.</span>
            </h2>
          </div>
          <Link
            href="#cotizador"
            className="group inline-flex h-12 items-center gap-2 bg-[#b87333] px-6 font-mono text-xs uppercase tracking-[0.16em] text-[#100f0d] transition-colors hover:bg-[#d18a45]"
          >
            Cotizar
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-2 gap-10 py-12 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
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
            <p className="mt-4 max-w-xs font-mono text-[0.7rem] leading-relaxed text-background/60">
              Vidriería de autor en la Ciudad de México. Vidrio hecho a la
              medida desde 1998.
            </p>
            <div className="mt-5 flex gap-2">
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center border border-white/15 text-background/70 transition-colors hover:border-[#b87333] hover:text-[#d18a45]"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center border border-white/15 text-background/70 transition-colors hover:border-[#b87333] hover:text-[#d18a45]"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="WhatsApp"
                className="flex h-9 w-9 items-center justify-center border border-white/15 text-background/70 transition-colors hover:border-[#b87333] hover:text-[#d18a45]"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {COLS.map((col) => (
            <div key={col.title}>
              <div className="hud-label text-[#d18a45]">{col.title}</div>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="font-mono text-[0.72rem] uppercase tracking-[0.1em] text-background/65 transition-colors hover:text-background"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 md:flex-row md:items-center">
          <div className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-background/50">
            © {new Date().getFullYear()} PRISMA Vidriería de Autor · Hecho en CDMX
          </div>
          <div className="flex items-center gap-5 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-background/50">
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
