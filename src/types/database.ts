// =============================================
// SUPABASE DATABASE TYPES
// =============================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// =============================================
// ENUMS
// =============================================

export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN'
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED'
export type AppointmentStatus = 'REQUESTED' | 'ACCEPTED' | 'DECLINED' | 'RESCHEDULED' | 'COMPLETED' | 'CANCELLED'
export type AppointmentType = 'REGULAR' | 'EMERGENCY'
export type ConsultationDuration = 'MINUTES_10' | 'MINUTES_30' | 'HOURS_1' | 'HOURS_2'
export type MessageStatus = 'SENT' | 'READ'
export type WarningType = 'LATE_CANCELLATION' | 'NO_SHOW' | 'MISCONDUCT'

// =============================================
// DATABASE INTERFACE
// =============================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          phone: string | null
          avatar: string | null
          role: UserRole
          is_verified: boolean
          verification_status: VerificationStatus
          verification_docs: Json | null
          account_status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          phone?: string | null
          avatar?: string | null
          role?: UserRole
          is_verified?: boolean
          verification_status?: VerificationStatus
          verification_docs?: Json | null
          account_status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          phone?: string | null
          avatar?: string | null
          role?: UserRole
          is_verified?: boolean
          verification_status?: VerificationStatus
          verification_docs?: Json | null
          account_status?: string
          created_at?: string
          updated_at?: string
        }
      }
      patients: {
        Row: {
          id: string
          user_id: string
          date_of_birth: string | null
          gender: string | null
          blood_type: string | null
          allergies: string | null
          medications: string | null
          emergency_contact: string | null
          emergency_phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date_of_birth?: string | null
          gender?: string | null
          blood_type?: string | null
          allergies?: string | null
          medications?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date_of_birth?: string | null
          gender?: string | null
          blood_type?: string | null
          allergies?: string | null
          medications?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      doctors: {
        Row: {
          id: string
          user_id: string
          specialty: string
          qualifications: Json | null
          experience: number
          license_number: string
          license_expiry: string
          bio: string | null
          consultation_fee: number
          location: string | null
          languages: Json | null
          rating: number
          total_consultations: number
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          specialty: string
          qualifications?: Json | null
          experience: number
          license_number: string
          license_expiry: string
          bio?: string | null
          consultation_fee: number
          location?: string | null
          languages?: Json | null
          rating?: number
          total_consultations?: number
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          specialty?: string
          qualifications?: Json | null
          experience?: number
          license_number?: string
          license_expiry?: string
          bio?: string | null
          consultation_fee?: number
          location?: string | null
          languages?: Json | null
          rating?: number
          total_consultations?: number
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      availabilities: {
        Row: {
          id: string
          doctor_id: string
          day_of_week: number
          start_time: string
          end_time: string
          is_blocked: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          doctor_id: string
          day_of_week: number
          start_time: string
          end_time: string
          is_blocked?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          doctor_id?: string
          day_of_week?: number
          start_time?: string
          end_time?: string
          is_blocked?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      medical_records: {
        Row: {
          id: string
          patient_id: string
          title: string
          description: string | null
          folder: string | null
          documents: Json | null
          ocr_data: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          title: string
          description?: string | null
          folder?: string | null
          documents?: Json | null
          ocr_data?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          title?: string
          description?: string | null
          folder?: string | null
          documents?: Json | null
          ocr_data?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          patient_id: string
          doctor_id: string
          status: AppointmentStatus
          type: AppointmentType
          duration: ConsultationDuration
          scheduled_at: string
          illness: string | null
          specific_needs: string | null
          questions: string | null
          price: number
          payment_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          doctor_id: string
          status?: AppointmentStatus
          type?: AppointmentType
          duration: ConsultationDuration
          scheduled_at: string
          illness?: string | null
          specific_needs?: string | null
          questions?: string | null
          price: number
          payment_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          doctor_id?: string
          status?: AppointmentStatus
          type?: AppointmentType
          duration?: ConsultationDuration
          scheduled_at?: string
          illness?: string | null
          specific_needs?: string | null
          questions?: string | null
          price?: number
          payment_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          content: string
          status: MessageStatus
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          content: string
          status?: MessageStatus
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          status?: MessageStatus
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          patient_id: string
          doctor_id: string
          appointment_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          doctor_id: string
          appointment_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          doctor_id?: string
          appointment_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          appointment_id: string
          amount: number
          status: string
          stripe_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          appointment_id: string
          amount: number
          status?: string
          stripe_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          appointment_id?: string
          amount?: number
          status?: string
          stripe_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      warnings: {
        Row: {
          id: string
          user_id: string
          type: WarningType
          reason: string
          is_active: boolean
          created_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: WarningType
          reason: string
          is_active?: boolean
          created_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: WarningType
          reason?: string
          is_active?: boolean
          created_at?: string
          expires_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: UserRole
      verification_status: VerificationStatus
      appointment_status: AppointmentStatus
      appointment_type: AppointmentType
      consultation_duration: ConsultationDuration
      message_status: MessageStatus
      warning_type: WarningType
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// =============================================
// HELPER TYPES
// =============================================

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Patient = Database['public']['Tables']['patients']['Row']
export type Doctor = Database['public']['Tables']['doctors']['Row']
export type Appointment = Database['public']['Tables']['appointments']['Row']
export type MedicalRecord = Database['public']['Tables']['medical_records']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']
export type Warning = Database['public']['Tables']['warnings']['Row']
export type Availability = Database['public']['Tables']['availabilities']['Row']

// Extended types with relations
export type DoctorWithProfile = Doctor & {
  profiles: Profile
}

export type PatientWithProfile = Patient & {
  profiles: Profile
}

export type AppointmentWithDetails = Appointment & {
  patient: Profile
  doctor: Profile & { doctors: Doctor }
  payment?: Payment
}