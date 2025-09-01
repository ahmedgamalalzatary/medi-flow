import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { writeFile } from "fs/promises"
import path from "path"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const records = await db.medicalRecord.findMany({
      where: {
        patientId: session.user.id
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json({ records })
  } catch (error) {
    console.error("Error fetching medical records:", error)
    return NextResponse.json(
      { error: "Failed to fetch medical records" },
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

    const formData = await request.formData()
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const folder = formData.get("folder") as string

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    // Handle file uploads
    const documents: string[] = []
    const uploadDir = path.join(process.cwd(), "public", "uploads", "medical-records")
    
    try {
      await import("fs").then(fs => {
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true })
        }
      })
    } catch (error) {
      console.error("Error creating upload directory:", error)
    }

    // Process uploaded files
    let fileIndex = 0
    while (formData.get(`document${fileIndex}`)) {
      const file = formData.get(`document${fileIndex}`) as File
      if (file instanceof File) {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        const filename = `${Date.now()}-${file.name}`
        const filepath = path.join(uploadDir, filename)
        
        await writeFile(filepath, buffer)
        documents.push(`/uploads/medical-records/${filename}`)
      }
      fileIndex++
    }

    // Create medical record
    const record = await db.medicalRecord.create({
      data: {
        patientId: session.user.id,
        title,
        description: description || null,
        folder: folder || null,
        documents: documents.length > 0 ? JSON.stringify(documents) : null
      }
    })

    return NextResponse.json(
      { 
        message: "Medical record created successfully",
        record: {
          ...record,
          documents: documents.length > 0 ? documents : undefined
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating medical record:", error)
    return NextResponse.json(
      { error: "Failed to create medical record" },
      { status: 500 }
    )
  }
}