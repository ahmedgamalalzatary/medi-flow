import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const doctorId = params.id

    const supabase = createClient()

    const { data: availability, error } = await supabase
      .from('availabilities')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('day_of_week', { ascending: true })

    if (error) {
      throw error
    }

    return NextResponse.json({ availability: availability || [] })
  } catch (error) {
    console.error("Error fetching doctor availability:", error)
    return NextResponse.json(
      { error: "Failed to fetch doctor availability" },
      { status: 500 }
    )
  }
}