import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { Database } from "@/types/database"

type UserRole = Database['public']['Enums']['user_role']

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

    console.log("Manual registration attempt for:", { email, name, role })

    const supabase = createAdminClient()

    // Step 1: First, temporarily disable the trigger to prevent conflicts
    try {
      await supabase.rpc('exec', {
        sql: 'ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;'
      })
      console.log("Trigger disabled successfully")
    } catch (e) {
      console.log("Could not disable trigger:", e)
    }

    // Step 2: Create user with admin client
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      console.error("Auth error details:", authError)
      return NextResponse.json(
        { error: "Failed to create user account", details: authError.message },
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

    // Step 3: Manually create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: authData.user.email!,
        name,
        phone,
        role: role as UserRole
      })

    if (profileError) {
      console.error("Error creating profile:", profileError)
      return NextResponse.json(
        { error: "Failed to create user profile", details: profileError.message },
        { status: 500 }
      )
    }

    console.log("Profile created successfully")

    // Step 4: If patient, create patient profile
    if (role === 'PATIENT') {
      const { error: patientError } = await supabase
        .from('patients')
        .insert({
          user_id: authData.user.id,
          date_of_birth: dateOfBirth ? new Date(dateOfBirth).toISOString().split('T')[0] : null,
          gender,
          blood_type: bloodType,
          allergies,
          medications,
          emergency_contact: emergencyContact,
          emergency_phone: emergencyPhone
        })

      if (patientError) {
        console.error("Error creating patient profile:", patientError)
        return NextResponse.json(
          { error: "Failed to create patient profile", details: patientError.message },
          { status: 500 }
        )
      }

      console.log("Patient profile created successfully")
    }

    // Step 5: Re-enable the trigger
    try {
      await supabase.rpc('exec', {
        sql: 'ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;'
      })
      console.log("Trigger re-enabled successfully")
    } catch (e) {
      console.log("Could not re-enable trigger:", e)
    }

    return NextResponse.json(
      { 
        message: "User created successfully",
        userId: authData.user.id 
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