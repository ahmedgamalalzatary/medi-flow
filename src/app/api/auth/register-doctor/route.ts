import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { Database } from "@/types/database"

type UserRole = Database['public']['Enums']['user_role']

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

    const supabase = createAdminClient()

    // Handle file uploads to Supabase Storage
    const verificationDocs: string[] = []
    const files = formData.getAll("verificationDocs") as File[]
    
    for (const file of files) {
      if (file instanceof File) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `verification/${fileName}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('medical-records')
          .upload(filePath, file)

        if (uploadError) {
          console.error("File upload error:", uploadError)
        } else {
          verificationDocs.push(uploadData.path)
        }
      }
    }

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // Doctors need email verification
      user_metadata: {
        name,
        role: 'DOCTOR' as UserRole,
        phone,
        verification_docs: verificationDocs
      }
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      )
    }

    // Create doctor profile
    const { error: doctorError } = await supabase
      .from('doctors')
      .insert({
        user_id: authData.user.id,
        specialty,
        qualifications: qualifications ? JSON.stringify(qualifications.split(",").map(q => q.trim())) : null,
        experience: parseInt(experience) || 0,
        license_number: licenseNumber,
        license_expiry: new Date(licenseExpiry).toISOString().split('T')[0],
        bio,
        consultation_fee: parseFloat(consultationFee) || 0,
        location,
        languages: languages ? JSON.stringify(languages.split(",").map(l => l.trim())) : null
      })

    if (doctorError) {
      console.error("Error creating doctor profile:", doctorError)
      return NextResponse.json(
        { error: "Failed to create doctor profile" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: "Doctor registration submitted successfully. Awaiting verification.",
        userId: authData.user.id 
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