'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Mail, Phone, MapPin, Clock, ArrowUpRight, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

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

export function Contact() {
  const reduce = useReducedMotion()
  const [submitting, setSubmitting] = React.useState(false)
  const [done, setDone] = React.useState(false)
  const [form, setForm] = React.useState({ name: '', email: '', subject: '', message: '' })

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
    <section id="contacto" className="relative overflow-hidden border-t border-border bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Left: details */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease }}
            className="lg:col-span-5"
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="hud-label text-accent">07 · contacto</span>
              <span className="h-px w-12 bg-accent/40" />
            </div>
            <h2 className="font-display text-4xl font-light leading-[1.05] tracking-[-0.02em] sm:text-5xl">
              Visita el taller
              <br />
              <span className="italic text-accent">o escríbenos.</span>
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              Pasa por la oficina a ver muestras físicas, o cuéntanos tu
              proyecto por correo. Atendemos toda la zona metropolitana de la
              Ciudad de México.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2">
              {DETAILS.map((d) => (
                <div key={d.label} className="bg-card p-5">
                  <div className="flex items-center gap-2">
                    <d.icon className="h-4 w-4 text-accent" />
                    <span className="hud-label text-muted-foreground">{d.label}</span>
                  </div>
                  <div className="mt-2 font-display text-lg font-medium tracking-tight">
                    {d.value}
                  </div>
                  <div className="mt-0.5 font-mono text-[0.65rem] text-muted-foreground">
                    {d.sub}
                  </div>
                </div>
              ))}
            </div>

            {/* faux map / coverage strip */}
            <div className="mt-6 relative h-40 overflow-hidden border border-border bg-foreground text-background">
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
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, delay: 0.1, ease }}
            className="lg:col-span-7"
          >
            <div className="glass-card rounded-sm p-6 sm:p-8">
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
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="flex items-center gap-2 border-b border-border pb-4">
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
                      className="min-h-[140px] rounded-none border-border bg-background focus:border-accent"
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
