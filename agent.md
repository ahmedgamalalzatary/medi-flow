# Mediflow Application Specification

## Overview
Mediflow is a healthcare management platform that connects patients with doctors for online consultations. The platform allows patients to maintain their medical history, search for doctors, schedule appointments, and communicate securely.

## Target Users
- Patients (instant signup)
- Doctors (verification required)
- Admins (platform management)

## Core Features

### 1. User Management
- **Patient Signup**: Instant registration and access
- **Doctor Signup**: Requires document verification (university certificate and related documents)
- **Doctor Verification**: 
  - Internal admin verification process
  - Timeline: 12-48 hours depending on traffic
  - Complete account lockdown until verification email is sent
- **Account Activation**: Doctors receive email after verification
- **Role-based Access**: 
  - Patients, Doctors, Admins (single admin type)
  - Users can be both doctor and patient simultaneously
  - Profile switching button available in profile page
  - Complete separate interfaces for doctor/patient modes

### 2. Patient History Management
- Comprehensive medical history recording (detailed as possible, some fields optional)
- Document/image upload capability (any medical document type)
- OCR functionality to extract information from medical documents (medium accuracy, manual correction for errors)
- Medical record organization and management
- Patients can create custom folders for different illnesses
- Doctors with scheduled appointments can access patient medical history without permission
- After appointment completion/decline, doctors need patient permission to access history
- No data retention limits (as long as patient account exists)

### 3. Doctor Profiles & Search
- Detailed doctor profiles with specialties, qualifications, experience
- Doctor ratings and reviews (1-5 stars + comments)
- Reviews cannot be edited/deleted after posting
- Any consultation type can receive a review
- Advanced search and filtering:
  - Specialty (as many as possible in MVP)
  - Availability (real-time display)
  - Ratings
  - Popularity (consultations × rating - recent consultations weigh more)
  - Location
  - Price range
  - Years of experience
  - Languages spoken

### 4. Appointment System
- Patient-driven appointment requests
- Doctor workflow:
  - Accept appointments
  - Request changes to appointment data (type/date/time)
  - Decline appointments
- Patient/Doctor capabilities:
  - Both can reschedule, accept, delete appointments
  - Cancellation allowed up to 12 hours before appointment
  - Penalties/restrictions/warnings for late cancellations
- Appointment details include:
  - Patient illness
  - Specific needs
  - Questions
  - Time and date preferences
- Doctor availability:
  - Calendar-based scheduling (infinite booking horizon)
  - Doctors set their own availability schedules
  - Can block break times
  - Same availability for all consultation types
- Consultation duration:
  - Maximum duration selected by doctors (30min, 1h, 10min, etc.)
  - Pricing based on $/hour rate
- Emergency/Urgent appointments:
  - Displayed in red with warning sign
  - Requires doctor approval
  - Same pricing as regular appointments
  - Can override normal availability if doctor approves
- Patient limits:
  - Maximum 5 different doctors simultaneously
  - No-show policy: 15-minute grace period, penalties for both parties

### 5. Payment System
- Appointment-based payments (payment required before booking confirmation)
- Variable pricing per doctor/service ($/hour rate with duration selection)
- Integrated payment processing
- Doctors can offer free consultations or discounts for specific patients
- Refund policy:
  - Declined appointments: automatic refund
  - Rescheduled appointments: patient choice to refund and repay or keep payment
- No insurance integration (future consideration)
- Penalty system:
  - Account suspension, booking restrictions, warnings, fees
  - 3 warnings before restrictions applied
  - Mix of automatic and admin-reviewed penalties

### 6. Communication System
- Real-time private messaging between patients and doctors
- Message availability:
  - Unlocked after patient payment and doctor approval
  - Continues indefinitely after activation
  - Patients can message doctors before consultation after appointment confirmation
- Message features:
  - In-app messaging only (no email/push notifications)
  - Text-only (no file sharing)
  - Read receipts and typing indicators
  - Doctor availability hours apply to message responses
- Message retention: 90 days of inactivity before deletion

### 7. Rating & Review System
- Post-appointment rating submission (1-5 stars)
- Written reviews and comments
- Public display of doctor ratings

### 8. Admin Panel
- Doctor verification workflow
- User management
- Support ticket system
- Analytics dashboard

## Technical Requirements

### Frontend
- Next.js 13+ with App Router
- TypeScript
- Tailwind CSS
- chadcn/ui component library
- Redux Toolkit + RTK Query for state management (offline and online management)
- Professional medical tool design approach
- Desktop + mobile responsive design (website, not mobile app)

### Backend
- Next.js API routes
- MongoDB/Mongoose for data storage
- NextAuth.js for authentication
- Cloud storage for medical documents (AWS S3, Cloudinary, etc.)
- OCR processing (Tesseract.js or Google Cloud Vision API)
- Payment processing (Stripe or similar)
- Real-time messaging (Socket.io or Pusher)

### Accessibility
- 100% compliance with accessibility standards
- Support for disabled users

### Security
- Secure authentication and authorization
- Encrypted data storage and transmission
- No specific HIPAA compliance requirements

## Database Schema

### Users Collection
- Profile information (name, contact details, etc.)
- Authentication credentials
- User type (patient/doctor/admin)
- Verification status
- Account status

### Medical Records Collection
- Patient medical history data
- Document references
- OCR extracted information

### Doctors Collection
- Specialty information
- Qualifications and experience
- Availability schedules
- Pricing information
- Rating data

### Appointments Collection
- Appointment details
- Status tracking (requested, accepted, declined, rescheduled)
- Payment information
- Timestamps

### Messages Collection
- Chat history between patients and doctors
- Message metadata (timestamps, read status)

### Reviews Collection
- Rating details (1-5 stars)
- Review text
- Associated appointment reference

## Development Phases

### Phase 1: Foundation
- User authentication system
- Basic UI with chadcn/ui components
- Database setup
- Landing, login, and signup pages

### Phase 2: Core Functionality
- Patient history management
- Doctor profiles and verification
- Search and filtering

### Phase 3: Appointment System
- Appointment requests
- Doctor approval workflow
- Payment integration

### Phase 4: Communication & Reviews
- Real-time messaging
- Rating and review system

### Phase 5: Admin Panel
- Doctor verification
- User management
- Support system

### Phase 6: Polish & Optimization
- Accessibility compliance
- Performance optimization
- Testing and bug fixes

## Additional Specifications

### Business Rules Summary
- Patient consultation limit: Maximum 5 different doctors simultaneously (real-time enforcement)
- Cancellation policy: 12-hour minimum notice required
- No-show grace period: 15 minutes before penalties apply
- Warning system: 3 warnings before account restrictions
- Message retention: 90 days of inactivity
- Doctor verification: 12-48 hour timeline
- Emergency appointments: Same pricing, requires doctor approval

### UI/UX Guidelines
- Professional medical tool appearance
- Dual interface system (complete separation between doctor/patient views)
- Role switching via profile page button
- Real-time availability display during booking
- Emergency appointments highlighted in red with warning signs
- Desktop and mobile responsive (website only, no mobile app)

### Development Notes
- No existing mockups or wireframes
- No direct competitors in this specific area
- No specific target timeline
- All discussed features are equally important for MVP
- Start with basic auth system and user management

## Future Considerations
- Video consultation capabilities
- Integration with third-party services
- Mobile application development
- Advanced analytics and reporting
- Insurance integration
- Enhanced review moderation system