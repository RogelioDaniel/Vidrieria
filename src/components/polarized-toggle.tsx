'use client'

import * as React from 'react'
import { Blend } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

export function PolarizedToggle({
  wide = false,
  className,
}: {
  wide?: boolean
  className?: string
}) {
  const [mounted, setMounted] = React.useState(false)
  const { resolvedTheme, setTheme } = useTheme()
  const polarized = mounted && resolvedTheme === 'dark'

  React.useEffect(() => setMounted(true), [])

  const action = polarized
    ? 'Cambiar a cristal claro'
    : 'Activar vidrio polarizado'

  return (
    <button
      type="button"
      aria-label={action}
      aria-pressed={polarized}
      title={action}
      disabled={!mounted}
      onClick={() => setTheme(polarized ? 'light' : 'dark')}
      className={cn(
        'group inline-flex min-h-11 items-center justify-center gap-2 border border-current/20 bg-background/75 px-3 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-foreground backdrop-blur-xl transition-[color,background-color,border-color] duration-300 hover:border-accent hover:text-accent disabled:cursor-wait disabled:opacity-60',
        wide && 'w-full justify-between px-4',
        className,
      )}
    >
      <span className="flex items-center gap-2">
        <Blend
          aria-hidden="true"
          className={cn(
            'h-4 w-4 transition-transform duration-500',
            polarized && 'rotate-180 fill-current/20',
          )}
        />
        <span>Polarizado</span>
      </span>
      <span
        aria-hidden="true"
        className={cn(
          'h-1.5 w-1.5 rounded-full border border-current/50 transition-all duration-300',
          polarized && 'border-accent bg-accent shadow-[0_0_9px_rgba(209,138,69,0.75)]',
        )}
      />
    </button>
  )
}
