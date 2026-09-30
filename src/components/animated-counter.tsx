'use client'

import * as React from 'react'
import { motion, useInView, useMotionValue, animate } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  duration?: number
  format?: (n: number) => string
  className?: string
}

export function AnimatedCounter({
  value,
  duration = 1.5,
  format = (n) => Math.round(n).toString(),
  className,
}: AnimatedCounterProps) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const motionValue = useMotionValue(0)
  const [display, setDisplay] = React.useState('0')

  React.useEffect(() => {
    if (inView) {
      const controls = animate(motionValue, value, {
        duration,
        ease: [0.22, 1, 0.36, 1],
        onUpdate: (v) => setDisplay(format(v)),
      })
      return controls.stop
    }
  }, [inView, value, duration, format, motionValue])

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  )
}
