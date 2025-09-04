import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      password,
      phone,
      dateOfBirth,
      gender,
      bloodType,
      allergies,
      medications,
      emergencyContact,
      emergencyPhone,
      role
    } = body

    console.log("Simple registration attempt for:", { email, name, role })

    // Use admin client for server-side registration
    const supabase = createAdminClient()
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm for testing
    })

    if (authError) {
      console.error("Auth error details:", authError)
      return NextResponse.json(
        { error: "Failed to create account", details: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      )
    }

    console.log("User created successfully:", authData.user.id)

    return NextResponse.json(
      { 
        message: "Account created successfully! Please check your email to verify your account.",
        userId: authData.user.id,
        needsEmailVerification: !authData.user.email_confirmed_at
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Registration failed", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}