import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useFullPageScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.3,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })

    // Keep GSAP ScrollTrigger in sync with Lenis scroll position
    lenis.on('scroll', ScrollTrigger.update)

    const onFrame = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(onFrame)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(onFrame)
      lenis.destroy()
    }
  }, [])
}
