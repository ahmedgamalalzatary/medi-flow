import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
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

    // Check if patient profile exists and is complete
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (patientError && patientError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error("Error checking patient profile:", patientError)
      return NextResponse.json({ error: "Failed to check profile" }, { status: 500 })
    }

    // Consider profile complete if patient record exists and has essential fields
    const isComplete = patient && 
                      patient.date_of_birth && 
                      patient.gender && 
                      patient.emergency_contact && 
                      patient.emergency_phone

    return NextResponse.json({ 
      isComplete: !!isComplete,
      patient: patient || null 
    })
  } catch (error) {
    console.error("Error checking patient profile:", error)
    return NextResponse.json(
      { error: "Failed to check profile" },
      { status: 500 }
    )
  }
}