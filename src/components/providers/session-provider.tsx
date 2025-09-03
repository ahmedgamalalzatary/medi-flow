"use client"

import { SupabaseProvider } from './supabase-provider'

interface SessionProviderProps {
  children: React.ReactNode
}

export function SessionProviderWrapper({ children }: SessionProviderProps) {
  return <SupabaseProvider>{children}</SupabaseProvider>
}