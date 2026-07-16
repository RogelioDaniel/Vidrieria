'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { CalendarClock, Check, Loader2, MapPin, Clock, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { toast } from 'sonner'
import { GlassReveal } from '@/components/glass-reveal'

const ease = [0.65, 0, 0.35, 1] as const

const SERVICES = [
  { id: 'medicion', label: 'Medición en obra', desc: 'Técnico con láser digital, sin costo en CDMX.' },
  { id: 'consulta', label: 'Consulta en taller', desc: 'Asesoría con muestras físicas en Col. del Valle.' },
  { id: 'instalacion', label: 'Instalación', desc: 'Agenda de montaje para obra en curso.' },
]

const TIMES = ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00']

const STEPS = ['Servicio', 'Fecha y horario', 'Tus datos'] as const
type AppointmentStep = 0 | 1 | 2

function mxDate(d: Date) {
  return d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
}

export function Appointments() {
  const reduce = useReducedMotion()
  const [step, setStep] = React.useState<AppointmentStep>(0)
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
  const stepHeadingRef = React.useRef<HTMLHeadingElement>(null)
  const doneHeadingRef = React.useRef<HTMLHeadingElement>(null)
  const focusStepRef = React.useRef(false)

  React.useEffect(() => {
    if (!focusStepRef.current) return
    const frame = window.requestAnimationFrame(() => {
      stepHeadingRef.current?.focus({ preventScroll: true })
    })
    focusStepRef.current = false
    return () => window.cancelAnimationFrame(frame)
  }, [step])

  React.useEffect(() => {
    if (!done) return
    const frame = window.requestAnimationFrame(() => {
      doneHeadingRef.current?.focus({ preventScroll: true })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [done])

  function goToStep(next: AppointmentStep) {
    focusStepRef.current = true
    setStep(next)
  }

  function continueFromSchedule() {
    if (!date || !time) {
      toast.error('Elige fecha y horario.')
      return
    }
    goToStep(2)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!date || !time) {
      toast.error('Elige fecha y horario.')
      goToStep(1)
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
    <section
      id="cita"
      className="viewport-section relative bg-background py-10 sm:py-14 lg:py-12"
    >
      <div className="viewport-section__body mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-4 border-b border-border pb-5 sm:pb-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <GlassReveal>
              <div className="mb-3 flex items-center gap-3">
                <span className="hud-label text-accent">06 · agenda</span>
                <span className="h-px w-12 bg-accent/40" />
              </div>
              <h2 className="font-display text-3xl font-light leading-[1.05] tracking-[-0.02em] sm:text-4xl lg:text-5xl">
                Agenda tu cita
                <br />
                <span className="italic text-accent">de medición.</span>
              </h2>
            </GlassReveal>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
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

        <ol
          aria-label="Progreso de la cita"
          className="mt-5 grid grid-cols-3 border border-border bg-card"
        >
          {STEPS.map((label, index) => {
            const current = index === step
            const complete = index < step || done
            return (
              <li
                key={label}
                aria-label={`${index + 1}. ${label}${current && !done ? ', paso actual' : ''}`}
                aria-current={current && !done ? 'step' : undefined}
                className={`flex min-h-11 items-center gap-2 border-r border-border px-2 last:border-r-0 sm:px-4 ${
                  current && !done ? 'bg-accent/10 text-foreground' : 'text-muted-foreground'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`flex h-5 w-5 shrink-0 items-center justify-center border font-mono text-[0.58rem] ${
                    current || complete
                      ? 'border-accent bg-accent text-background'
                      : 'border-border'
                  }`}
                >
                  {complete ? '✓' : index + 1}
                </span>
                <span className="hidden font-mono text-[0.62rem] uppercase tracking-[0.1em] sm:inline">
                  {label}
                </span>
                <span className="font-mono text-[0.6rem] sm:hidden">{index + 1}/3</span>
              </li>
            )
          })}
        </ol>

        <div className="mt-4 min-h-[23rem] border border-border bg-card p-4 sm:min-h-[25rem] sm:p-6">
          {done ? (
            <div
              className="flex min-h-[20rem] flex-col items-start justify-center gap-4"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-background">
                <Check className="h-6 w-6" />
              </span>
              <h3
                ref={doneHeadingRef}
                tabIndex={-1}
                className="font-display text-2xl font-medium tracking-tight outline-none"
              >
                Cita confirmada
              </h3>
              <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                Folio{' '}
                <span className="font-mono text-foreground">
                  CITA-{Date.now().toString().slice(-6)}
                </span>
                . Te esperamos {date ? mxDate(date) : 'próximamente'} a las{' '}
                <span className="font-mono">{time}</span>. Recibirás la
                confirmación en <span className="font-mono">{email}</span>.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setDone(false)
                  setDate(undefined)
                  setTime('')
                  goToStep(0)
                }}
                className="h-11 rounded-none px-5 font-mono text-[0.65rem] uppercase tracking-[0.14em]"
              >
                ← agendar otra cita
              </Button>
            </div>
          ) : (
            <motion.div
              key={step}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease }}
            >
              {step === 0 && (
                <div>
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <CalendarClock className="h-4 w-4 text-accent" />
                    <h3
                      id="appointment-service-heading"
                      ref={stepHeadingRef}
                      tabIndex={-1}
                      className="font-display text-xl font-medium tracking-tight outline-none"
                    >
                      Elige el servicio
                    </h3>
                  </div>
                  <div
                    role="group"
                    aria-labelledby="appointment-service-heading"
                    className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3"
                  >
                    {SERVICES.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        aria-pressed={service === s.id}
                        onClick={() => setService(s.id)}
                        className={`group flex min-h-20 flex-col gap-1.5 border p-4 text-left transition-colors ${
                          service === s.id
                            ? 'border-accent bg-accent/5'
                            : 'border-border hover:border-foreground/40'
                        }`}
                      >
                        <span
                          className={`font-display text-base font-medium ${
                            service === s.id ? 'text-accent' : 'text-foreground'
                          }`}
                        >
                          {s.label}
                        </span>
                        <span className="font-mono text-[0.62rem] leading-relaxed text-muted-foreground">
                          {s.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-5 flex justify-end border-t border-border pt-4">
                    <Button
                      type="button"
                      onClick={() => goToStep(1)}
                      className="h-11 w-full rounded-none bg-foreground px-6 font-mono text-xs uppercase tracking-[0.14em] sm:w-auto"
                    >
                      Elegir fecha <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div>
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <CalendarClock className="h-4 w-4 text-accent" />
                    <h3
                      id="appointment-schedule-heading"
                      ref={stepHeadingRef}
                      tabIndex={-1}
                      className="font-display text-xl font-medium tracking-tight outline-none"
                    >
                      Fecha y horario
                    </h3>
                  </div>
                  <div className="mt-3 grid grid-cols-[minmax(0,1fr)_5.5rem] items-start gap-3 md:grid-cols-[auto_1fr] md:gap-6">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(d) =>
                        d < new Date(new Date().setHours(0, 0, 0, 0)) ||
                        d.getDay() === 0
                      }
                      locale={undefined}
                      className="mx-auto rounded-none p-0 md:mx-0"
                    />
                    <div className="min-w-0">
                      <div className="mb-2 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-accent" />
                        <span className="hud-label text-muted-foreground">horario</span>
                      </div>
                      <div role="group" aria-label="Horario" className="grid grid-cols-1 gap-2 md:grid-cols-3">
                        {TIMES.map((t) => (
                          <button
                            key={t}
                            type="button"
                            aria-pressed={time === t}
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
                        <div className="mt-2 border-t border-border/60 pt-2">
                          <div className="font-display text-sm capitalize sm:text-base">
                            {mxDate(date)}
                          </div>
                          <div className="font-mono text-[0.65rem] text-muted-foreground tnum sm:text-xs">
                            {time || '— : —'} ·{' '}
                            {SERVICES.find((s) => s.id === service)?.label}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex gap-3 border-t border-border pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => goToStep(0)}
                      className="h-11 flex-1 rounded-none font-mono text-xs uppercase tracking-[0.14em] sm:flex-none sm:px-6"
                    >
                      Atrás
                    </Button>
                    <Button
                      type="button"
                      onClick={continueFromSchedule}
                      className="h-11 flex-1 rounded-none bg-foreground font-mono text-xs uppercase tracking-[0.14em] sm:ml-auto sm:flex-none sm:px-6"
                    >
                      Tus datos <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <form onSubmit={handleSubmit}>
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <MapPin className="h-4 w-4 text-accent" />
                    <h3
                      id="appointment-details-heading"
                      ref={stepHeadingRef}
                      tabIndex={-1}
                      className="font-display text-xl font-medium tracking-tight outline-none"
                    >
                      Datos de contacto
                    </h3>
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Label htmlFor="na" className="hud-label mb-1 block text-muted-foreground">
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
                    <div>
                      <Label htmlFor="em" className="hud-label mb-1 block text-muted-foreground">
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
                      <Label htmlFor="ph" className="hud-label mb-1 block text-muted-foreground">
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
                    <div>
                      <Label htmlFor="ad" className="hud-label mb-1 block text-muted-foreground">
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
                      <Label htmlFor="no" className="hud-label mb-1 block text-muted-foreground">
                        Notas (opcional)
                      </Label>
                      <Textarea
                        id="no"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="min-h-[68px] rounded-none border-border bg-background focus:border-accent"
                        placeholder="Acceso, estacionamiento, referencias…"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex gap-3 border-t border-border pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => goToStep(1)}
                      className="h-11 flex-1 rounded-none font-mono text-xs uppercase tracking-[0.14em] sm:flex-none sm:px-6"
                    >
                      Atrás
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="h-11 flex-1 gap-2 rounded-none bg-foreground font-mono text-xs uppercase tracking-[0.14em] hover:bg-accent sm:ml-auto sm:flex-none sm:px-7"
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Confirmar <ArrowUpRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
