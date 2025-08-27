import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Doctor {
  id: string
  name: string
  specialty: string
  email: string
  avatar?: string
  rating: number
  experience: number
  location: string
  consultationFee: number
  availableSlots: string[]
  bio: string
  qualifications: string[]
}

export interface Appointment {
  id: string
  doctorId: string
  patientId: string
  date: string
  time: string
  duration: number
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'in-progress'
  type: 'video' | 'audio' | 'chat'
  symptoms: string
  notes?: string
  prescription?: string
  meetingUrl?: string
  createdAt: string
  updatedAt: string
}

export interface AppointmentState {
  appointments: Appointment[]
  doctors: Doctor[]
  selectedDoctor: Doctor | null
  selectedAppointment: Appointment | null
  isLoading: boolean
  error: string | null
  filters: {
    specialty: string
    location: string
    date: string
    availability: boolean
  }
}

const initialState: AppointmentState = {
  appointments: [],
  doctors: [],
  selectedDoctor: null,
  selectedAppointment: null,
  isLoading: false,
  error: null,
  filters: {
    specialty: '',
    location: '',
    date: '',
    availability: false,
  },
}

export const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    setDoctors: (state, action: PayloadAction<Doctor[]>) => {
      state.doctors = action.payload
    },
    setSelectedDoctor: (state, action: PayloadAction<Doctor | null>) => {
      state.selectedDoctor = action.payload
    },
    setAppointments: (state, action: PayloadAction<Appointment[]>) => {
      state.appointments = action.payload
    },
    addAppointment: (state, action: PayloadAction<Appointment>) => {
      state.appointments.push(action.payload)
    },
    updateAppointment: (state, action: PayloadAction<{ id: string; updates: Partial<Appointment> }>) => {
      const index = state.appointments.findIndex(apt => apt.id === action.payload.id)
      if (index !== -1) {
        state.appointments[index] = { ...state.appointments[index], ...action.payload.updates }
      }
    },
    removeAppointment: (state, action: PayloadAction<string>) => {
      state.appointments = state.appointments.filter(apt => apt.id !== action.payload)
    },
    setSelectedAppointment: (state, action: PayloadAction<Appointment | null>) => {
      state.selectedAppointment = action.payload
    },
    updateFilters: (state, action: PayloadAction<Partial<AppointmentState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {
        specialty: '',
        location: '',
        date: '',
        availability: false,
      }
    },
  },
})

export const {
  setLoading,
  setError,
  setDoctors,
  setSelectedDoctor,
  setAppointments,
  addAppointment,
  updateAppointment,
  removeAppointment,
  setSelectedAppointment,
  updateFilters,
  clearFilters,
} = appointmentSlice.actions

export default appointmentSlice.reducer