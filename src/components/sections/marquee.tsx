'use client'

const ITEMS = [
  'Cotización instantánea',
  'Medición certificada',
  'Vidrio templado NOM-006',
  'Instalación en CDMX y zona metro',
  'Vitral de autor',
  'Entrega 48–72 h',
  'Garantía 5 años',
  'Atelier en vivo',
]

export function Marquee() {
  const loop = [...ITEMS, ...ITEMS]
  return (
    <div className="relative border-y border-border/60 bg-foreground text-background">
      <div className="flex overflow-hidden py-3">
        <div className="marquee-track flex shrink-0 items-center">
          {loop.map((item, i) => (
            <div key={i} className="flex items-center">
              <span className="px-6 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-background/80">
                {item}
              </span>
              <span className="text-accent">✦</span>
            </div>
          ))}
        </div>
        <div className="marquee-track flex shrink-0 items-center" aria-hidden="true">
          {loop.map((item, i) => (
            <div key={i} className="flex items-center">
              <span className="px-6 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-background/80">
                {item}
              </span>
              <span className="text-accent">✦</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
