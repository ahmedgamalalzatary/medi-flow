import { Database } from './database'

// Supabase Auth Types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Patient = Database['public']['Tables']['patients']['Row']
export type Doctor = Database['public']['Tables']['doctors']['Row']

export type UserRole = Database['public']['Enums']['user_role']
export type VerificationStatus = Database['public']['Enums']['verification_status']

// Extended user type with profile data
export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  isVerified: boolean
  verificationStatus: VerificationStatus
  accountStatus: string
  patientProfile?: Patient
  doctorProfile?: Doctor
}

// Auth context types
export interface AuthSession {
  user: AuthUser
  accessToken?: string
  refreshToken?: string
}

// Sign up data types
export interface PatientSignUpData {
  name: string
  email: string
  password: string
  phone?: string
  role: 'PATIENT'
  dateOfBirth?: string
  gender?: string
  bloodType?: string
  allergies?: string
  medications?: string
  emergencyContact?: string
  emergencyPhone?: string
}

export interface DoctorSignUpData {
  name: string
  email: string
  password: string
  phone?: string
  role: 'DOCTOR'
  specialty: string
  qualifications?: string[]
  experience: number
  licenseNumber: string
  licenseExpiry: string
  bio?: string
  consultationFee: number
  location?: string
  languages?: string[]
}