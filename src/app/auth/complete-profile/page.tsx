"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { 
  Heart, 
  Calendar,
  Phone,
  Pill,
  CheckCircle,
  ArrowRight
} from "lucide-react"

export default function CompleteProfile() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [step, setStep] = useState(1)
  const totalSteps = 3

  const [formData, setFormData] = useState({
    dateOfBirth: "",
    gender: "",
    bloodType: "",
    allergies: "",
    medications: "",
    emergencyContact: "",
    emergencyPhone: ""
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/signin")
      return
    }

    // Check if profile is already complete
    if (!authLoading && user && profile) {
      // Check if medical information is already filled
      if (profile.role !== "PATIENT") {
        router.push("/dashboard")
        return
      }
      
      // For patients, check if they have completed their patient profile
      // We'll check this by looking at the patients table
      checkPatientProfile()
    }
  }, [authLoading, user, profile, router])

  const checkPatientProfile = async () => {
    try {
      const response = await fetch("/api/patients/check-profile", {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.isComplete) {
          router.push("/dashboard")
        }
      }
    } catch (error) {
      console.error("Error checking patient profile:", error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setError("Please sign in to complete your profile")
        return
      }

      const response = await fetch("/api/patients/complete-profile", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSuccess("Profile completed successfully!")
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      } else {
        const data = await response.json()
        setError(data.error || "Failed to complete profile")
      }
    } catch (error) {
      console.error("Error completing profile:", error)
      setError("An error occurred while completing your profile")
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    router.push("/dashboard")
  }

  if (authLoading) {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Heart className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900 ml-2">Mediflow</span>
          </div>
          <CardTitle className="text-2xl">Complete Your Medical Profile</CardTitle>
          <CardDescription>
            Help us provide better healthcare by completing your medical information
          </CardDescription>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Step {step} of {totalSteps}</span>
              <span>{Math.round((step / totalSteps) * 100)}% Complete</span>
            </div>
            <Progress value={(step / totalSteps) * 100} className="w-full" />
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-800 mb-4">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  <p className="text-gray-600">Let's start with some basic details</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bloodType">Blood Type</Label>
                    <select
                      id="bloodType"
                      name="bloodType"
                      value={formData.bloodType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Blood Type</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="Unknown">Unknown</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Medical Information */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <Pill className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold">Medical Information</h3>
                  <p className="text-gray-600">Help us understand your medical history</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="allergies">Allergies</Label>
                    <Input
                      id="allergies"
                      name="allergies"
                      type="text"
                      placeholder="List any allergies (e.g., Penicillin, Peanuts) or type 'None'"
                      value={formData.allergies}
                      onChange={handleInputChange}
                    />
                    <p className="text-xs text-gray-500">
                      Include any drug allergies, food allergies, or environmental allergies
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medications">Current Medications</Label>
                    <Input
                      id="medications"
                      name="medications"
                      type="text"
                      placeholder="List current medications or type 'None'"
                      value={formData.medications}
                      onChange={handleInputChange}
                    />
                    <p className="text-xs text-gray-500">
                      Include prescription medications, over-the-counter drugs, and supplements
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Emergency Contact */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <Phone className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold">Emergency Contact</h3>
                  <p className="text-gray-600">Someone we can contact in case of emergency</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Emergency Contact Name *</Label>
                    <Input
                      id="emergencyContact"
                      name="emergencyContact"
                      type="text"
                      placeholder="Full name of emergency contact"
                      value={formData.emergencyContact}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone">Emergency Contact Phone *</Label>
                    <Input
                      id="emergencyPhone"
                      name="emergencyPhone"
                      type="tel"
                      placeholder="Phone number of emergency contact"
                      value={formData.emergencyPhone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Emergency Contact */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <Phone className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold">Emergency Contact</h3>
                  <p className="text-gray-600">Someone we can contact in case of emergency</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Emergency Contact Name *</Label>
                    <Input
                      id="emergencyContact"
                      name="emergencyContact"
                      type="text"
                      placeholder="Full name of emergency contact"
                      value={formData.emergencyContact}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone">Emergency Contact Phone *</Label>
                    <Input
                      id="emergencyPhone"
                      name="emergencyPhone"
                      type="tel"
                      placeholder="Phone number of emergency contact"
                      value={formData.emergencyPhone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <div>
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={handleSkip}>
                  Skip for now
                </Button>
                
                {step < totalSteps ? (
                  <Button type="button" onClick={handleNext}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={loading}>
                    {loading ? "Completing..." : "Complete Profile"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}