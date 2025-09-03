"use client"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Plus, 
  Upload, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  Calendar,
  Folder,
  Search,
  Filter
} from "lucide-react"

interface MedicalRecord {
  id: string
  title: string
  description?: string
  folder?: string
  documents?: string[]
  ocrData?: string
  createdAt: string
}

export default function MedicalRecords() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [currentRole, setCurrentRole] = useState<"patient" | "doctor">("patient")
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFolder, setSelectedFolder] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newRecord, setNewRecord] = useState({
    title: "",
    description: "",
    folder: "",
    documents: [] as File[]
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated") {
      setLoading(false)
      if (session?.user?.role === "DOCTOR") {
        setCurrentRole("doctor")
      }
      fetchMedicalRecords()
    }
  }, [status, session, router])

  const fetchMedicalRecords = async () => {
    try {
      const response = await fetch("/api/medical-records")
      if (response.ok) {
        const data = await response.json()
        setMedicalRecords(data.records || [])
      }
    } catch (error) {
      console.error("Error fetching medical records:", error)
      setError("Failed to load medical records")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewRecord({
        ...newRecord,
        documents: Array.from(e.target.files)
      })
    }
  }

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newRecord.title.trim()) {
      setError("Title is required")
      return
    }

    try {
      const formData = new FormData()
      formData.append("title", newRecord.title)
      formData.append("description", newRecord.description)
      formData.append("folder", newRecord.folder)
      
      newRecord.documents.forEach((file, index) => {
        formData.append(`document${index}`, file)
      })

      const response = await fetch("/api/medical-records", {
        method: "POST",
        body: formData
      })

      if (response.ok) {
        await fetchMedicalRecords()
        setIsAddDialogOpen(false)
        setNewRecord({
          title: "",
          description: "",
          folder: "",
          documents: []
        })
        setError("")
      } else {
        const data = await response.json()
        setError(data.error || "Failed to create medical record")
      }
    } catch (error) {
      console.error("Error creating medical record:", error)
      setError("Failed to create medical record")
    }
  }

  const filteredRecords = medicalRecords.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (record.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    const matchesFolder = selectedFolder === "all" || record.folder === selectedFolder
    return matchesSearch && matchesFolder
  })

  const folders = Array.from(new Set(medicalRecords.map(record => record.folder).filter(Boolean)))

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentRole={currentRole} onRoleSwitch={setCurrentRole} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Medical Records</h1>
            <p className="text-gray-600">Manage and organize your health information</p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Record
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Medical Record</DialogTitle>
                <DialogDescription>
                  Create a new medical record and upload relevant documents
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleAddRecord} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={newRecord.title}
                    onChange={(e) => setNewRecord({...newRecord, title: e.target.value})}
                    placeholder="e.g., Blood Test Results"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newRecord.description}
                    onChange={(e) => setNewRecord({...newRecord, description: e.target.value})}
                    placeholder="Additional details about this record"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="folder">Folder (Optional)</Label>
                  <Input
                    id="folder"
                    value={newRecord.folder}
                    onChange={(e) => setNewRecord({...newRecord, folder: e.target.value})}
                    placeholder="e.g., Lab Results, Prescriptions"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="documents">Documents</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Upload medical documents, test results, etc.
                    </p>
                    <Input
                      id="documents"
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("documents")?.click()}
                    >
                      Choose Files
                    </Button>
                    {newRecord.documents.length > 0 && (
                      <p className="text-xs text-gray-600 mt-2">
                        {newRecord.documents.length} file(s) selected
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Create Record
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search medical records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white"
            >
              <option value="all">All Folders</option>
              {folders.map(folder => (
                <option key={folder} value={folder}>{folder}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Medical Records Grid */}
        {filteredRecords.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No medical records found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedFolder !== "all" 
                  ? "Try adjusting your search or filters"
                  : "Start by adding your first medical record"
                }
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Record
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecords.map(record => (
              <Card key={record.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-lg">{record.title}</CardTitle>
                    </div>
                    {record.folder && (
                      <Badge variant="secondary" className="text-xs">
                        <Folder className="h-3 w-3 mr-1" />
                        {record.folder}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="flex items-center text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(record.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {record.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {record.description}
                    </p>
                  )}
                  
                  {record.documents && record.documents.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-700">Documents:</p>
                      <div className="flex flex-wrap gap-1">
                        {record.documents.map((doc, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            Document {index + 1}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}