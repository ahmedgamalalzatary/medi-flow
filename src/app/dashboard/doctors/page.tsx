"use client"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Search,
  Filter,
  MapPin,
  Star,
  DollarSign,
  Award,
  Calendar,
  MessageSquare,
  Phone,
  Mail,
  Languages,
  TrendingUp
} from "lucide-react"

interface Doctor {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  specialty: string
  qualifications?: string[]
  experience: number
  bio?: string
  consultationFee: number
  location?: string
  languages?: string[]
  rating: number
  totalConsultations: number
  isAvailable: boolean
}

interface SearchFilters {
  specialty: string
  location: string
  minRating: number
  maxFee: number
  availability: boolean
}

export default function Doctors() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [currentRole, setCurrentRole] = useState<"patient" | "doctor">("patient")
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<SearchFilters>({
    specialty: "",
    location: "",
    minRating: 0,
    maxFee: 1000,
    availability: false
  })
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/signin")
      return
    }

    if (!authLoading && user && profile) {
      setLoading(false)
      if (profile.role === "DOCTOR") {
        setCurrentRole("doctor")
      }
      fetchDoctors()
    }
  }, [authLoading, user, profile, router])

  const fetchDoctors = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (filters.specialty) params.append("specialty", filters.specialty)
      if (filters.location) params.append("location", filters.location)
      if (filters.minRating > 0) params.append("minRating", filters.minRating.toString())
      if (filters.maxFee < 1000) params.append("maxFee", filters.maxFee.toString())
      if (filters.availability) params.append("availability", "true")

      const response = await fetch(`/api/doctors?${params}`)
      if (response.ok) {
        const data = await response.json()
        setDoctors(data.doctors || [])
      }
    } catch (error) {
      console.error("Error fetching doctors:", error)
    }
  }

  useEffect(() => {
    fetchDoctors()
  }, [searchTerm, filters])

  const handleBookAppointment = (doctorId: string) => {
    router.push(`/dashboard/book-appointment?doctorId=${doctorId}`)
  }

  const specialties = [
    "Cardiology", "Dermatology", "Endocrinology", "Gastroenterology",
    "General Practice", "Neurology", "Obstetrics & Gynecology",
    "Oncology", "Ophthalmology", "Orthopedics", "Pediatrics",
    "Psychiatry", "Pulmonology", "Radiology", "Surgery", "Urology"
  ]

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.bio?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSpecialty = !filters.specialty || doctor.specialty === filters.specialty
    const matchesLocation = !filters.location || doctor.location?.toLowerCase().includes(filters.location.toLowerCase())
    const matchesRating = doctor.rating >= filters.minRating
    const matchesFee = doctor.consultationFee <= filters.maxFee
    const matchesAvailability = !filters.availability || doctor.isAvailable

    return matchesSearch && matchesSpecialty && matchesLocation && matchesRating && matchesFee && matchesAvailability
  })

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

  if (!user || !profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentRole={currentRole} onRoleSwitch={setCurrentRole} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Doctors</h1>
          <p className="text-gray-600">Connect with qualified healthcare professionals</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, specialty, or condition..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Filter Doctors</DialogTitle>
                <DialogDescription>
                  Narrow down your search with specific criteria
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Specialty</label>
                  <select
                    value={filters.specialty}
                    onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">All Specialties</option>
                    {specialties.map(specialty => (
                      <option key={specialty} value={specialty}>{specialty}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <Input
                    placeholder="City, state, or country"
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Minimum Rating: {filters.minRating}+ stars
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={filters.minRating}
                    onChange={(e) => setFilters({ ...filters, minRating: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Maximum Fee: ${filters.maxFee}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="50"
                    value={filters.maxFee}
                    onChange={(e) => setFilters({ ...filters, maxFee: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="availability"
                    checked={filters.availability}
                    onChange={(e) => setFilters({ ...filters, availability: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="availability" className="text-sm">
                    Available now
                  </label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsFilterDialogOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Found {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''}
            {filters.specialty && ` in ${filters.specialty}`}
            {filters.location && ` near ${filters.location}`}
          </p>
        </div>

        {/* Doctors Grid */}
        {filteredDoctors.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria or filters
              </p>
              <Button onClick={() => {
                setSearchTerm("")
                setFilters({
                  specialty: "",
                  location: "",
                  minRating: 0,
                  maxFee: 1000,
                  availability: false
                })
              }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map(doctor => (
              <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={doctor.avatar} alt={doctor.name} />
                      <AvatarFallback>
                        {doctor.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{doctor.name}</CardTitle>
                      <CardDescription className="font-medium text-blue-600">
                        {doctor.specialty}
                      </CardDescription>
                      <div className="flex items-center space-x-1 mt-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{doctor.rating}</span>
                        <span className="text-sm text-gray-500">({doctor.totalConsultations} consultations)</span>
                      </div>
                    </div>
                    {doctor.isAvailable && (
                      <Badge className="bg-green-100 text-green-800">
                        Available
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {doctor.bio && (
                    <p className="text-sm text-gray-600 line-clamp-3">{doctor.bio}</p>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {doctor.location || "Location not specified"}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Award className="h-4 w-4 mr-2" />
                      {doctor.experience} years experience
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2" />
                      ${doctor.consultationFee}/hour
                    </div>
                    {doctor.languages && doctor.languages.length > 0 && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Languages className="h-4 w-4 mr-2" />
                        {doctor.languages.join(', ')}
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleBookAppointment(doctor.id)}
                    >
                      <Calendar className="h-3 w-3 mr-1" />
                      Book
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedDoctor(doctor)}
                    >
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Doctor Profile Dialog */}
      {selectedDoctor && (
        <Dialog open={!!selectedDoctor} onOpenChange={() => setSelectedDoctor(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={selectedDoctor.avatar} alt={selectedDoctor.name} />
                  <AvatarFallback className="text-lg">
                    {selectedDoctor.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle className="text-2xl">{selectedDoctor.name}</DialogTitle>
                  <DialogDescription className="text-lg font-medium text-blue-600">
                    {selectedDoctor.specialty}
                  </DialogDescription>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="ml-1 font-medium">{selectedDoctor.rating}</span>
                      <span className="text-gray-500 ml-1">({selectedDoctor.totalConsultations})</span>
                    </div>
                    {selectedDoctor.isAvailable && (
                      <Badge className="bg-green-100 text-green-800">
                        Available Now
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              {selectedDoctor.bio && (
                <div>
                  <h3 className="font-semibold mb-2">About</h3>
                  <p className="text-gray-600">{selectedDoctor.bio}</p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Contact Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      {selectedDoctor.email}
                    </div>
                    {selectedDoctor.phone && (
                      <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        {selectedDoctor.phone}
                      </div>
                    )}
                    {selectedDoctor.location && (
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        {selectedDoctor.location}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Practice Details</h3>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Award className="h-4 w-4 mr-2 text-gray-400" />
                      {selectedDoctor.experience} years experience
                    </div>
                    <div className="flex items-center text-sm">
                      <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                      ${selectedDoctor.consultationFee}/hour
                    </div>
                    <div className="flex items-center text-sm">
                      <TrendingUp className="h-4 w-4 mr-2 text-gray-400" />
                      {selectedDoctor.totalConsultations} total consultations
                    </div>
                  </div>
                </div>
              </div>

              {selectedDoctor.qualifications && selectedDoctor.qualifications.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Qualifications</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDoctor.qualifications.map((qual, index) => (
                      <Badge key={index} variant="outline">{qual}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedDoctor.languages && selectedDoctor.languages.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDoctor.languages.map((lang, index) => (
                      <Badge key={index} variant="secondary">{lang}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <Button
                  className="flex-1"
                  onClick={() => {
                    setSelectedDoctor(null)
                    handleBookAppointment(selectedDoctor.id)
                  }}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Book Appointment
                </Button>
                <Button variant="outline">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}