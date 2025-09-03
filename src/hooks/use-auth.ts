"use client"

import { useAuth as useSupabaseAuth } from '@/components/providers/supabase-provider'

// Re-export the auth hook for convenience
export const useAuth = useSupabaseAuth

// Additional auth utilities
export function useUser() {
  const { user, profile, loading } = useAuth()
  return { user, profile, loading }
}

export function useSession() {
  const { session, loading } = useAuth()
  return { session, loading }
}

export function useProfile() {
  const { profile, loading, updateProfile } = useAuth()
  return { profile, loading, updateProfile }
}