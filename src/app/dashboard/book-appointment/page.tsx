"use client"

import { useAuth } from "@/hooks/use-auth"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  DollarSign,
  Star,
  AlertTriangle,
  CheckCircle,
  Loader2
} from "lucide-react"

interface Doctor {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  specialty: string
  experience: number
  bio?: string
  consultationFee: number
  location?: string
  languages?: string[]
  rating: number
  totalConsultations: number
  isAvailable: boolean
}

interface TimeSlot {
  time: string
  available: boolean
}

interface Availability {
  dayOfWeek: number
  startTime: string
  endTime: string
  isBlocked: boolean
}

export default function BookAppointment() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const doctorId = searchParams.get("doctorId")
  const [currentRole, setCurrentRole] = useState<"patient" | "doctor">("patient")
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>()
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [availability, setAvailability] = useState<Availability[]>([])
  const [appointmentData, setAppointmentData] = useState({
    type: "REGULAR",
    duration: "MINUTES_30",
    illness: "",
    specificNeeds: "",
    questions: "",
    isEmergency: false
  })
  const [step, setStep] = useState(1)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated") {
      setLoading(false)
      if (session?.user?.role === "DOCTOR") {
        setCurrentRole("doctor")
      }
      
      if (doctorId) {
        fetchDoctor(doctorId)
      }
    }
  }, [status, session, router, doctorId])

  const fetchDoctor = async (id: string) => {
    try {
      const response = await fetch(`/api/doctors/${id}`)
      if (response.ok) {
        const data = await response.json()
        setDoctor(data.doctor)
        fetchDoctorAvailability(id)
      }
    } catch (error) {
      console.error("Error fetching doctor:", error)
      setError("Failed to load doctor information")
    }
  }

  const fetchDoctorAvailability = async (id: string) => {
    try {
      const response = await fetch(`/api/doctors/${id}/availability`)
      if (response.ok) {
        const data = await response.json()
        setAvailability(data.availability || [])
      }
    } catch (error) {
      console.error("Error fetching doctor availability:", error)
    }
  }

  const generateTimeSlots = (date: Date) => {
    if (!date) return []

    const dayOfWeek = date.getDay()
    const dayAvailability = availability.find(avail => avail.dayOfWeek === dayOfWeek && !avail.isBlocked)
    
    if (!dayAvailability) {
      setTimeSlots([])
      return
    }

    const slots: TimeSlot[] = []
    const startHour = parseInt(dayAvailability.startTime.split(':')[0])
    const startMinute = parseInt(dayAvailability.startTime.split(':')[1])
    const endHour = parseInt(dayAvailability.endTime.split(':')[0])
    const endMinute = parseInt(dayAvailability.endTime.split(':')[1])

    let currentHour = startHour
    let currentMinute = startMinute

    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      const time = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
      slots.push({
        time,
        available: true // In a real app, you'd check against existing appointments
      })

      currentMinute += 30
      if (currentMinute >= 60) {
        currentHour++
        currentMinute = 0
      }
    }

    setTimeSlots(slots)
  }

  useEffect(() => {
    if (selectedDate && availability.length > 0) {
      generateTimeSlots(selectedDate)
    }
  }, [selectedDate, availability])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    if (!doctor || !selectedDate || !selectedTime) {
      setError("Please select a date and time")
      setIsSubmitting(false)
      return
    }

    try {
      // Create appointment datetime
      const [hours, minutes] = selectedTime.split(':').map(Number)
      const appointmentDateTime = new Date(selectedDate)
      appointmentDateTime.setHours(hours, minutes, 0, 0)

      // Calculate price based on duration
      const durationMap = {
        "MINUTES_10": 10/60,
        "MINUTES_30": 30/60,
        "HOURS_1": 1,
        "HOURS_2": 2
      }
      const duration = durationMap[appointmentData.duration as keyof typeof durationMap]
      const price = doctor.consultationFee * duration

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          doctorId: doctor.id,
          scheduledAt: appointmentDateTime.toISOString(),
          type: appointmentData.type,
          duration: appointmentData.duration,
          illness: appointmentData.illness,
          specificNeeds: appointmentData.specificNeeds,
          questions: appointmentData.questions,
          price
        })
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/dashboard/appointments/${data.appointment.id}/payment`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to create appointment")
      }
    } catch (error) {
      console.error("Error creating appointment:", error)
      setError("Failed to create appointment")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getDurationLabel = (duration: string) => {
    const labels = {
      "MINUTES_10": "10 minutes",
      "MINUTES_30": "30 minutes",
      "HOURS_1": "1 hour",
      "HOURS_2": "2 hours"
    }
    return labels[duration as keyof typeof labels] || duration
  }

  const calculatePrice = () => {
    if (!doctor) return 0
    
    const durationMap = {
      "MINUTES_10": 10/60,
      "MINUTES_30": 30/60,
      "HOURS_1": 1,
      "HOURS_2": 2
    }
    const duration = durationMap[appointmentData.duration as keyof typeof durationMap]
    return doctor.consultationFee * duration
  }

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session || !doctor) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentRole={currentRole} onRoleSwitch={setCurrentRole} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Appointment</h1>
            <p className="text-gray-600">Schedule your consultation with Dr. {doctor.name}</p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber}
                </div>
                <div className={`w-16 h-1 mx-2 ${
                  step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                }`}></div>
              </div>
            ))}
          </div>

          {/* Doctor Info Card */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={doctor.avatar} alt={doctor.name} />
                  <AvatarFallback>
                    {doctor.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">Dr. {doctor.name}</CardTitle>
                  <CardDescription className="text-lg font-medium text-blue-600">
                    {doctor.specialty}
                  </CardDescription>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="ml-1 font-medium">{doctor.rating}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {doctor.location || "Remote"}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-1" />
                      ${doctor.consultationFee}/hour
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Appointment Details */}
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Appointment Details</CardTitle>
                  <CardDescription>
                    Tell us about your appointment needs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="type">Appointment Type</Label>
                      <Select 
                        value={appointmentData.type} 
                        onValueChange={(value) => setAppointmentData({...appointmentData, type: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="REGULAR">Regular Consultation</SelectItem>
                          <SelectItem value="EMERGENCY">Emergency Appointment</SelectItem>
                        </SelectContent>
                      </Select>
                      {appointmentData.type === "EMERGENCY" && (
                        <Alert className="border-red-200 bg-red-50">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            Emergency appointments require doctor approval and may have higher priority.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration</Label>
                      <Select 
                        value={appointmentData.duration} 
                        onValueChange={(value) => setAppointmentData({...appointmentData, duration: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MINUTES_10">10 minutes</SelectItem>
                          <SelectItem value="MINUTES_30">30 minutes</SelectItem>
                          <SelectItem value="HOURS_1">1 hour</SelectItem>
                          <SelectItem value="HOURS_2">2 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="illness">Reason for Visit</Label>
                    <Textarea
                      id="illness"
                      placeholder="Describe your symptoms or reason for the appointment"
                      value={appointmentData.illness}
                      onChange={(e) => setAppointmentData({...appointmentData, illness: e.target.value})}
                      rows={3}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="specificNeeds">Specific Needs</Label>
                      <Textarea
                        id="specificNeeds"
                        placeholder="Any specific requirements or accommodations needed"
                        value={appointmentData.specificNeeds}
                        onChange={(e) => setAppointmentData({...appointmentData, specificNeeds: e.target.value})}
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="questions">Questions for Doctor</Label>
                      <Textarea
                        id="questions"
                        placeholder="List any questions you'd like to ask the doctor"
                        value={appointmentData.questions}
                        onChange={(e) => setAppointmentData({...appointmentData, questions: e.target.value})}
                        rows={2}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="button" onClick={() => setStep(2)}>
                      Continue to Scheduling
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Date & Time Selection */}
            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Select Date & Time</CardTitle>
                  <CardDescription>
                    Choose when you'd like to have your appointment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label className="block text-sm font-medium mb-2">Select Date</Label>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
                        className="rounded-md border"
                      />
                    </div>

                    <div>
                      <Label className="block text-sm font-medium mb-2">Available Times</Label>
                      {selectedDate ? (
                        <div className="grid grid-cols-3 gap-2">
                          {timeSlots.length > 0 ? (
                            timeSlots.map((slot) => (
                              <Button
                                key={slot.time}
                                type="button"
                                variant={selectedTime === slot.time ? "default" : "outline"}
                                disabled={!slot.available}
                                onClick={() => setSelectedTime(slot.time)}
                                className="text-sm"
                              >
                                {slot.time}
                              </Button>
                            ))
                          ) : (
                            <p className="text-gray-500 col-span-3 text-center py-4">
                              No available time slots for this date
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">
                          Please select a date first
                        </p>
                      )}
                    </div>
                  </div>

                  {selectedDate && selectedTime && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <div>
                          <p className="font-medium">Selected Appointment Time</p>
                          <p className="text-sm text-gray-600">
                            {selectedDate.toLocaleDateString()} at {selectedTime} ({getDurationLabel(appointmentData.duration)})
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button 
                      type="button" 
                      onClick={() => setStep(3)}
                      disabled={!selectedDate || !selectedTime}
                    >
                      Continue to Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Review & Confirm */}
            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Review & Confirm</CardTitle>
                  <CardDescription>
                    Review your appointment details before confirming
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-4">Appointment Details</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Doctor:</span>
                          <span>Dr. {doctor.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Specialty:</span>
                          <span>{doctor.specialty}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          <Badge variant={appointmentData.type === "EMERGENCY" ? "destructive" : "secondary"}>
                            {appointmentData.type}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duration:</span>
                          <span>{getDurationLabel(appointmentData.duration)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date & Time:</span>
                          <span>
                            {selectedDate?.toLocaleDateString()} at {selectedTime}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-4">Payment Information</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Consultation Fee:</span>
                          <span>${doctor.consultationFee}/hour</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duration:</span>
                          <span>{getDurationLabel(appointmentData.duration)}</span>
                        </div>
                        <div className="border-t pt-3">
                          <div className="flex justify-between font-semibold">
                            <span>Total Amount:</span>
                            <span>${calculatePrice()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {appointmentData.illness && (
                    <div>
                      <h3 className="font-semibold mb-2">Reason for Visit</h3>
                      <p className="text-gray-600">{appointmentData.illness}</p>
                    </div>
                  )}

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      By confirming this appointment, you agree to pay ${calculatePrice()} for the consultation. 
                      Payment will be processed before the appointment is confirmed.
                    </AlertDescription>
                  </Alert>

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setStep(2)}>
                      Back
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Appointment...
                        </>
                      ) : (
                        "Confirm & Pay"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}