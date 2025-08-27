import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface MedicalRecord {
  id: string
  type: 'surgery' | 'chronic_condition' | 'allergy' | 'medication' | 'vaccination' | 'diagnosis' | 'lab_result'
  title: string
  description: string
  date: string
  doctor?: string
  hospital?: string
  severity?: 'low' | 'medium' | 'high' | 'critical'
  status: 'active' | 'resolved' | 'ongoing'
  documents?: string[]
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  startDate: string
  endDate?: string
  prescribedBy: string
  instructions: string
  status: 'active' | 'discontinued'
  sideEffects?: string[]
}

export interface VitalSigns {
  id: string
  date: string
  bloodPressure?: {
    systolic: number
    diastolic: number
  }
  heartRate?: number
  temperature?: number
  weight?: number
  height?: number
  bloodSugar?: number
  oxygenSaturation?: number
  notes?: string
}

export interface EmergencyContact {
  id: string
  name: string
  relationship: string
  phone: string
  email?: string
  address?: string
  isPrimary: boolean
}

export interface MedicalHistoryState {
  records: MedicalRecord[]
  medications: Medication[]
  vitalSigns: VitalSigns[]
  emergencyContacts: EmergencyContact[]
  allergies: string[]
  bloodType: string
  insuranceInfo?: {
    provider: string
    policyNumber: string
    groupNumber?: string
    validUntil: string
  }
  isLoading: boolean
  error: string | null
  selectedRecord: MedicalRecord | null
}

const initialState: MedicalHistoryState = {
  records: [],
  medications: [],
  vitalSigns: [],
  emergencyContacts: [],
  allergies: [],
  bloodType: '',
  isLoading: false,
  error: null,
  selectedRecord: null,
}

export const medicalHistorySlice = createSlice({
  name: 'medicalHistory',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    setRecords: (state, action: PayloadAction<MedicalRecord[]>) => {
      state.records = action.payload
    },
    addRecord: (state, action: PayloadAction<MedicalRecord>) => {
      state.records.push(action.payload)
    },
    updateRecord: (state, action: PayloadAction<{ id: string; updates: Partial<MedicalRecord> }>) => {
      const index = state.records.findIndex(record => record.id === action.payload.id)
      if (index !== -1) {
        state.records[index] = { ...state.records[index], ...action.payload.updates }
      }
    },
    removeRecord: (state, action: PayloadAction<string>) => {
      state.records = state.records.filter(record => record.id !== action.payload)
    },
    setSelectedRecord: (state, action: PayloadAction<MedicalRecord | null>) => {
      state.selectedRecord = action.payload
    },
    setMedications: (state, action: PayloadAction<Medication[]>) => {
      state.medications = action.payload
    },
    addMedication: (state, action: PayloadAction<Medication>) => {
      state.medications.push(action.payload)
    },
    updateMedication: (state, action: PayloadAction<{ id: string; updates: Partial<Medication> }>) => {
      const index = state.medications.findIndex(med => med.id === action.payload.id)
      if (index !== -1) {
        state.medications[index] = { ...state.medications[index], ...action.payload.updates }
      }
    },
    removeMedication: (state, action: PayloadAction<string>) => {
      state.medications = state.medications.filter(med => med.id !== action.payload)
    },
    setVitalSigns: (state, action: PayloadAction<VitalSigns[]>) => {
      state.vitalSigns = action.payload
    },
    addVitalSigns: (state, action: PayloadAction<VitalSigns>) => {
      state.vitalSigns.push(action.payload)
    },
    setEmergencyContacts: (state, action: PayloadAction<EmergencyContact[]>) => {
      state.emergencyContacts = action.payload
    },
    addEmergencyContact: (state, action: PayloadAction<EmergencyContact>) => {
      state.emergencyContacts.push(action.payload)
    },
    updateEmergencyContact: (state, action: PayloadAction<{ id: string; updates: Partial<EmergencyContact> }>) => {
      const index = state.emergencyContacts.findIndex(contact => contact.id === action.payload.id)
      if (index !== -1) {
        state.emergencyContacts[index] = { ...state.emergencyContacts[index], ...action.payload.updates }
      }
    },
    removeEmergencyContact: (state, action: PayloadAction<string>) => {
      state.emergencyContacts = state.emergencyContacts.filter(contact => contact.id !== action.payload)
    },
    setAllergies: (state, action: PayloadAction<string[]>) => {
      state.allergies = action.payload
    },
    addAllergy: (state, action: PayloadAction<string>) => {
      if (!state.allergies.includes(action.payload)) {
        state.allergies.push(action.payload)
      }
    },
    removeAllergy: (state, action: PayloadAction<string>) => {
      state.allergies = state.allergies.filter(allergy => allergy !== action.payload)
    },
    setBloodType: (state, action: PayloadAction<string>) => {
      state.bloodType = action.payload
    },
    setInsuranceInfo: (state, action: PayloadAction<MedicalHistoryState['insuranceInfo']>) => {
      state.insuranceInfo = action.payload
    },
  },
})

export const {
  setLoading,
  setError,
  setRecords,
  addRecord,
  updateRecord,
  removeRecord,
  setSelectedRecord,
  setMedications,
  addMedication,
  updateMedication,
  removeMedication,
  setVitalSigns,
  addVitalSigns,
  setEmergencyContacts,
  addEmergencyContact,
  updateEmergencyContact,
  removeEmergencyContact,
  setAllergies,
  addAllergy,
  removeAllergy,
  setBloodType,
  setInsuranceInfo,
} = medicalHistorySlice.actions

export default medicalHistorySlice.reducer