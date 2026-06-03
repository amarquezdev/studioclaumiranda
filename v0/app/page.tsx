import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ServicesSection } from "@/components/services-section"
import { AboutSection } from "@/components/about-section"
import { BookingSection } from "@/components/booking-section"
import { ReviewsSection } from "@/components/reviews-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <ServicesSection />
      <AboutSection />
      <div id="booking">
        <BookingSection />
      </div>
      <ReviewsSection />
      <Footer />
    </main>
  )
}
