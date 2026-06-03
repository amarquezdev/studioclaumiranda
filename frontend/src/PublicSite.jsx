import Navbar from './components/Navbar'
import SageLanding from './components/SageLanding'
import BookingSection from './components/BookingSection'
import Reviews from './components/Reviews'
import Footer from './components/Footer'
import WhatsAppButton from './components/WhatsAppButton'

export default function PublicSite() {
  return (
    <div className="min-h-screen bg-background font-serif">
      <Navbar />
      <SageLanding />
      <BookingSection />
      <Reviews />
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
