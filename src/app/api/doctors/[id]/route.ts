import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const doctorId = params.id

    const doctor = await db.doctor.findFirst({
      where: {
        userId: doctorId,
        user: {
          accountStatus: "active",
          verificationStatus: "VERIFIED"
        }
      },
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
      }
    })

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 })
    }

    const transformedDoctor = {
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