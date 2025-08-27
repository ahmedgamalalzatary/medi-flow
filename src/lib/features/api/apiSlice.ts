import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../../store'
import type { User } from '../auth/authSlice'
import type { Doctor, Appointment } from '../appointments/appointmentSlice'
import type { MedicalRecord, Medication, VitalSigns } from '../medical/medicalHistorySlice'

// Auth types
export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  name: string
  email: string
  password: string
  role: 'patient' | 'doctor'
}

export interface AuthResponse {
  user: User
  token: string
}

// Appointment types
export interface BookAppointmentRequest {
  doctorId: string
  date: string
  time: string
  symptoms: string
  type: 'video' | 'audio' | 'chat'
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface ChatRequest {
  message: string
  medicalHistory?: MedicalRecord[]
  currentMedications?: Medication[]
  userId: string
}

// Define our API slice
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['User', 'Doctor', 'Appointment', 'MedicalRecord', 'Medication', 'Chat'],
  endpoints: (builder) => ({
    // Authentication endpoints
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: 'auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),
    signup: builder.mutation<AuthResponse, SignupRequest>({
      query: (userData) => ({
        url: 'auth/signup',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: 'auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
    getProfile: builder.query<User, void>({
      query: () => 'auth/profile',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation<User, Partial<User>>({
      query: (updates) => ({
        url: 'auth/profile',
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: ['User'],
    }),

    // Doctor endpoints
    getDoctors: builder.query<Doctor[], { specialty?: string; location?: string }>({
      query: (params) => ({
        url: 'doctors',
        params,
      }),
      providesTags: ['Doctor'],
    }),
    getDoctor: builder.query<Doctor, string>({
      query: (id) => `doctors/${id}`,
      providesTags: (result, error, id) => [{ type: 'Doctor', id }],
    }),

    // Appointment endpoints
    getAppointments: builder.query<Appointment[], void>({
      query: () => 'appointments',
      providesTags: ['Appointment'],
    }),
    getAppointment: builder.query<Appointment, string>({
      query: (id) => `appointments/${id}`,
      providesTags: (result, error, id) => [{ type: 'Appointment', id }],
    }),
    bookAppointment: builder.mutation<Appointment, BookAppointmentRequest>({
      query: (appointmentData) => ({
        url: 'appointments',
        method: 'POST',
        body: appointmentData,
      }),
      invalidatesTags: ['Appointment'],
    }),
    updateAppointment: builder.mutation<Appointment, { id: string; updates: Partial<Appointment> }>({
      query: ({ id, updates }) => ({
        url: `appointments/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Appointment', id }],
    }),
    cancelAppointment: builder.mutation<void, string>({
      query: (id) => ({
        url: `appointments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Appointment'],
    }),

    // Medical records endpoints
    getMedicalRecords: builder.query<MedicalRecord[], void>({
      query: () => 'medical-records',
      providesTags: ['MedicalRecord'],
    }),
    createMedicalRecord: builder.mutation<MedicalRecord, Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>>({
      query: (recordData) => ({
        url: 'medical-records',
        method: 'POST',
        body: recordData,
      }),
      invalidatesTags: ['MedicalRecord'],
    }),
    updateMedicalRecord: builder.mutation<MedicalRecord, { id: string; updates: Partial<MedicalRecord> }>({
      query: ({ id, updates }) => ({
        url: `medical-records/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'MedicalRecord', id }],
    }),
    deleteMedicalRecord: builder.mutation<void, string>({
      query: (id) => ({
        url: `medical-records/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MedicalRecord'],
    }),

    // Medication endpoints
    getMedications: builder.query<Medication[], void>({
      query: () => 'medications',
      providesTags: ['Medication'],
    }),
    addMedication: builder.mutation<Medication, Omit<Medication, 'id'>>({
      query: (medicationData) => ({
        url: 'medications',
        method: 'POST',
        body: medicationData,
      }),
      invalidatesTags: ['Medication'],
    }),
    updateMedication: builder.mutation<Medication, { id: string; updates: Partial<Medication> }>({
      query: ({ id, updates }) => ({
        url: `medications/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Medication', id }],
    }),
    deleteMedication: builder.mutation<void, string>({
      query: (id) => ({
        url: `medications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Medication'],
    }),

    // AI Chat endpoints
    sendChatMessage: builder.mutation<ChatMessage, ChatRequest>({
      query: (chatData) => ({
        url: 'chat',
        method: 'POST',
        body: chatData,
      }),
      invalidatesTags: ['Chat'],
    }),
    getChatHistory: builder.query<ChatMessage[], string>({
      query: (userId) => `chat/history/${userId}`,
      providesTags: ['Chat'],
    }),
  }),
})

// Export hooks for usage in functional components
export const {
  // Auth hooks
  useLoginMutation,
  useSignupMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  
  // Doctor hooks
  useGetDoctorsQuery,
  useGetDoctorQuery,
  
  // Appointment hooks
  useGetAppointmentsQuery,
  useGetAppointmentQuery,
  useBookAppointmentMutation,
  useUpdateAppointmentMutation,
  useCancelAppointmentMutation,
  
  // Medical record hooks
  useGetMedicalRecordsQuery,
  useCreateMedicalRecordMutation,
  useUpdateMedicalRecordMutation,
  useDeleteMedicalRecordMutation,
  
  // Medication hooks
  useGetMedicationsQuery,
  useAddMedicationMutation,
  useUpdateMedicationMutation,
  useDeleteMedicationMutation,
  
  // Chat hooks
  useSendChatMessageMutation,
  useGetChatHistoryQuery,
} = apiSlice