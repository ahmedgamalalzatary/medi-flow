import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: records, error } = await supabase
      .from('medical_records')
      .select('*')
      .eq('patient_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ records: records || [] })
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
    const supabase = createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const folder = formData.get("folder") as string

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    // Handle file uploads to Supabase Storage
    const documents: string[] = []
    
    // Process uploaded files
    let fileIndex = 0
    while (formData.get(`document${fileIndex}`)) {
      const file = formData.get(`document${fileIndex}`) as File
      if (file instanceof File) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('medical-records')
          .upload(fileName, file)

        if (uploadError) {
          console.error("File upload error:", uploadError)
        } else {
          documents.push(uploadData.path)
        }
      }
      fileIndex++
    }

    // Create medical record
    const { data: record, error: createError } = await supabase
      .from('medical_records')
      .insert({
        patient_id: user.id,
        title,
        description: description || null,
        folder: folder || null,
        documents: documents.length > 0 ? JSON.stringify(documents) : null
      })
      .select()
      .single()

    if (createError) {
      throw createError
    }

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