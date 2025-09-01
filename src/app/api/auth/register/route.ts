import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      password,
      phone,
      dateOfBirth,
      gender,
      bloodType,
      allergies,
      medications,
      emergencyContact,
      emergencyPhone,
      role
    } = body

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
        phone,
        role: role as UserRole,
        isVerified: role === UserRole.PATIENT, // Patients are instantly verified
        verificationStatus: role === UserRole.PATIENT ? "VERIFIED" : "PENDING"
      }
    })

    // If patient, create patient profile
    if (role === UserRole.PATIENT) {
      await db.patient.create({
        data: {
          userId: user.id,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          gender,
          bloodType,
          allergies,
          medications,
          emergencyContact,
          emergencyPhone
        }
      })
    }

    return NextResponse.json(
      { 
        message: "User created successfully",
        userId: user.id 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    )
  }
}