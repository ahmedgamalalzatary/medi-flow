"use client"

import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Heart, User, Settings, LogOut, Stethoscope, Calendar, MessageSquare, FileText } from "lucide-react"

interface NavbarProps {
  currentRole?: "patient" | "doctor"
  onRoleSwitch?: (role: "patient" | "doctor") => void
}

export function Navbar({ currentRole, onRoleSwitch }: NavbarProps) {
  const { user, profile, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    window.location.href = "/"
  }

  return (
    <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Mediflow</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-6">
          {currentRole === "patient" && (
            <>
              <Link href="/dashboard/appointments" className="flex items-center space-x-1 text-gray-600 hover:text-gray-900">
                <Calendar className="h-4 w-4" />
                <span>Appointments</span>
              </Link>
              <Link href="/dashboard/medical-records" className="flex items-center space-x-1 text-gray-600 hover:text-gray-900">
                <FileText className="h-4 w-4" />
                <span>Medical Records</span>
              </Link>
              <Link href="/dashboard/messages" className="flex items-center space-x-1 text-gray-600 hover:text-gray-900">
                <MessageSquare className="h-4 w-4" />
                <span>Messages</span>
              </Link>
              <Link href="/dashboard/doctors" className="flex items-center space-x-1 text-gray-600 hover:text-gray-900">
                <Stethoscope className="h-4 w-4" />
                <span>Find Doctors</span>
              </Link>
            </>
          )}
          {currentRole === "doctor" && (
            <>
              <Link href="/dashboard/appointments" className="flex items-center space-x-1 text-gray-600 hover:text-gray-900">
                <Calendar className="h-4 w-4" />
                <span>Appointments</span>
              </Link>
              <Link href="/dashboard/patients" className="flex items-center space-x-1 text-gray-600 hover:text-gray-900">
                <User className="h-4 w-4" />
                <span>Patients</span>
              </Link>
              <Link href="/dashboard/messages" className="flex items-center space-x-1 text-gray-600 hover:text-gray-900">
                <MessageSquare className="h-4 w-4" />
                <span>Messages</span>
              </Link>
              <Link href="/dashboard/schedule" className="flex items-center space-x-1 text-gray-600 hover:text-gray-900">
                <Calendar className="h-4 w-4" />
                <span>Schedule</span>
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {user && profile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile.avatar || undefined} alt={profile.name} />
                    <AvatarFallback>
                      {profile.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{profile.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {profile.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {profile.role}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Role switching for users with both roles - TODO: implement multi-role support */}
                
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  )
}