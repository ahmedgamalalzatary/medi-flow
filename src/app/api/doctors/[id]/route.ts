import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const doctorId = params.id

    const supabase = createClient()

    const { data: doctor, error } = await supabase
      .from('doctors')
      .select(`
        *,
        profiles:user_id (
          id,
          name,
          email,
          phone,
          avatar,
          verification_status,
          account_status
        )
      `)
      .eq('user_id', doctorId)
      .eq('profiles.account_status', 'active')
      .eq('profiles.verification_status', 'VERIFIED')
      .single()

    if (error || !doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 })
    }

    const transformedDoctor = {
      id: doctor.profiles?.id,
      name: doctor.profiles?.name,
      email: doctor.profiles?.email,
      phone: doctor.profiles?.phone,
      avatar: doctor.profiles?.avatar,
      specialty: doctor.specialty,
      qualifications: doctor.qualifications ? JSON.parse(doctor.qualifications) : [],
      experience: doctor.experience,
      bio: doctor.bio,
      consultationFee: doctor.consultation_fee,
      location: doctor.location,
      languages: doctor.languages ? JSON.parse(doctor.languages) : [],
      rating: doctor.rating,
      totalConsultations: doctor.total_consultations,
      isAvailable: doctor.is_available
    }

    return NextResponse.json({ doctor: transformedDoctor })
  } catch (error) {
    console.error("Error fetching doctor:", error)
    return NextResponse.json(
      { error: "Failed to fetch doctor" },
      { status: 500 }
    )
  }
}