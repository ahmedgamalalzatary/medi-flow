-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- =============================================
-- PROFILES TABLE POLICIES
-- =============================================

-- Users can view their own profile and public doctor profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view verified doctor profiles" ON public.profiles
  FOR SELECT USING (
    role = 'DOCTOR' AND 
    verification_status = 'VERIFIED' AND 
    account_status = 'active'
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow insert for new user registration (handled by trigger)
CREATE POLICY "Allow profile creation" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =============================================
-- PATIENTS TABLE POLICIES
-- =============================================

-- Patients can view/update their own data
CREATE POLICY "Patients can view own data" ON public.patients
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Patients can update own data" ON public.patients
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Patients can insert own data" ON public.patients
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Doctors can view patient data for their appointments
CREATE POLICY "Doctors can view patient data for appointments" ON public.patients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.appointments a
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE a.patient_id = patients.user_id 
      AND a.doctor_id = auth.uid()
      AND p.role = 'DOCTOR'
      AND a.status IN ('ACCEPTED', 'COMPLETED')
    )
  );

-- =============================================
-- DOCTORS TABLE POLICIES
-- =============================================

-- Anyone can view verified doctor profiles
CREATE POLICY "Anyone can view verified doctors" ON public.doctors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = doctors.user_id 
      AND p.verification_status = 'VERIFIED' 
      AND p.account_status = 'active'
    )
  );

-- Doctors can update their own profile
CREATE POLICY "Doctors can update own profile" ON public.doctors
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Doctors can insert own profile" ON public.doctors
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- =============================================
-- AVAILABILITIES TABLE POLICIES
-- =============================================

-- Anyone can view doctor availabilities
CREATE POLICY "Anyone can view doctor availability" ON public.availabilities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.doctors d
      JOIN public.profiles p ON p.id = d.user_id
      WHERE d.id = availabilities.doctor_id
      AND p.verification_status = 'VERIFIED'
      AND p.account_status = 'active'
    )
  );

-- Doctors can manage their own availability
CREATE POLICY "Doctors can manage own availability" ON public.availabilities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.doctors d
      WHERE d.id = availabilities.doctor_id
      AND d.user_id = auth.uid()
    )
  );

-- =============================================
-- MEDICAL RECORDS TABLE POLICIES
-- =============================================

-- Patients can view/manage their own medical records
CREATE POLICY "Patients can manage own medical records" ON public.medical_records
  FOR ALL USING (patient_id = auth.uid());

-- Doctors can view medical records for their patients during appointments
CREATE POLICY "Doctors can view patient medical records" ON public.medical_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.appointments a
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE a.patient_id = medical_records.patient_id
      AND a.doctor_id = auth.uid()
      AND p.role = 'DOCTOR'
      AND a.status IN ('ACCEPTED', 'COMPLETED')
    )
  );

-- =============================================
-- APPOINTMENTS TABLE POLICIES
-- =============================================

-- Patients can view their own appointments
CREATE POLICY "Patients can view own appointments" ON public.appointments
  FOR SELECT USING (patient_id = auth.uid());

-- Doctors can view their own appointments
CREATE POLICY "Doctors can view own appointments" ON public.appointments
  FOR SELECT USING (doctor_id = auth.uid());

-- Patients can create appointments
CREATE POLICY "Patients can create appointments" ON public.appointments
  FOR INSERT WITH CHECK (
    patient_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role = 'PATIENT'
    )
  );

-- Patients can update their own appointments (limited fields)
CREATE POLICY "Patients can update own appointments" ON public.appointments
  FOR UPDATE USING (
    patient_id = auth.uid() AND
    status IN ('REQUESTED', 'ACCEPTED')
  );

-- Doctors can update appointments they're assigned to
CREATE POLICY "Doctors can update assigned appointments" ON public.appointments
  FOR UPDATE USING (
    doctor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role = 'DOCTOR'
    )
  );

-- =============================================
-- MESSAGES TABLE POLICIES
-- =============================================

-- Users can view messages they sent or received
CREATE POLICY "Users can view own messages" ON public.messages
  FOR SELECT USING (
    sender_id = auth.uid() OR receiver_id = auth.uid()
  );

-- Users can send messages
CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Users can update message status (mark as read)
CREATE POLICY "Users can update message status" ON public.messages
  FOR UPDATE USING (receiver_id = auth.uid());

-- =============================================
-- REVIEWS TABLE POLICIES
-- =============================================

-- Anyone can view reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

-- Patients can create reviews for their completed appointments
CREATE POLICY "Patients can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (
    patient_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.id = reviews.appointment_id
      AND a.patient_id = auth.uid()
      AND a.status = 'COMPLETED'
    )
  );

-- Patients can update their own reviews
CREATE POLICY "Patients can update own reviews" ON public.reviews
  FOR UPDATE USING (patient_id = auth.uid());

-- =============================================
-- PAYMENTS TABLE POLICIES
-- =============================================

-- Users can view their own payments
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (user_id = auth.uid());

-- Users can create their own payments
CREATE POLICY "Users can create own payments" ON public.payments
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own payments
CREATE POLICY "Users can update own payments" ON public.payments
  FOR UPDATE USING (user_id = auth.uid());

-- =============================================
-- WARNINGS TABLE POLICIES
-- =============================================

-- Users can view their own warnings
CREATE POLICY "Users can view own warnings" ON public.warnings
  FOR SELECT USING (user_id = auth.uid());

-- Only admins can manage warnings (will be handled by service role)
CREATE POLICY "Admins can manage warnings" ON public.warnings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role = 'ADMIN'
    )
  );

-- =============================================
-- STORAGE POLICIES (for file uploads)
-- =============================================

-- Create storage bucket for medical records
INSERT INTO storage.buckets (id, name, public) 
VALUES ('medical-records', 'medical-records', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload medical records
CREATE POLICY "Users can upload medical records" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'medical-records' AND
    auth.role() = 'authenticated'
  );

-- Allow users to view their own medical record files
CREATE POLICY "Users can view own medical record files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'medical-records' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete their own medical record files
CREATE POLICY "Users can delete own medical record files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'medical-records' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );