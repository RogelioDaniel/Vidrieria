'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Mail, Phone, MapPin, Clock, ArrowUpRight, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { GlassReveal } from '@/components/glass-reveal'

const ease = [0.65, 0, 0.35, 1] as const

const DETAILS = [
  {
    icon: MapPin,
    label: 'Taller y oficina',
    value: 'Av. Coyoacán 1234, Col. del Valle',
    sub: 'Benito Juárez, CDMX · CP 03100',
  },
  {
    icon: Phone,
    label: 'Teléfono',
    value: '55 7842 9900',
    sub: 'WhatsApp · 55 7842 9901',
  },
  {
    icon: Mail,
    label: 'Correo',
    value: 'taller@prisma-vidrieria.mx',
    sub: 'respondemos en 2 h hábiles',
  },
  {
    icon: Clock,
    label: 'Horario',
    value: 'Lun – Vie · 9:00 – 19:00',
    sub: 'Sábado · 10:00 – 14:00',
  },
]

type ContactView = 'details' | 'message'

export function Contact() {
  const reduce = useReducedMotion()
  const [mobileView, setMobileView] = React.useState<ContactView>('details')
  const [submitting, setSubmitting] = React.useState(false)
  const [done, setDone] = React.useState(false)
  const [form, setForm] = React.useState({ name: '', email: '', subject: '', message: '' })
  const detailsTabRef = React.useRef<HTMLButtonElement>(null)
  const messageTabRef = React.useRef<HTMLButtonElement>(null)

  function selectMobileView(view: ContactView, focus = false) {
    setMobileView(view)
    if (!focus) return
    window.requestAnimationFrame(() => {
      const target = view === 'details' ? detailsTabRef.current : messageTabRef.current
      target?.focus()
    })
  }

  function handleTabKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const next: ContactView =
      event.key === 'ArrowLeft' || event.key === 'Home' ? 'details' : 'message'
    selectMobileView(next, true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error('Completa todos los campos.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const d = await res.json()
      if (d.ok) {
        setDone(true)
        toast.success('Mensaje enviado. Gracias.')
      } else {
        toast.error(d.error ?? 'No se pudo enviar.')
      }
    } catch {
      toast.error('Error de conexión.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section
      id="contacto"
      className="viewport-section relative overflow-hidden border-t border-border bg-background py-10 sm:py-14 lg:py-12"
    >
      <div className="viewport-section__body mx-auto max-w-7xl px-5 sm:px-8">
        <div
          role="tablist"
          aria-label="Opciones de contacto"
          className="mb-5 grid grid-cols-2 border border-border bg-card lg:hidden"
        >
          <button
            ref={detailsTabRef}
            id="contact-details-tab"
            type="button"
            role="tab"
            aria-selected={mobileView === 'details'}
            aria-controls="contact-details-panel"
            tabIndex={mobileView === 'details' ? 0 : -1}
            onClick={() => selectMobileView('details')}
            onKeyDown={handleTabKeyDown}
            className={`h-11 border-r border-border px-3 font-mono text-[0.65rem] uppercase tracking-[0.12em] transition-colors ${
              mobileView === 'details'
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Datos del taller
          </button>
          <button
            ref={messageTabRef}
            id="contact-message-tab"
            type="button"
            role="tab"
            aria-selected={mobileView === 'message'}
            aria-controls="contact-message-panel"
            tabIndex={mobileView === 'message' ? 0 : -1}
            onClick={() => selectMobileView('message')}
            onKeyDown={handleTabKeyDown}
            className={`h-11 px-3 font-mono text-[0.65rem] uppercase tracking-[0.12em] transition-colors ${
              mobileView === 'message'
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Escríbenos
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Left: details */}
          <motion.div
            id="contact-details-panel"
            role="tabpanel"
            aria-labelledby="contact-details-tab"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease }}
            className={`${mobileView === 'details' ? 'block' : 'hidden'} lg:col-span-5 lg:block`}
          >
            <GlassReveal>
              <div className="mb-3 flex items-center gap-3">
                <span className="hud-label text-accent">07 · contacto</span>
                <span className="h-px w-12 bg-accent/40" />
              </div>
              <h2 className="font-display text-3xl font-light leading-[1.05] tracking-[-0.02em] sm:text-4xl lg:text-5xl">
                Visita el taller
                <br />
                <span className="italic text-accent">o escríbenos.</span>
              </h2>
            </GlassReveal>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              Pasa por la oficina a ver muestras físicas, o cuéntanos tu
              proyecto por correo. Atendemos toda la zona metropolitana de la
              Ciudad de México.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-px border border-border bg-border lg:mt-6">
              {DETAILS.map((d) => (
                <div key={d.label} className="min-w-0 bg-card p-3 sm:p-4 lg:p-5">
                  <div className="flex items-center gap-2">
                    <d.icon className="h-4 w-4 text-accent" />
                    <span className="hud-label text-muted-foreground">{d.label}</span>
                  </div>
                  <div className="mt-2 break-words font-display text-base font-medium tracking-tight lg:text-lg">
                    {d.value}
                  </div>
                  <div className="mt-0.5 break-words font-mono text-[0.6rem] text-muted-foreground lg:text-[0.65rem]">
                    {d.sub}
                  </div>
                </div>
              ))}
            </div>

            {/* faux map / coverage strip */}
            <div className="relative mt-4 h-28 overflow-hidden border border-border bg-foreground text-background sm:h-36 lg:mt-6 lg:h-40">
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(184,115,51,0.5) 0%, transparent 50%), radial-gradient(circle at 60% 40%, rgba(194,208,216,0.3) 0%, transparent 50%)',
                }}
              />
              <div className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
                  backgroundSize: '32px 32px',
                }}
              />
              <div className="absolute left-5 top-5">
                <div className="hud-label text-[#d18a45]">cobertura</div>
                <div className="mt-1 font-display text-xl font-medium">
                  CDMX · 16 alcaldías
                </div>
              </div>
              <div className="absolute bottom-5 right-5 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-background/60">
                + zona metropolitana
              </div>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <span className="flex h-3 w-3">
                  <span className="absolute h-3 w-3 animate-ping rounded-full bg-accent opacity-75" />
                  <span className="relative h-3 w-3 rounded-full bg-accent" />
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right: form */}
          <motion.div
            id="contact-message-panel"
            role="tabpanel"
            aria-labelledby="contact-message-tab"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, delay: 0.1, ease }}
            className={`${mobileView === 'message' ? 'block' : 'hidden'} lg:col-span-7 lg:block`}
          >
            <div className="glass-card rounded-sm p-4 sm:p-6 lg:p-8">
              {done ? (
                <div className="flex flex-col items-start gap-4 py-10">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-background">
                    <Check className="h-6 w-6" />
                  </span>
                  <h3 className="font-display text-2xl font-medium tracking-tight">
                    Mensaje recibido
                  </h3>
                  <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                    Gracias por escribir a PRISMA. Un asesor del taller te
                    responde en menos de 2 horas hábiles.
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDone(false)
                      setForm({ name: '', email: '', subject: '', message: '' })
                    }}
                    className="h-9 rounded-none px-0 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground hover:bg-transparent hover:text-accent"
                  >
                    ← enviar otro mensaje
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 lg:space-y-5">
                  <div className="flex items-center gap-2 border-b border-border pb-3 sm:pb-4">
                    <Mail className="h-4 w-4 text-accent" />
                    <span className="hud-label text-muted-foreground">envía un mensaje</span>
                  </div>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="cn" className="hud-label mb-1.5 block text-muted-foreground">
                        Nombre
                      </Label>
                      <Input
                        id="cn"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="h-11 rounded-none border-border bg-background focus:border-accent"
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ce" className="hud-label mb-1.5 block text-muted-foreground">
                        Correo
                      </Label>
                      <Input
                        id="ce"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="h-11 rounded-none border-border bg-background focus:border-accent"
                        placeholder="correo@mx"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="cs" className="hud-label mb-1.5 block text-muted-foreground">
                      Asunto
                    </Label>
                    <Input
                      id="cs"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="h-11 rounded-none border-border bg-background focus:border-accent"
                      placeholder="¿De qué trata tu proyecto?"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cm" className="hud-label mb-1.5 block text-muted-foreground">
                      Mensaje
                    </Label>
                    <Textarea
                      id="cm"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="min-h-[96px] rounded-none border-border bg-background focus:border-accent sm:min-h-[120px] lg:min-h-[140px]"
                      placeholder="Cuéntanos del proyecto: tipo de vidrio, medidas aproximadas, ubicación y tiempos."
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="h-12 w-full gap-2 rounded-none bg-foreground font-mono text-xs uppercase tracking-[0.16em] hover:bg-accent sm:w-auto sm:px-10"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Enviar mensaje <ArrowUpRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
