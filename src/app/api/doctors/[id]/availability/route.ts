import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const doctorId = params.id

    const availability = await db.availability.findMany({
      where: {
        doctorId
      },
      orderBy: {
        dayOfWeek: "asc"
      }
    })

    return NextResponse.json({ availability })
  } catch (error) {
    console.error("Error fetching doctor availability:", error)
    return NextResponse.json(
      { error: "Failed to fetch doctor availability" },
      { status: 500 }
    )
  }
}