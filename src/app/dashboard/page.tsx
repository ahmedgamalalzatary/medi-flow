"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Heart, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Stethoscope, 
  User,
  Clock,
  TrendingUp,
  AlertCircle
} from "lucide-react"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentRole, setCurrentRole] = useState<"patient" | "doctor">("patient")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated") {
      setLoading(false)
      
      // Set default role based on user's primary role
      if (session?.user?.role === "DOCTOR") {
        setCurrentRole("doctor")
      } else {
        setCurrentRole("patient")
      }
    }
  }, [status, session, router])

  const handleRoleSwitch = (role: "patient" | "doctor") => {
    setCurrentRole(role)
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

  if (!session) {
    return null
  }

  // Show verification warning for doctors
  if (session.user.role === "DOCTOR" && session.user.verificationStatus !== "VERIFIED") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar currentRole={currentRole} onRoleSwitch={handleRoleSwitch} />
        <div className="container mx-auto px-4 py-8">
          <Alert className="max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Account Under Review</h3>
                <p className="mb-4">
                  Your doctor account is currently under verification. You will receive an email once your account has been approved. 
                  This process typically takes 12-48 hours.
                </p>
                <p className="text-sm text-gray-600">
                  Verification Status: {session.user.verificationStatus}
                </p>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentRole={currentRole} onRoleSwitch={handleRoleSwitch} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {session.user.name}!
          </h1>
          <p className="text-gray-600">
            {currentRole === "patient" 
              ? "Manage your healthcare journey" 
              : "Manage your medical practice"}
          </p>
        </div>

        {currentRole === "patient" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">Next: Tomorrow, 2:00 PM</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Medical Records</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">Last updated: 3 days ago</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Messages</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">2 unread</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Doctors</CardTitle>
                <Stethoscope className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">5 max</p>
              </CardContent>
            </Card>
          </div>
        )}

        {currentRole === "doctor" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">Next: 10:00 AM</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">47</div>
                <p className="text-xs text-muted-foreground">+3 this week</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.8</div>
                <p className="text-xs text-muted-foreground">Based on 23 reviews</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Consultations</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {currentRole === "patient" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks you might want to do</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="mr-2 h-4 w-4" />
                    Book New Appointment
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Upload Medical Record
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Stethoscope className="mr-2 h-4 w-4" />
                    Find a Doctor
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message Your Doctor
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest healthcare activities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Appointment scheduled</p>
                      <p className="text-xs text-gray-600">With Dr. Smith - Tomorrow at 2:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <FileText className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Medical record added</p>
                      <p className="text-xs text-gray-600">Blood test results - 3 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <MessageSquare className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">New message</p>
                      <p className="text-xs text-gray-600">From Dr. Johnson - 1 day ago</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {currentRole === "doctor" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Today's Schedule</CardTitle>
                  <CardDescription>Your appointments for today</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium">John Doe</p>
                      <p className="text-sm text-gray-600">General Consultation</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">10:00 AM</p>
                      <p className="text-sm text-gray-600">30 min</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Jane Smith</p>
                      <p className="text-sm text-gray-600">Follow-up</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">11:00 AM</p>
                      <p className="text-sm text-gray-600">15 min</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium">Emergency - Mike Johnson</p>
                      <p className="text-sm text-gray-600">Urgent Care</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-red-600">2:00 PM</p>
                      <p className="text-sm text-gray-600">45 min</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks you might want to do</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="mr-2 h-4 w-4" />
                    Manage Schedule
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <User className="mr-2 h-4 w-4" />
                    View Patients
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Check Messages
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Review Records
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}