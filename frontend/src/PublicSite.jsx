import { lazy, Suspense } from 'react'
import { SiteHeader } from './components/SiteHeader'
import { Hero } from './components/Hero'
import { Testimonial } from './components/Testimonial'
import { About } from './components/About'
import { BrandSlider } from './components/BrandSlider'
import { Footer } from './components/Footer'
import WhatsAppButton from './components/WhatsAppButton'
import { useFullPageScroll } from './hooks/useFullPageScroll'

const Booking = lazy(() => import('./components/Booking').then(m => ({ default: m.Booking })))
const Gallery = lazy(() => import('./components/Gallery').then(m => ({ default: m.Gallery })))

export default function PublicSite() {
  useFullPageScroll()
  return (
    <main className="bg-background">
      <SiteHeader />
      <Hero />
      <Testimonial />
      <Suspense fallback={<div className="min-h-[480px] bg-background" />}>
        <Booking />
      </Suspense>
      <About />
      <BrandSlider />
      <Suspense fallback={<div className="min-h-[400px] bg-background" />}>
        <Gallery />
      </Suspense>
      <Footer />
      <WhatsAppButton />
    </main>
  )
}
