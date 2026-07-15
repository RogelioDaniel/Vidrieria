'use client'

/**
 * GlassReveal — the site's recurring "glass" motif for scroll entrances.
 *
 * Wraps a block (typically a section's eyebrow + heading) so it clears from a
 * frosted blur as it scrolls into view, with a single copper-white refraction
 * streak crossing it once — the same "lit-from-within glass" language as the
 * hero panel, felt throughout the page instead of only at the top.
 */

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const ease = [0.65, 0, 0.35, 1] as const

export function GlassReveal({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      className={`relative${className ? ` ${className}` : ''}`}
      initial={reduce ? false : { opacity: 0, y: 18, filter: 'blur(10px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.75, ease }}
    >
      {children}

      {!reduce && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: [0, 1, 0] }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.95, ease, delay: 0.2 }}
        >
          <motion.div
            className="absolute -inset-y-6 w-1/3"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(184,115,51,0.5), rgba(255,255,255,0.4), transparent)',
              filter: 'blur(6px)',
            }}
            initial={{ x: '-40%' }}
            whileInView={{ x: '340%' }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.95, ease, delay: 0.2 }}
          />
        </motion.div>
      )}
    </motion.div>
  )
}
