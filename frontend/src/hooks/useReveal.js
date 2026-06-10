import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Fade-up reveal on scroll for a single element.
 * Returns a ref to attach to the element.
 */
export function useReveal({ delay = 0, y = 24, duration = 1.4 } = {}) {
  const ref = useRef(null)
  useEffect(() => {
    if (!ref.current) return
    const el = ref.current
    gsap.from(el, {
      opacity: 0,
      y,
      duration,
      delay,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        once: true,
      },
    })
    return () => ScrollTrigger.getAll().forEach(t => t.vars.trigger === el && t.kill())
  }, [delay, y, duration])
  return ref
}
