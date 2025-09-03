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

    const supabase = createAdminClient()

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for patients
      user_metadata: {
        name,
        role: role as UserRole,
        phone
      }
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      )
    }

    // If patient, create patient profile
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
        // Don't fail the registration, profile creation is handled by trigger
      }
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
      { error: "An error occurred during registration" },
      { status: 500 }
    )
  }
}