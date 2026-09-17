-- Migration: 20260909000002_employees_and_credentials.sql
-- Add Employees, Credentials, and Rules tables for Pranabananda Vidyamandir

-- 1. Employees Table
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  department TEXT NOT NULL,
  designation TEXT NOT NULL,
  shift TEXT NOT NULL,
  rfid_uid TEXT UNIQUE NOT NULL,
  biometric_id TEXT UNIQUE,
  phone TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  attendance_percentage NUMERIC(5, 2) DEFAULT 100.0,
  present_days INT DEFAULT 0,
  total_days INT DEFAULT 0,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ON_DUTY', 'ON_LEAVE')),
  duty_location TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. User Credentials Table for Institutional Auth
CREATE TABLE IF NOT EXISTS public.credentials (
  id TEXT PRIMARY KEY,
  person_name TEXT NOT NULL,
  person_type TEXT NOT NULL CHECK (person_type IN ('STUDENT', 'STAFF', 'ADMIN', 'EMPLOYEE')),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  temp_password TEXT NOT NULL,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PENDING_OTP_VERIFICATION')),
  otp_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Institutional Attendance Rules Configuration
CREATE TABLE IF NOT EXISTS public.attendance_rules (
  id TEXT PRIMARY KEY DEFAULT 'current_rules',
  school_name TEXT NOT NULL,
  start_time TEXT NOT NULL,
  late_threshold TEXT NOT NULL,
  half_day_threshold TEXT NOT NULL,
  cutoff_time TEXT NOT NULL,
  minimum_attendance_percentage INT DEFAULT 75,
  grace_period_minutes INT DEFAULT 5,
  auto_notify_parents BOOLEAN DEFAULT TRUE,
  auto_sync_google_sheets BOOLEAN DEFAULT TRUE,
  biometric_required BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read employees" ON public.employees FOR SELECT USING (true);
CREATE POLICY "Allow public read credentials" ON public.credentials FOR SELECT USING (true);
CREATE POLICY "Allow public read attendance_rules" ON public.attendance_rules FOR SELECT USING (true);
