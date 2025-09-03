import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    // Build query based on user role
    let query = supabase
      .from('appointments')
      .select(`
        *,
        patient:patient_id (
          id,
          name,
          email,
          phone,
          avatar
        ),
        doctor:doctor_id (
          id,
          name,
          email,
          phone,
          avatar
        ),
        payments (
          id,
          amount,
          status
        )
      `)
    
    // Filter by user role
    if (profile.role === "PATIENT") {
      query = query.eq('patient_id', user.id)
    } else if (profile.role === "DOCTOR") {
      query = query.eq('doctor_id', user.id)
    }

    // Filter by status if provided
    if (status && status !== "all") {
      query = query.eq('status', status)
    }

    // Order by scheduled time
    query = query.order('scheduled_at', { ascending: true })

    const { data: appointments, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({ appointments: appointments || [] })
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    if (profile.role !== "PATIENT") {
      return NextResponse.json({ error: "Only patients can create appointments" }, { status: 403 })
    }

    const body = await request.json()
    const {
      doctorId,
      scheduledAt,
      type,
      duration,
      illness,
      specificNeeds,
      questions,
      price
    } = body

    // Validate required fields
    if (!doctorId || !scheduledAt || !type || !duration || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if patient has reached the maximum number of different doctors (5)
    const { data: existingAppointments, error: existingError } = await supabase
      .from('appointments')
      .select('doctor_id')
      .eq('patient_id', user.id)
      .in('status', ['REQUESTED', 'ACCEPTED', 'RESCHEDULED'])

    if (existingError) {
      throw existingError
    }

    const uniqueDoctors = new Set(existingAppointments?.map(appt => appt.doctor_id) || [])
    if (uniqueDoctors.size >= 5 && !uniqueDoctors.has(doctorId)) {
      return NextResponse.json(
        { error: "You can only have appointments with a maximum of 5 different doctors simultaneously" },
        { status: 400 }
      )
    }

    // Check if the time slot is available (simplified check)
    const { data: existingAppointment, error: slotError } = await supabase
      .from('appointments')
      .select('id')
      .eq('doctor_id', doctorId)
      .eq('scheduled_at', new Date(scheduledAt).toISOString())
      .in('status', ['REQUESTED', 'ACCEPTED', 'RESCHEDULED'])
      .single()

    if (slotError && slotError.code !== 'PGRST116') { // PGRST116 = no rows found
      throw slotError
    }

    if (existingAppointment) {
      return NextResponse.json({ error: "This time slot is already booked" }, { status: 400 })
    }

    // Create appointment
    const { data: appointment, error: createError } = await supabase
      .from('appointments')
      .insert({
        patient_id: user.id,
        doctor_id: doctorId,
        scheduled_at: new Date(scheduledAt).toISOString(),
        type,
        duration,
        illness,
        specific_needs: specificNeeds,
        questions,
        price
      })
      .select(`
        *,
        patient:patient_id (
          id,
          name,
          email
        ),
        doctor:doctor_id (
          id,
          name,
          email
        )
      `)
      .single()

    if (createError) {
      throw createError
    }

    return NextResponse.json(
      { 
        message: "Appointment created successfully",
        appointment 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating appointment:", error)
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    )
  }
}