'use client'

/**
 * GlassReveal — the site's recurring "glass" motif for scroll entrances.
 *
 * Wraps a block (typically a section's eyebrow + heading) so it settles gently
 * into view. The former white refraction streak was removed: section changes
 * now reserve the visual emphasis for the recurring pane assembly.
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
    </motion.div>
  )
}
