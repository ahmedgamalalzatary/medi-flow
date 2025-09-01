import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Stethoscope, Calendar, MessageSquare, Shield, Users } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Mediflow</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-gray-600 hover:text-gray-900">Features</Link>
            <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900">How it Works</Link>
            <Link href="#doctors" className="text-gray-600 hover:text-gray-900">Find Doctors</Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/auth/signin">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Your Health, <span className="text-blue-600">Connected</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Connect with qualified doctors, manage your medical records, and receive quality healthcare consultations from the comfort of your home.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/signup">
            <Button size="lg" className="w-full sm:w-auto">
              Join as Patient
            </Button>
          </Link>
          <Link href="/auth/doctor-signup">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Join as Doctor
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Why Choose Mediflow?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Stethoscope className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Qualified Doctors</CardTitle>
                <CardDescription>
                  Connect with verified healthcare professionals across various specialties
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Easy Scheduling</CardTitle>
                <CardDescription>
                  Book appointments at your convenience with flexible scheduling options
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <MessageSquare className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Secure Communication</CardTitle>
                <CardDescription>
                  Private messaging with your healthcare provider for follow-up care
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <Heart className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Medical Records</CardTitle>
                <CardDescription>
                  Store and organize your medical history in one secure location
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Secure & Private</CardTitle>
                <CardDescription>
                  Your health information is protected with enterprise-grade security
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>24/7 Access</CardTitle>
                <CardDescription>
                  Access your healthcare information and connect with doctors anytime
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-blue-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            How Mediflow Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Sign Up</h3>
              <p className="text-gray-600">Create your account as a patient or doctor with simple verification</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect</h3>
              <p className="text-gray-600">Search for doctors, book appointments, and manage your health records</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Consult</h3>
              <p className="text-gray-600">Attend virtual consultations and receive quality healthcare</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of patients and doctors who trust Mediflow for their healthcare needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Get Started as Patient
              </Button>
            </Link>
            <Link href="/auth/doctor-signup">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-blue-600">
                Join as Healthcare Provider
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Heart className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold">Mediflow</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400">
                © 2024 Mediflow. All rights reserved.
              </p>
              <p className="text-gray-400 text-sm">
                Your health is our priority
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}