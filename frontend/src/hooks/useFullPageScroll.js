import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

gsap.registerPlugin(ScrollToPlugin)

const DURATION = 1.1
const EASE     = 'expo.inOut'
const THRESHOLD = 60 // px — how close to section edge before snapping

export function useFullPageScroll() {
  const busy = useRef(false)

  useEffect(() => {
    const getSections = () => [...document.querySelectorAll('section, footer')]

    // Returns the index of the section the viewport is currently inside
    const currentIndex = (els) => {
      let idx = 0
      for (let i = 0; i < els.length; i++) {
        if (els[i].getBoundingClientRect().top <= 1) idx = i
      }
      return idx
    }

    const scrollTo = (el) => {
      busy.current = true
      gsap.to(window, {
        scrollTo: { y: el, autoKill: false },
        duration: DURATION,
        ease: EASE,
        onComplete() { busy.current = false },
      })
    }

    const onWheel = (e) => {
      // While animating, block any scroll that would interrupt
      if (busy.current) { e.preventDefault(); return }
      if (Math.abs(e.deltaY) < 5) return

      const els     = getSections()
      const idx     = currentIndex(els)
      const section = els[idx]

      if (e.deltaY > 0) {
        // Scrolling down — only snap if we're near the bottom of the current section
        const remaining = section.offsetTop + section.offsetHeight - (window.scrollY + window.innerHeight)
        if (remaining > THRESHOLD) return        // still content below, let native scroll handle it
        const next = els[idx + 1]
        if (!next) return
        e.preventDefault()
        scrollTo(next)
      } else {
        // Scrolling up — only snap if we're near the top of the current section
        if (window.scrollY > section.offsetTop + THRESHOLD) return
        const prev = els[idx - 1]
        if (!prev) return
        e.preventDefault()
        scrollTo(prev)
      }
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWheel)
  }, [])
}
