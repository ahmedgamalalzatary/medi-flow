import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const specialty = searchParams.get("specialty") || ""
    const location = searchParams.get("location") || ""
    const minRating = parseFloat(searchParams.get("minRating") || "0")
    const maxFee = parseFloat(searchParams.get("maxFee") || "1000")
    const availability = searchParams.get("availability") === "true"

    const supabase = createClient()

    // Build query
    let query = supabase
      .from('doctors')
      .select(`
        *,
        profiles:user_id (
          id,
          name,
          email,
          phone,
          avatar,
          account_status,
          verification_status
        )
      `)
      .eq('profiles.account_status', 'active')
      .eq('profiles.verification_status', 'VERIFIED')

    // Apply filters
    if (specialty) {
      query = query.eq('specialty', specialty)
    }

    if (location) {
      query = query.ilike('location', `%${location}%`)
    }

    if (minRating > 0) {
      query = query.gte('rating', minRating)
    }

    if (maxFee < 1000) {
      query = query.lte('consultation_fee', maxFee)
    }

    if (availability) {
      query = query.eq('is_available', true)
    }

    // Apply search across multiple fields
    if (search) {
      query = query.or(`
        profiles.name.ilike.%${search}%,
        specialty.ilike.%${search}%,
        bio.ilike.%${search}%
      `)
    }

    // Order by rating and consultations
    query = query.order('rating', { ascending: false })
    query = query.order('total_consultations', { ascending: false })

    const { data: doctors, error } = await query

    if (error) {
      throw error
    }

    // Transform the data to include user fields
    const transformedDoctors = doctors?.map(doctor => ({
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
    })) || []

    return NextResponse.json({ doctors: transformedDoctors })
  } catch (error) {
    console.error("Error fetching doctors:", error)
    return NextResponse.json(
      { error: "Failed to fetch doctors" },
      { status: 500 }
    )
  }
}