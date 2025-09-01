import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    const where: any = {}
    
    // Filter by user role
    if (session.user.role === "PATIENT") {
      where.patientId = session.user.id
    } else if (session.user.role === "DOCTOR") {
      where.doctorId = session.user.id
    }

    // Filter by status if provided
    if (status && status !== "all") {
      where.status = status
    }

    const appointments = await db.appointment.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true
          }
        },
        doctor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            specialty: true
          }
        },
        payment: {
          select: {
            id: true,
            amount: true,
            status: true
          }
        }
      },
      orderBy: {
        scheduledAt: "asc"
      }
    })

    return NextResponse.json({ appointments })
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
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "PATIENT") {
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
    const existingAppointments = await db.appointment.findMany({
      where: {
        patientId: session.user.id,
        status: {
          in: ["REQUESTED", "ACCEPTED", "RESCHEDULED"]
        }
      },
      select: {
        doctorId: true
      }
    })

    const uniqueDoctors = new Set(existingAppointments.map(appt => appt.doctorId))
    if (uniqueDoctors.size >= 5 && !uniqueDoctors.has(doctorId)) {
      return NextResponse.json(
        { error: "You can only have appointments with a maximum of 5 different doctors simultaneously" },
        { status: 400 }
      )
    }

    // Check if the time slot is available (simplified check)
    const existingAppointment = await db.appointment.findFirst({
      where: {
        doctorId,
        scheduledAt: new Date(scheduledAt),
        status: {
          in: ["REQUESTED", "ACCEPTED", "RESCHEDULED"]
        }
      }
    })

    if (existingAppointment) {
      return NextResponse.json({ error: "This time slot is already booked" }, { status: 400 })
    }

    // Create appointment
    const appointment = await db.appointment.create({
      data: {
        patientId: session.user.id,
        doctorId,
        scheduledAt: new Date(scheduledAt),
        type,
        duration,
        illness,
        specificNeeds,
        questions,
        price
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        doctor: {
          select: {
            id: true,
            name: true,
            email: true,
            specialty: true
          }
        }
      }
    })

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