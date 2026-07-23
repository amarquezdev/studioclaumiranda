import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Smooth scroll is a progressive enhancement — native scroll works fine
// meanwhile, so we defer loading/starting Lenis until the browser is idle
// instead of competing with the initial render for main-thread time.
export function useFullPageScroll() {
  useEffect(() => {
    let lenis
    let onFrame
    let cancelled = false

    const start = async () => {
      const { default: Lenis } = await import('lenis')
      if (cancelled) return

      lenis = new Lenis({
        duration: 1.3,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      })

      // Keep GSAP ScrollTrigger in sync with Lenis scroll position
      lenis.on('scroll', ScrollTrigger.update)

      onFrame = (time) => lenis.raf(time * 1000)
      gsap.ticker.add(onFrame)
      gsap.ticker.lagSmoothing(0)
    }

    const idleId = 'requestIdleCallback' in window
      ? requestIdleCallback(start, { timeout: 2000 })
      : setTimeout(start, 200)

    return () => {
      cancelled = true
      if ('cancelIdleCallback' in window) cancelIdleCallback(idleId)
      else clearTimeout(idleId)
      if (onFrame) gsap.ticker.remove(onFrame)
      lenis?.destroy()
    }
  }, [])
}
