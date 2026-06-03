"use client"

import { useState } from "react"
import { Calendar, Clock, Scissors, User, Check, ChevronRight, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"

const services = [
  { id: 1, name: "Corte de Cabello", duration: "45 min", price: "$35" },
  { id: 2, name: "Coloración", duration: "2 hrs", price: "$120" },
  { id: 3, name: "Tratamiento Capilar", duration: "1 hr", price: "$75" },
  { id: 4, name: "Peinado", duration: "1 hr", price: "$55" },
  { id: 5, name: "Manicure & Pedicure", duration: "1.5 hrs", price: "$65" },
  { id: 6, name: "Maquillaje Profesional", duration: "1 hr", price: "$85" },
]

const stylists = [
  { id: 1, name: "María García", specialty: "Colorista Senior" },
  { id: 2, name: "Ana López", specialty: "Estilista Experta" },
  { id: 3, name: "Carmen Ruiz", specialty: "Especialista en Tratamientos" },
]

const timeSlots = [
  "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"
]

export function BookingSection() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedService, setSelectedService] = useState<number | null>(null)
  const [selectedStylist, setSelectedStylist] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")

  const steps = [
    { number: 1, title: "Servicio", icon: Scissors },
    { number: 2, title: "Estilista", icon: User },
    { number: 3, title: "Fecha", icon: Calendar },
    { number: 4, title: "Hora", icon: Clock },
  ]

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedService !== null
      case 2: return selectedStylist !== null
      case 3: return selectedDate !== ""
      case 4: return selectedTime !== ""
      default: return false
    }
  }

  const handleNext = () => {
    if (canProceed() && currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const generateDates = () => {
    const dates = []
    const today = new Date()
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      if (date.getDay() !== 0) {
        dates.push({
          full: date.toISOString().split("T")[0],
          day: date.toLocaleDateString("es-ES", { weekday: "short" }),
          number: date.getDate(),
          month: date.toLocaleDateString("es-ES", { month: "short" }),
        })
      }
    }
    return dates.slice(0, 10)
  }

  return (
    <section className="py-24 px-6 lg:px-12 bg-secondary">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-primary text-sm tracking-[0.3em] uppercase mb-4">Reserva tu cita</p>
          <h2 className="text-4xl md:text-5xl font-light text-foreground tracking-wide">
            Tu <span className="italic">Momento</span> de Belleza
          </h2>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-16">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                    currentStep >= step.number
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground"
                  )}
                >
                  {currentStep > step.number ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <span className={cn(
                  "mt-2 text-xs tracking-wider uppercase",
                  currentStep >= step.number ? "text-primary" : "text-muted-foreground"
                )}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  "w-16 md:w-24 h-px mx-2 transition-all duration-300",
                  currentStep > step.number ? "bg-primary" : "bg-border"
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-card border border-border p-8 md:p-12 min-h-[400px]">
          {/* Step 1: Select Service */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-light text-foreground mb-8 text-center">Selecciona un servicio</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => setSelectedService(service.id)}
                    className={cn(
                      "p-6 text-left border transition-all duration-300 hover:border-primary group",
                      selectedService === service.id
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                          {service.name}
                        </h4>
                        <p className="text-muted-foreground text-sm mt-1">{service.duration}</p>
                      </div>
                      <span className="text-primary font-medium">{service.price}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Select Stylist */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-light text-foreground mb-8 text-center">Elige tu estilista</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {stylists.map((stylist) => (
                  <button
                    key={stylist.id}
                    onClick={() => setSelectedStylist(stylist.id)}
                    className={cn(
                      "p-8 text-center border transition-all duration-300 hover:border-primary group",
                      selectedStylist === stylist.id
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    )}
                  >
                    <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                      <User className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h4 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                      {stylist.name}
                    </h4>
                    <p className="text-muted-foreground text-sm mt-1">{stylist.specialty}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Select Date */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-light text-foreground mb-8 text-center">Selecciona la fecha</h3>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
                {generateDates().map((date) => (
                  <button
                    key={date.full}
                    onClick={() => setSelectedDate(date.full)}
                    className={cn(
                      "p-4 text-center border transition-all duration-300 hover:border-primary",
                      selectedDate === date.full
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border"
                    )}
                  >
                    <span className="text-xs uppercase tracking-wider block">{date.day}</span>
                    <span className="text-2xl font-light block my-1">{date.number}</span>
                    <span className="text-xs uppercase tracking-wider block">{date.month}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Select Time */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-light text-foreground mb-8 text-center">Selecciona la hora</h3>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4 max-w-2xl mx-auto">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={cn(
                      "py-4 px-6 text-center border transition-all duration-300 hover:border-primary",
                      selectedTime === time
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border"
                    )}
                  >
                    <span className="text-lg">{time}</span>
                  </button>
                ))}
              </div>
              
              {selectedTime && selectedService && selectedStylist && selectedDate && (
                <div className="mt-12 p-6 border border-primary bg-primary/5 text-center">
                  <h4 className="text-xl font-medium text-foreground mb-4">Resumen de tu cita</h4>
                  <p className="text-muted-foreground">
                    {services.find(s => s.id === selectedService)?.name} con {stylists.find(s => s.id === selectedStylist)?.name}
                  </p>
                  <p className="text-primary text-lg mt-2">
                    {new Date(selectedDate).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })} a las {selectedTime}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={cn(
              "flex items-center gap-2 px-6 py-3 border border-border text-foreground transition-all duration-300",
              currentStep === 1
                ? "opacity-50 cursor-not-allowed"
                : "hover:border-primary hover:text-primary"
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            Atrás
          </button>
          
          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={cn(
                "flex items-center gap-2 px-8 py-3 transition-all duration-300",
                canProceed()
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              disabled={!canProceed()}
              className={cn(
                "flex items-center gap-2 px-8 py-3 transition-all duration-300",
                canProceed()
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              Confirmar Reserva
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
