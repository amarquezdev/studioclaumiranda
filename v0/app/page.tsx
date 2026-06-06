import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/hero"
import { Testimonial } from "@/components/testimonial"
import { Booking } from "@/components/booking"
import { BrandSlider } from "@/components/brand-slider"
import { Gallery } from "@/components/gallery"
import { SiteFooter } from "@/components/site-footer"

export default function Page() {
  return (
    <main className="bg-background">
      <SiteHeader />
      <Hero />
      <Testimonial />
      <Booking />
      <BrandSlider />
      <Gallery />
      <SiteFooter />
    </main>
  )
}
