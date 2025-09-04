import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    
    // Get session from authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Unauthorized - No token provided" }, { status: 401 })
    }
    
    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      dateOfBirth,
      gender,
      bloodType,
      allergies,
      medications,
      emergencyContact,
      emergencyPhone
    } = body

    // Validate required fields
    if (!dateOfBirth || !gender || !emergencyContact || !emergencyPhone) {
      return NextResponse.json({ 
        error: "Date of birth, gender, emergency contact name and phone are required" 
      }, { status: 400 })
    }

    // Check if patient record already exists
    const { data: existingPatient } = await supabase
      .from('patients')
      .select('user_id')
      .eq('user_id', user.id)
      .single()

    if (existingPatient) {
      // Update existing patient record
      const { error: updateError } = await supabase
        .from('patients')
        .update({
          date_of_birth: dateOfBirth,
          gender,
          blood_type: bloodType || null,
          allergies: allergies || null,
          medications: medications || null,
          emergency_contact: emergencyContact,
          emergency_phone: emergencyPhone,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (updateError) {
        console.error("Error updating patient profile:", updateError)
        return NextResponse.json({ 
          error: "Failed to update patient profile" 
        }, { status: 500 })
      }
    } else {
      // Create new patient record
      const { error: insertError } = await supabase
        .from('patients')
        .insert({
          user_id: user.id,
          date_of_birth: dateOfBirth,
          gender,
          blood_type: bloodType || null,
          allergies: allergies || null,
          medications: medications || null,
          emergency_contact: emergencyContact,
          emergency_phone: emergencyPhone
        })

      if (insertError) {
        console.error("Error creating patient profile:", insertError)
        return NextResponse.json({ 
          error: "Failed to create patient profile" 
        }, { status: 500 })
      }
    }

    return NextResponse.json({ 
      message: "Patient profile completed successfully" 
    }, { status: 200 })
  } catch (error) {
    console.error("Error completing patient profile:", error)
    return NextResponse.json(
      { error: "Failed to complete profile" },
      { status: 500 }
    )
  }
}