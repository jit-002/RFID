-- ====================================================================
-- SmartAttend — Next-Generation RFID + Biometric Attendance Ecosystem
-- Complete Normalized PostgreSQL / Supabase Schema & Security Migration
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users & Roles
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'STAFF', 'STUDENT', 'PARENT')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Students Registry
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admission_no TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  class_grade TEXT NOT NULL,
  section TEXT NOT NULL,
  roll_no TEXT NOT NULL,
  rfid_uid TEXT UNIQUE NOT NULL,
  biometric_id TEXT UNIQUE,
  has_face_template BOOLEAN DEFAULT TRUE,
  has_fingerprint_template BOOLEAN DEFAULT TRUE,
  parent_name TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  parent_email TEXT,
  attendance_percentage NUMERIC(5, 2) DEFAULT 100.0,
  total_days INT DEFAULT 0,
  present_days INT DEFAULT 0,
  late_days INT DEFAULT 0,
  absent_days INT DEFAULT 0,
  streak_days INT DEFAULT 0,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Staff Registry
CREATE TABLE IF NOT EXISTS public.staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  department TEXT NOT NULL,
  designation TEXT NOT NULL,
  rfid_uid TEXT UNIQUE NOT NULL,
  biometric_id TEXT UNIQUE,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  attendance_percentage NUMERIC(5, 2) DEFAULT 100.0,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ON_LEAVE')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. IoT Devices & Perimeter Gateways
CREATE TABLE IF NOT EXISTS public.devices (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('RASPBERRY_PI_GATEWAY', 'ESP8266_NODE', 'RFID_READER', 'FINGERPRINT_SCANNER', 'FACE_CAMERA')),
  location TEXT NOT NULL,
  status TEXT DEFAULT 'ONLINE' CHECK (status IN ('ONLINE', 'OFFLINE', 'SYNCING', 'DEGRADED')),
  ip_address TEXT NOT NULL,
  mac_address TEXT NOT NULL,
  firmware_version TEXT NOT NULL,
  last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
  events_processed INT DEFAULT 0,
  error_count INT DEFAULT 0,
  gateway_id TEXT REFERENCES public.devices(id),
  uptime_hours INT DEFAULT 0,
  signal_strength INT DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Attendance Records
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id TEXT NOT NULL,
  person_type TEXT NOT NULL CHECK (person_type IN ('STUDENT', 'STAFF')),
  person_name TEXT NOT NULL,
  class_or_dept TEXT NOT NULL,
  date DATE NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'LEAVE', 'EXCUSED', 'HOLIDAY', 'WEEKEND', 'VERIFICATION_FAILED', 'MANUALLY_CORRECTED')),
  verification_method TEXT NOT NULL CHECK (verification_method IN ('RFID_ONLY', 'RFID_AND_FINGERPRINT', 'RFID_AND_FACE', 'MANUAL_OVERRIDE')),
  device_id TEXT REFERENCES public.devices(id),
  location TEXT NOT NULL,
  rfid_uid TEXT NOT NULL,
  is_corrected BOOLEAN DEFAULT FALSE,
  correction_reason TEXT,
  corrected_by TEXT,
  parent_notified BOOLEAN DEFAULT FALSE,
  google_sheets_synced BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lightning queries
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_person ON public.attendance(person_id);
CREATE INDEX IF NOT EXISTS idx_attendance_rfid ON public.attendance(rfid_uid);

-- 6. Security Events & Anti-Replay Guard Log
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('UNKNOWN_RFID', 'BIOMETRIC_MISMATCH', 'DUPLICATE_TAP', 'DEVICE_TAMPER', 'MANUAL_OVERRIDE')),
  severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  description TEXT NOT NULL,
  rfid_uid TEXT,
  device_id TEXT REFERENCES public.devices(id),
  location TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE,
  resolved_by TEXT
);

-- 7. Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor TEXT NOT NULL,
  role TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Anonymous / Service Read Access for authorized portals
CREATE POLICY "Allow read attendance records" ON public.attendance FOR SELECT USING (true);
CREATE POLICY "Allow read students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Allow read staff" ON public.staff FOR SELECT USING (true);
