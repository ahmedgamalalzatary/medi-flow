import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { writeFile } from "fs/promises"
import path from "path"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const phone = formData.get("phone") as string
    const specialty = formData.get("specialty") as string
    const qualifications = formData.get("qualifications") as string
    const experience = formData.get("experience") as string
    const licenseNumber = formData.get("licenseNumber") as string
    const licenseExpiry = formData.get("licenseExpiry") as string
    const bio = formData.get("bio") as string
    const consultationFee = formData.get("consultationFee") as string
    const location = formData.get("location") as string
    const languages = formData.get("languages") as string
    const role = formData.get("role") as string

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

    // Handle file uploads
    const verificationDocs: string[] = []
    const uploadDir = path.join(process.cwd(), "public", "uploads", "verification")
    
    try {
      // Create upload directory if it doesn't exist
      await import("fs").then(fs => {
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true })
        }
      })
    } catch (error) {
      console.error("Error creating upload directory:", error)
    }

    // Process uploaded files
    const files = formData.getAll("verificationDocs") as File[]
    for (const file of files) {
      if (file instanceof File) {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        const filename = `${Date.now()}-${file.name}`
        const filepath = path.join(uploadDir, filename)
        
        await writeFile(filepath, buffer)
        verificationDocs.push(`/uploads/verification/${filename}`)
      }
    }

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: role as UserRole,
        isVerified: false, // Doctors need verification
        verificationStatus: "PENDING",
        verificationDocs: JSON.stringify(verificationDocs)
      }
    })

    // Create doctor profile
    await db.doctor.create({
      data: {
        userId: user.id,
        specialty,
        qualifications: qualifications ? JSON.stringify(qualifications.split(",").map(q => q.trim())) : null,
        experience: parseInt(experience) || 0,
        licenseNumber,
        licenseExpiry: new Date(licenseExpiry),
        bio,
        consultationFee: parseFloat(consultationFee) || 0,
        location,
        languages: languages ? JSON.stringify(languages.split(",").map(l => l.trim())) : null
      }
    })

    return NextResponse.json(
      { 
        message: "Doctor registration submitted successfully. Awaiting verification.",
        userId: user.id 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Doctor registration error:", error)
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    )
  }
}