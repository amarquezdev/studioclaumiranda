import { SiteHeader } from './components/SiteHeader'
import { Hero } from './components/Hero'
import { Testimonial } from './components/Testimonial'
import { Booking } from './components/Booking'
import { About } from './components/About'
import { BrandSlider } from './components/BrandSlider'
import { Gallery } from './components/Gallery'
import { Footer } from './components/Footer'

export default function PublicSite() {
  return (
    <main className="bg-background">
      <SiteHeader />
      <Hero />
      <Testimonial />
      <Booking />
      <About />
      <BrandSlider />
      <Gallery />
      <Footer />
    </main>
  )
}
