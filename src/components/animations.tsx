'use client'

import * as React from 'react'
import { motion, useInView, type Variants } from 'framer-motion'

// ─── Easing + duration presets ────────────────────────────
export const EASE = [0.22, 1, 0.36, 1] as const
export const DURATION = 0.6

// ─── Variant presets ──────────────────────────────────────
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION, ease: EASE },
  },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DURATION, ease: EASE } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION, ease: EASE },
  },
}

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: DURATION, ease: EASE } },
}

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: DURATION, ease: EASE } },
}

// ─── Container variant for staggered children ─────────────
export const staggerContainer = (stagger = 0.08, delay = 0): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: stagger,
      delayChildren: delay,
    },
  },
})

// ─── Reveal component ─────────────────────────────────────
interface RevealProps {
  children: React.ReactNode
  variant?: keyof typeof variants
  delay?: number
  className?: string
  once?: boolean
  amount?: number
}

const variants = {
  fadeUp,
  fadeIn,
  scaleIn,
  slideInLeft,
  slideInRight,
}

export function Reveal({
  children,
  variant = 'fadeUp',
  delay = 0,
  className,
  once = true,
  amount = 0.2,
}: RevealProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once, amount })
  const selectedVariant = variants[variant]

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={selectedVariant}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  )
}

// ─── Stagger group + child ────────────────────────────────
interface StaggerGroupProps {
  children: React.ReactNode
  className?: string
  stagger?: number
  delay?: number
  once?: boolean
  amount?: number
}

export function StaggerGroup({
  children,
  className,
  stagger = 0.08,
  delay = 0,
  once = true,
  amount = 0.2,
}: StaggerGroupProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once, amount })

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={staggerContainer(stagger, delay)}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className,
  variant = 'fadeUp',
}: {
  children: React.ReactNode
  className?: string
  variant?: keyof typeof variants
}) {
  return (
    <motion.div className={className} variants={variants[variant]}>
      {children}
    </motion.div>
  )
}
