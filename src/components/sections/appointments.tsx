'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { CalendarClock, Check, Loader2, MapPin, Clock, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

const ease = [0.65, 0, 0.35, 1] as const

const SERVICES = [
  { id: 'medicion', label: 'Medición en obra', desc: 'Técnico con láser digital, sin costo en CDMX.' },
  { id: 'consulta', label: 'Consulta en taller', desc: 'Asesoría con muestras físicas en Col. del Valle.' },
  { id: 'instalacion', label: 'Instalación', desc: 'Agenda de montaje para obra en curso.' },
]

const TIMES = ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00']

function mxDate(d: Date) {
  return d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
}

export function Appointments() {
  const reduce = useReducedMotion()
  const [service, setService] = React.useState('medicion')
  const [date, setDate] = React.useState<Date | undefined>(undefined)
  const [time, setTime] = React.useState('')
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [address, setAddress] = React.useState('')
  const [notes, setNotes] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [done, setDone] = React.useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!date || !time) {
      toast.error('Elige fecha y horario.')
      return
    }
    if (!name || !email || !phone || !address) {
      toast.error('Completa todos los campos obligatorios.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          serviceType: service,
          date: date.toISOString().slice(0, 10),
          time,
          address,
          notes,
        }),
      })
      const d = await res.json()
      if (d.ok) {
        setDone(true)
        toast.success('Cita agendada. Recibirás confirmación por correo.')
      } else {
        toast.error(d.error ?? 'No se pudo agendar.')
      }
    } catch {
      toast.error('Error de conexión.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="cita" className="relative bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-6 border-b border-border pb-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="hud-label text-accent">06 · agenda</span>
              <span className="h-px w-12 bg-accent/40" />
            </div>
            <h2 className="font-display text-4xl font-light leading-[1.05] tracking-[-0.02em] sm:text-5xl">
              Agenda tu cita
              <br />
              <span className="italic text-accent">de medición.</span>
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              Elige servicio, fecha y horario. La medición en obra dentro de la
              CDMX es sin costo. Confirmamos por correo en menos de 2 horas
              hábiles.
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
            <CalendarClock className="h-3.5 w-3.5 text-accent" />
            cobertura · cdmx y zona metro
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Service + calendar */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease }}
            className="lg:col-span-7"
          >
            {/* service cards */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {SERVICES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setService(s.id)}
                  className={`group flex flex-col gap-1.5 border p-4 text-left transition-colors ${
                    service === s.id
                      ? 'border-accent bg-accent/5'
                      : 'border-border hover:border-foreground/40'
                  }`}
                >
                  <span className={`font-display text-base font-medium ${service === s.id ? 'text-accent' : 'text-foreground'}`}>
                    {s.label}
                  </span>
                  <span className="font-mono text-[0.62rem] leading-relaxed text-muted-foreground">
                    {s.desc}
                  </span>
                </button>
              ))}
            </div>

            {/* calendar */}
            <div className="mt-6 border border-border bg-card p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-accent" />
                <span className="hud-label text-muted-foreground">fecha disponible</span>
              </div>
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(d) =>
                    d < new Date(new Date().setHours(0, 0, 0, 0)) ||
                    d.getDay() === 0
                  }
                  locale={undefined}
                  className="rounded-none"
                />
                <div className="flex-1">
                  <div className="mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-accent" />
                    <span className="hud-label text-muted-foreground">horario</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {TIMES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTime(t)}
                        className={`h-11 border font-mono text-sm tnum transition-colors ${
                          time === t
                            ? 'border-accent bg-accent text-background'
                            : 'border-border hover:border-foreground/40'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  {date && (
                    <div className="mt-4 border border-border/60 bg-background p-3">
                      <div className="hud-label text-accent">selección</div>
                      <div className="mt-1 font-display text-lg capitalize">
                        {mxDate(date)}
                      </div>
                      <div className="font-mono text-sm text-muted-foreground tnum">
                        {time || '— : —'} · {SERVICES.find((s) => s.id === service)?.label}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact form */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, delay: 0.1, ease }}
            className="lg:col-span-5"
          >
            <div className="border border-border bg-card p-6 sm:p-8">
              {done ? (
                <div className="flex flex-col items-start gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-background">
                    <Check className="h-6 w-6" />
                  </span>
                  <h3 className="font-display text-2xl font-medium tracking-tight">
                    Cita confirmada
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Folio <span className="font-mono text-foreground">CITA-{Date.now().toString().slice(-6)}</span>.
                    Te esperamos {date ? mxDate(date) : 'próximamente'} a las{' '}
                    <span className="font-mono">{time}</span>. Recibirás la
                    confirmación en <span className="font-mono">{email}</span>.
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDone(false)
                      setDate(undefined)
                      setTime('')
                    }}
                    className="h-9 rounded-none px-0 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground hover:bg-transparent hover:text-accent"
                  >
                    ← agendar otra cita
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-border pb-4">
                    <MapPin className="h-4 w-4 text-accent" />
                    <span className="hud-label text-muted-foreground">datos de contacto</span>
                  </div>
                  <div>
                    <Label htmlFor="na" className="hud-label mb-1.5 block text-muted-foreground">
                      Nombre completo
                    </Label>
                    <Input
                      id="na"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-11 rounded-none border-border bg-background focus:border-accent"
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="em" className="hud-label mb-1.5 block text-muted-foreground">
                        Correo
                      </Label>
                      <Input
                        id="em"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11 rounded-none border-border bg-background focus:border-accent"
                        placeholder="correo@mx"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ph" className="hud-label mb-1.5 block text-muted-foreground">
                        Teléfono
                      </Label>
                      <Input
                        id="ph"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="h-11 rounded-none border-border bg-background focus:border-accent"
                        placeholder="55 1234 5678"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="ad" className="hud-label mb-1.5 block text-muted-foreground">
                      Dirección de la obra
                    </Label>
                    <Input
                      id="ad"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="h-11 rounded-none border-border bg-background focus:border-accent"
                      placeholder="Calle, número, colonia, alcaldía"
                    />
                  </div>
                  <div>
                    <Label htmlFor="no" className="hud-label mb-1.5 block text-muted-foreground">
                      Notas (opcional)
                    </Label>
                    <Textarea
                      id="no"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="min-h-[80px] rounded-none border-border bg-background focus:border-accent"
                      placeholder="Acceso, estacionamiento, referencias…"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="h-12 w-full gap-2 rounded-none bg-foreground font-mono text-xs uppercase tracking-[0.16em] hover:bg-accent"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Confirmar cita <ArrowUpRight className="h-4 w-4" />
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
