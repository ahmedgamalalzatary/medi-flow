import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const specialty = searchParams.get("specialty") || ""
    const location = searchParams.get("location") || ""
    const minRating = parseFloat(searchParams.get("minRating") || "0")
    const maxFee = parseFloat(searchParams.get("maxFee") || "1000")
    const availability = searchParams.get("availability") === "true"

    // Build where clause
    const where: any = {
      user: {
        accountStatus: "active",
        verificationStatus: "VERIFIED"
      }
    }

    if (specialty) {
      where.specialty = specialty
    }

    if (location) {
      where.location = {
        contains: location,
        mode: "insensitive"
      }
    }

    if (minRating > 0) {
      where.rating = {
        gte: minRating
      }
    }

    if (maxFee < 1000) {
      where.consultationFee = {
        lte: maxFee
      }
    }

    if (availability) {
      where.isAvailable = true
    }

    // If search term is provided, search in multiple fields
    if (search) {
      where.OR = [
        {
          user: {
            name: {
              contains: search,
              mode: "insensitive"
            }
          }
        },
        {
          specialty: {
            contains: search,
            mode: "insensitive"
          }
        },
        {
          bio: {
            contains: search,
            mode: "insensitive"
          }
        }
      ]
    }

    const doctors = await db.doctor.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true
          }
        }
      },
      orderBy: [
        { rating: "desc" },
        { totalConsultations: "desc" }
      ]
    })

    // Transform the data to include user fields
    const transformedDoctors = doctors.map(doctor => ({
      id: doctor.user.id,
      name: doctor.user.name,
      email: doctor.user.email,
      phone: doctor.user.phone,
      avatar: doctor.user.avatar,
      specialty: doctor.specialty,
      qualifications: doctor.qualifications ? JSON.parse(doctor.qualifications) : [],
      experience: doctor.experience,
      bio: doctor.bio,
      consultationFee: doctor.consultationFee,
      location: doctor.location,
      languages: doctor.languages ? JSON.parse(doctor.languages) : [],
      rating: doctor.rating,
      totalConsultations: doctor.totalConsultations,
      isAvailable: doctor.isAvailable
    }))

    return NextResponse.json({ doctors: transformedDoctors })
  } catch (error) {
    console.error("Error fetching doctors:", error)
    return NextResponse.json(
      { error: "Failed to fetch doctors" },
      { status: 500 }
    )
  }
}