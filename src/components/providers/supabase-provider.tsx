"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { User, Session } from '@supabase/supabase-js'
import { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, userData: any) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (session) {
        setSession(session)
        setUser(session.user)
        await fetchProfile(session.user.id)
      }
      
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return
      }

      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch (error: any) {
      return { error: error.message }
    }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      // Handle file uploads for doctors first
      let verificationDocs: string[] = []
      if (userData.role === 'DOCTOR' && userData.verificationDocs) {
        for (const file of userData.verificationDocs) {
          const fileExt = file.name.split('.').pop()
          const fileName = `verification/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('medical-records')
            .upload(fileName, file)

          if (uploadError) {
            console.error('File upload error:', uploadError)
          } else {
            verificationDocs.push(uploadData.path)
          }
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            role: userData.role,
            phone: userData.phone,
            verification_docs: verificationDocs.length > 0 ? verificationDocs : undefined
          }
        }
      })

      if (error) {
        return { error: error.message }
      }

      // If user is created, create additional profile data
      if (data.user && userData.role === 'PATIENT') {
        // Create patient profile
        const { error: patientError } = await supabase
          .from('patients')
          .insert({
            user_id: data.user.id,
            date_of_birth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : null,
            gender: userData.gender,
            blood_type: userData.bloodType,
            allergies: userData.allergies,
            medications: userData.medications,
            emergency_contact: userData.emergencyContact,
            emergency_phone: userData.emergencyPhone,
          })

        if (patientError) {
          console.error('Error creating patient profile:', patientError)
        }
      }

      // If user is created, create doctor profile
      if (data.user && userData.role === 'DOCTOR') {
        const { error: doctorError } = await supabase
          .from('doctors')
          .insert({
            user_id: data.user.id,
            specialty: userData.specialty,
            qualifications: userData.qualifications ? JSON.stringify(userData.qualifications.split(",").map((q: string) => q.trim())) : null,
            experience: parseInt(userData.experience) || 0,
            license_number: userData.licenseNumber,
            license_expiry: new Date(userData.licenseExpiry).toISOString().split('T')[0],
            bio: userData.bio,
            consultation_fee: parseFloat(userData.consultationFee) || 0,
            location: userData.location,
            languages: userData.languages ? JSON.stringify(userData.languages.split(",").map((l: string) => l.trim())) : null
          })

        if (doctorError) {
          console.error('Error creating doctor profile:', doctorError)
        }
      }

      return {}
    } catch (error: any) {
      return { error: error.message }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'No user logged in' }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) {
        return { error: error.message }
      }

      // Refresh profile
      await fetchProfile(user.id)
      return {}
    } catch (error: any) {
      return { error: error.message }
    }
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within a SupabaseProvider')
  }
  return context
}