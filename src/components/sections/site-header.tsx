'use client'

import * as React from 'react'
import Link from 'next/link'
import { Menu, X, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from '@/components/ui/sheet'
import { LivePresence } from '@/components/live-presence'

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
            <span className="absolute inset-0 rotate-45 border border-foreground/70 transition-transform duration-500 group-hover:rotate-[135deg]" />
            <span className="absolute inset-[5px] rotate-45 border border-accent/80" />
            <span className="h-1.5 w-1.5 rounded-full bg-accent copper-pulse" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-semibold tracking-tight text-foreground">
              PRISMA
            </span>
            <span className="hud-label mt-0.5 text-[0.55rem] text-muted-foreground">
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
              className="group relative font-mono text-[0.7rem] uppercase tracking-[0.18em] text-foreground/70 transition-colors hover:text-foreground"
            >
              {item.label}
              <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-accent transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-3">
          <div className="hidden xl:block">
            <LivePresence />
          </div>
          <Button
            asChild
            size="sm"
            className="hidden h-9 rounded-none border border-foreground bg-foreground px-4 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-background hover:bg-accent hover:text-background sm:inline-flex"
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
                className="h-10 w-10 rounded-none lg:hidden"
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
              <div className="flex items-center justify-between border-b border-border px-6 py-5">
                <span className="font-display text-lg font-semibold tracking-tight">PRISMA</span>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none" aria-label="Cerrar">
                    <X className="h-5 w-5" />
                  </Button>
                </SheetClose>
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
