import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, role } = body

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as UserRole,
        isVerified: role === UserRole.PATIENT, // Patients are instantly verified
        verificationStatus: role === UserRole.PATIENT ? "VERIFIED" : "PENDING"
      }
    })

    // If patient, create patient profile
    if (role === UserRole.PATIENT") {
      await db.patient.create({
        data: {
          userId: user.id
        }
      })
    }

    return NextResponse.json(
      { 
        message: "Test user created successfully",
        userId: user.id,
        email: user.email,
        password: password // Only for testing purposes
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Test user creation error:", error)
    return NextResponse.json(
      { error: "An error occurred during test user creation" },
      { status: 500 }
    )
  }
}