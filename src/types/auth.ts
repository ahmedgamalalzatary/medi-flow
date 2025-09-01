import { UserRole, VerificationStatus } from "@prisma/client"
import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
      avatar?: string
      isVerified: boolean
      verificationStatus: VerificationStatus
      accountStatus: string
      patientProfile?: any
      doctorProfile?: any
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: UserRole
    avatar?: string
    isVerified: boolean
    verificationStatus: VerificationStatus
    accountStatus: string
    patientProfile?: any
    doctorProfile?: any
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole
    id: string
    avatar?: string
    isVerified: boolean
    verificationStatus: VerificationStatus
    accountStatus: string
    patientProfile?: any
    doctorProfile?: any
  }
}