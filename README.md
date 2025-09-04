# 🏥 Mediflow - Healthcare Management Platform

A comprehensive telemedicine platform that connects patients with healthcare professionals for secure online consultations, appointment scheduling, and medical record management.

## 🌟 Platform Overview

Mediflow is a modern healthcare management system designed to bridge the gap between patients and healthcare providers through digital solutions. The platform enables secure virtual consultations, streamlined appointment booking, and comprehensive medical record management.

## ✨ Core Features

### 👥 Multi-Role Authentication

- **🩺 Doctor Registration** - Professional verification with document upload and admin approval
- **� Patient Registration** - Instant access with profile completion requirements
- **🔐 Role-Based Access Control** - Secure separation of patient and doctor functionalities
- **✅ Account Verification** - Email verification and professional credential validation

### 📅 Appointment Management

- **🔍 Doctor Discovery** - Advanced search by specialty, location, rating, and availability
- **📋 Appointment Booking** - Multi-step booking process with time slot selection
- **💰 Dynamic Pricing** - Variable consultation fees based on duration and doctor rates
- **📊 Status Tracking** - Real-time appointment status updates (requested, accepted, completed, etc.)
- **⏰ Live Scheduling** - Interactive calendar with doctor availability management

### 💬 Real-Time Communication

- **� Secure Messaging** - End-to-end encrypted patient-doctor communication
- **� Live Notifications** - Real-time updates for appointments and messages
- **� Consultation Workflow** - Structured communication during appointments
- **📝 Message History** - Persistent conversation records with read receipts

### � Medical Records Management

- **�️ Document Organization** - Folder-based medical record categorization
- **� File Upload** - Support for multiple document formats (PDF, images, docs)
- **🔍 OCR Integration** - Text extraction from uploaded medical documents
- **📊 Health History** - Comprehensive patient medical timeline

## 🛠️ Technology Stack

### 🎯 Frontend Framework

- **⚡ Next.js 15** - React framework with App Router for modern web applications
- **� TypeScript** - Full type safety across the entire application
- **🎨 Tailwind CSS 4** - Utility-first styling with custom healthcare design system

### 🔧 UI Components & Styling

- **🧩 shadcn/ui** - Accessible component library built on Radix UI primitives
- **🎯 Lucide React** - Medical and healthcare-specific iconography
- **🎨 CSS Variables** - Custom healthcare color palette and theming

### 🗄️ Backend & Database

- **🔥 Supabase** - PostgreSQL database with real-time subscriptions
- **🔐 Supabase Auth** - User authentication with role-based access control
- **� Row Level Security** - Database-level security policies for healthcare data
- **� Database Triggers** - Automated profile creation and data validation

### 🔄 Real-Time Features

- **⚡ Supabase Realtime** - Live updates for messages and appointments
- **� Push Notifications** - Instant alerts for critical healthcare events
- **� WebSocket Connections** - Persistent real-time communication channels

### 🎨 Advanced Functionality

- **📋 React Hook Form** - Performant medical forms with validation
- **✅ Zod Validation** - Schema validation for healthcare data integrity
- **📅 Date-fns** - Medical appointment and timestamp management
- **🖼️ Sharp** - Medical document image processing

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (or Supabase account)
- Environment variables configured

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd mediflow

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Configure your Supabase credentials and other environment variables

# Set up the database
npm run db:setup  # Run Supabase migrations

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the platform.

### Default Access

- **Patients**: Can register instantly and complete profile
- **Doctors**: Require professional verification before platform access
- **Development**: Use Supabase dashboard for user management

## �️ Platform Architecture

### Healthcare Data Model

```
Profiles (Users) → Patients (Medical Info)
                → Doctors (Professional Info)
                → Appointments (Scheduling)
                → Messages (Communication)
                → Medical Records (Documents)
                → Reviews (Feedback)
```

### Authentication Flow

1. **User Registration** - Email/password with role selection
2. **Profile Creation** - Automatic profile generation via database triggers
3. **Role Verification** - Doctors require document verification by admins
4. **Access Control** - Row-level security policies enforce data isolation

### Real-Time Architecture

- **Supabase Subscriptions** - Live updates for appointments and messages
- **Custom Hooks** - `useRealtimeMessages()`, `useRealtimeAppointments()`
- **WebSocket Management** - Automatic connection handling and cleanup

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes for backend functionality
│   │   ├── auth/          # Authentication endpoints
│   │   ├── appointments/  # Appointment management
│   │   ├── doctors/       # Doctor-related operations
│   │   └── patients/      # Patient-related operations
│   ├── auth/              # Authentication pages
│   │   ├── signin/        # User login
│   │   ├── signup/        # Patient registration
│   │   └── doctor-signup/ # Doctor registration with verification
│   └── dashboard/         # Protected dashboard pages
│       ├── appointments/  # Appointment management
│       ├── doctors/       # Doctor discovery and profiles
│       ├── medical-records/ # Medical document management
│       └── book-appointment/ # Appointment booking flow
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui component library
│   ├── appointments/     # Appointment-specific components
│   ├── messaging/        # Real-time chat components
│   ├── notifications/    # Notification system
│   └── providers/        # Context providers for auth and Supabase
├── hooks/                # Custom React hooks
│   ├── use-auth.ts       # Authentication state management
│   ├── use-realtime.ts   # Real-time subscriptions
│   └── use-toast.ts      # Toast notifications
├── lib/                  # Utility functions and configurations
│   ├── supabase.ts       # Supabase client setup
│   └── utils.ts          # Helper utilities
└── types/                # TypeScript type definitions
    ├── database.ts       # Auto-generated Supabase types
    └── auth.ts           # Authentication types
supabase/
├── schema.sql            # Database schema and table definitions
└── rls_policies.sql      # Row Level Security policies
```

## 🩺 Healthcare-Specific Features

### Medical Record Management

- **📁 Folder Organization** - Categorize records by type (Lab Results, Prescriptions, etc.)
- **🔍 OCR Processing** - Extract text from uploaded medical documents
- **🔒 HIPAA Compliance** - Secure document storage with access controls
- **📊 Document Versioning** - Track changes and updates to medical records

### Doctor Verification System

- **📜 Credential Upload** - Medical license and certification verification
- **✅ Admin Approval** - Manual review process for doctor applications
- **📧 Email Notifications** - Automated communication during verification
- **⏳ Status Tracking** - Real-time verification status updates

### Appointment Workflow

- **� Smart Search** - Find doctors by specialty, location, ratings
- **📅 Availability Management** - Real-time doctor schedule integration
- **💰 Dynamic Pricing** - Consultation fees based on duration and doctor rates
- **📋 Pre-Consultation Forms** - Patient symptom and question collection
- **🔔 Status Updates** - Real-time appointment status changes

### Communication Features

- **💬 Secure Messaging** - HIPAA-compliant patient-doctor communication
- **📱 Real-Time Updates** - Live message delivery and read receipts
- **🔔 Smart Notifications** - Context-aware alerts for healthcare events
- **📞 Video Integration Ready** - Framework for future telemedicine calls

## 🔒 Security & Compliance

### Data Protection

- **🛡️ Row Level Security** - Database-level access control for healthcare data
- **🔐 JWT Authentication** - Secure session management with Supabase Auth
- **🔒 HIPAA Considerations** - Privacy-focused architecture for medical data
- **📊 Audit Trails** - Comprehensive logging of healthcare data access

### API Security

- **🔑 Bearer Token Authentication** - Secure API endpoint protection
- **🛡️ Role-Based Permissions** - Granular access control for different user types
- **✅ Input Validation** - Zod schema validation for all healthcare data
- **🚫 Rate Limiting** - Protection against API abuse and spam

## 🚀 Development Workflow

### Environment Setup

```bash
# Required Environment Variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Database Management

```bash
# Initialize Supabase
npx supabase init

# Link to your project
npx supabase link

# Run migrations
npx supabase db push

# Generate types
npx supabase gen types typescript > src/types/database.ts
```

### Testing Strategy

- **👤 Multi-Role Testing** - Test with patient, doctor, and admin accounts
- **📱 Real-Time Testing** - Verify live updates across multiple browser sessions
- **🔒 Security Testing** - Validate RLS policies and access controls
- **📊 Healthcare Workflow Testing** - End-to-end appointment and messaging flows

## 🎯 Key Healthcare Workflows

### Patient Journey

1. **Registration** → Profile completion → Doctor search → Appointment booking
2. **Medical Records** → Document upload → OCR processing → Organization
3. **Communication** → Doctor messaging → Appointment updates → Follow-ups

### Doctor Journey

1. **Professional Registration** → Document verification → Account activation
2. **Schedule Management** → Availability setting → Appointment acceptance
3. **Patient Care** → Consultation delivery → Record management → Follow-up care

### Admin Operations

1. **Doctor Verification** → Document review → Account approval → Communication
2. **Platform Management** → User monitoring → System maintenance → Support

## 🛠️ Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:reset     # Reset database schema
npm run db:seed      # Populate with sample data
npm run types        # Regenerate database types

# Testing
npm run test         # Run test suite
npm run test:e2e     # End-to-end testing
```

## 🤝 Contributing

### Development Guidelines

- Follow healthcare data privacy best practices
- Implement comprehensive error handling
- Write tests for critical healthcare workflows
- Document API endpoints and data models
- Ensure accessibility compliance for healthcare users

### Code Standards

- TypeScript strict mode enabled
- ESLint configuration for healthcare applications
- Prettier formatting with healthcare-friendly settings
- Component documentation for medical UI elements

---

**⚕️ Built for Healthcare** - Secure, scalable, and compliant telemedicine platform
**🚀 Modern Stack** - Next.js 15, TypeScript, Supabase, shadcn/ui
**🔒 Privacy-First** - HIPAA-conscious architecture and data handling
