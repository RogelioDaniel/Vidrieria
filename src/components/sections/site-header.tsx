'use client'

import * as React from 'react'
import Link from 'next/link'
import { Menu, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from '@/components/ui/sheet'
import { LivePresence } from '@/components/live-presence'
import { PolarizedToggle } from '@/components/polarized-toggle'

const NAV = [
  { label: 'Catálogo', href: '#catalogo' },
  { label: 'Cotizador', href: '#cotizador' },
  { label: 'Proyectos', href: '#proyectos' },
  { label: 'Proceso', href: '#proceso' },
  { label: 'Cita', href: '#cita' },
  { label: 'Contacto', href: '#contacto' },
]

export function SiteHeader() {
  const [scrolled, setScrolled] = React.useState(false)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-background/80 backdrop-blur-xl border-b border-border/60'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        {/* Logo */}
        <Link href="#top" className="group flex items-center gap-2.5" aria-label="PRISMA Inicio">
          <span className="relative flex h-8 w-8 items-center justify-center">
            <span
              className={`absolute inset-0 rotate-45 border transition-all duration-500 group-hover:rotate-[135deg] ${
                scrolled ? 'border-foreground/70' : 'border-white/70'
              }`}
            />
            <span className="absolute inset-[5px] rotate-45 border border-accent/80" />
            <span className="h-1.5 w-1.5 rounded-full bg-accent copper-pulse" />
          </span>
          <span className="flex flex-col leading-none">
            <span
              className={`font-display text-lg font-semibold tracking-tight transition-colors ${
                scrolled ? 'text-foreground' : 'text-white'
              }`}
            >
              PRISMA
            </span>
            <span
              className={`hud-label mt-0.5 text-[0.55rem] transition-colors ${
                scrolled ? 'text-muted-foreground' : 'text-white/60'
              }`}
            >
              Vidriería · CDMX
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative font-mono text-[0.7rem] uppercase tracking-[0.18em] transition-colors ${
                scrolled
                  ? 'text-foreground/70 hover:text-foreground'
                  : 'text-white/65 hover:text-white'
              }`}
            >
              {item.label}
              <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-accent transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-3">
          <div className="hidden xl:block">
            <LivePresence variant={scrolled ? 'ghost' : 'solid'} />
          </div>
          <div className="hidden lg:block">
            <PolarizedToggle />
          </div>
          <Button
            asChild
            size="sm"
            className={`hidden h-9 rounded-none border px-4 font-mono text-[0.7rem] uppercase tracking-[0.16em] sm:inline-flex ${
              scrolled
                ? 'border-foreground bg-foreground text-background hover:bg-accent hover:text-background'
                : 'border-white/35 bg-white/10 text-white backdrop-blur hover:border-accent hover:bg-accent hover:text-[#100f0d]'
            }`}
          >
            <Link href="#cotizador" className="gap-1.5">
              Cotizar
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`h-11 w-11 rounded-none lg:hidden ${
                  scrolled ? 'text-foreground' : 'text-white hover:bg-white/10'
                }`}
                aria-label="Abrir menú"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[88vw] max-w-sm border-l border-border bg-background p-0"
            >
              <SheetTitle className="sr-only">Navegación</SheetTitle>
              <SheetDescription className="sr-only">
                Navegación principal y control de vidrio polarizado.
              </SheetDescription>
              <div className="flex items-center border-b border-border px-6 py-5">
                <span className="font-display text-lg font-semibold tracking-tight">PRISMA</span>
              </div>
              <nav className="flex flex-col px-6 py-4">
                {NAV.map((item, i) => (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className="group flex items-center justify-between border-b border-border/50 py-4"
                    >
                      <span className="font-display text-2xl font-medium tracking-tight">
                        {item.label}
                      </span>
                      <span className="hud-label text-muted-foreground">
                        0{i + 1}
                      </span>
                    </Link>
                  </SheetClose>
                ))}
              </nav>
              <div className="px-6 py-4">
                <LivePresence />
              </div>
              <div className="px-6 pb-3">
                <PolarizedToggle wide />
              </div>
              <div className="px-6 pb-8 pt-2">
                <Button asChild className="h-12 w-full rounded-none bg-foreground font-mono text-xs uppercase tracking-[0.16em]">
                  <Link href="#cotizador" className="gap-2">
                    Cotizar ahora <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
