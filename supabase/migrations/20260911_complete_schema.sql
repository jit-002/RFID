-- ====================================================================
-- SmartAttend — Full Schema for Pranabananda Vidyamandir (PVM Lumding)
-- Project: wrddfwmdowtklncazczs
-- Generated: 2026-09-11
-- ====================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Students Registry
CREATE TABLE IF NOT EXISTS public.students (
  id TEXT PRIMARY KEY DEFAULT ('std-' || substr(md5(random()::text), 1, 10)),
  admission_no TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  class_grade TEXT NOT NULL DEFAULT '12',
  section TEXT NOT NULL DEFAULT 'Science',
  roll_no TEXT NOT NULL DEFAULT '01',
  rfid_uid TEXT UNIQUE,
  biometric_id TEXT,
  has_face_template BOOLEAN DEFAULT TRUE,
  has_fingerprint_template BOOLEAN DEFAULT TRUE,
  parent_name TEXT DEFAULT 'Guardian',
  parent_phone TEXT NOT NULL DEFAULT '',
  parent_email TEXT DEFAULT '',
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
  id TEXT PRIMARY KEY DEFAULT ('staff-' || substr(md5(random()::text), 1, 10)),
  employee_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  department TEXT NOT NULL DEFAULT 'Senior Secondary',
  designation TEXT NOT NULL DEFAULT 'Faculty Member',
  rfid_uid TEXT UNIQUE,
  biometric_id TEXT,
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  attendance_percentage NUMERIC(5, 2) DEFAULT 100.0,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ON_LEAVE')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Operations Employees
CREATE TABLE IF NOT EXISTS public.employees (
  id TEXT PRIMARY KEY DEFAULT ('emp-' || substr(md5(random()::text), 1, 10)),
  employee_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  department TEXT NOT NULL DEFAULT 'Operations & Security',
  designation TEXT NOT NULL DEFAULT 'Operations Specialist',
  shift TEXT DEFAULT 'Morning Gate Shift (07:30 - 15:30)',
  duty_location TEXT DEFAULT 'Main Gate Turnstiles',
  rfid_uid TEXT UNIQUE,
  biometric_id TEXT,
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  attendance_percentage NUMERIC(5, 2) DEFAULT 100.0,
  present_days INT DEFAULT 0,
  total_days INT DEFAULT 0,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ON_LEAVE')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. IoT Devices & Perimeter Turnstiles
CREATE TABLE IF NOT EXISTS public.devices (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  location TEXT NOT NULL,
  status TEXT DEFAULT 'ONLINE',
  ip_address TEXT DEFAULT '192.168.1.100',
  mac_address TEXT DEFAULT 'B8:27:EB:01:A2:FE',
  firmware_version TEXT DEFAULT 'v2.4.1',
  last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
  events_processed INT DEFAULT 0,
  error_count INT DEFAULT 0,
  gateway_id TEXT,
  uptime_hours INT DEFAULT 120,
  signal_strength INT DEFAULT 98,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Attendance Records (Strict Idempotency: One record per person per day)
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id TEXT NOT NULL,
  person_type TEXT NOT NULL CHECK (person_type IN ('STUDENT', 'STAFF', 'EMPLOYEE')),
  person_name TEXT NOT NULL,
  class_or_dept TEXT NOT NULL,
  date DATE NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'LEAVE', 'EXCUSED', 'HOLIDAY', 'WEEKEND', 'VERIFICATION_FAILED', 'MANUALLY_CORRECTED')),
  verification_method TEXT NOT NULL DEFAULT 'RFID_ONLY',
  device_id TEXT,
  location TEXT NOT NULL DEFAULT 'Main Gate Kiosk',
  rfid_uid TEXT,
  is_corrected BOOLEAN DEFAULT FALSE,
  correction_reason TEXT,
  corrected_by TEXT,
  parent_notified BOOLEAN DEFAULT FALSE,
  google_sheets_synced BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_attendance_person_date UNIQUE (person_id, date)
);

-- 7. Provisioned Credentials & System Log
CREATE TABLE IF NOT EXISTS public.credentials (
  id TEXT PRIMARY KEY,
  person_name TEXT NOT NULL,
  person_type TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  temp_password TEXT NOT NULL,
  otp_code TEXT,
  status TEXT DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sync_state (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level TEXT NOT NULL DEFAULT 'INFO',
  source TEXT NOT NULL DEFAULT 'SYNC_ENGINE',
  message TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Seed Default Registered Students (4 Real Users)
INSERT INTO public.students (admission_no, name, class_grade, section, roll_no, rfid_uid, parent_name, parent_phone, parent_email, status)
VALUES
  ('JIT001', 'Jit Das', '12', 'Science', '10', '225DC210', 'Guardian of Jit Das', '9365807527', 'jitdas002.j@gmail.com', 'ACTIVE'),
  ('AN001', 'Annudhyan Nath', '12', 'Science', '1', '7318E719', 'Guardian of Annudhyan Nath', '6001248967', 'nathanudhyan2@gmail.com', 'ACTIVE'),
  ('SA001', 'Saptashwa Saha', '10', 'A', '1', 'B43954FF', 'Guardian of Saptashwa Saha', '+91 94350 33333', 'saptashwa001@gmail.com', 'ACTIVE')
ON CONFLICT (admission_no) DO UPDATE
SET name = EXCLUDED.name,
    class_grade = EXCLUDED.class_grade,
    section = EXCLUDED.section,
    roll_no = EXCLUDED.roll_no,
    rfid_uid = EXCLUDED.rfid_uid,
    parent_phone = EXCLUDED.parent_phone,
    parent_email = EXCLUDED.parent_email;

-- 9. Seed Default Faculty & Staff
INSERT INTO public.staff (employee_id, name, department, designation, rfid_uid, phone, email, status)
VALUES
  ('PVM-STAFF-01', 'Asis Ghosh', 'Senior Secondary', 'Vice Principal & Senior Science Faculty', 'RFID-STF-ASIS', '+91 94350 11111', 'asis.ghosh@pvmlumding.com', 'ACTIVE')
ON CONFLICT (employee_id) DO NOTHING;

-- 10. Disable Row-Level Security for seamless school turnstile operation or grant service_role full access
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Allow service_role full students" ON public.students FOR ALL USING (true);

CREATE POLICY "Allow public read attendance" ON public.attendance FOR SELECT USING (true);
CREATE POLICY "Allow service_role full attendance" ON public.attendance FOR ALL USING (true);

CREATE POLICY "Allow public read staff" ON public.staff FOR SELECT USING (true);
CREATE POLICY "Allow service_role full staff" ON public.staff FOR ALL USING (true);

CREATE POLICY "Allow public read employees" ON public.employees FOR SELECT USING (true);
CREATE POLICY "Allow service_role full employees" ON public.employees FOR ALL USING (true);

CREATE POLICY "Allow public read devices" ON public.devices FOR SELECT USING (true);
CREATE POLICY "Allow service_role full devices" ON public.devices FOR ALL USING (true);

CREATE POLICY "Allow service_role full credentials" ON public.credentials FOR ALL USING (true);
CREATE POLICY "Allow service_role full sync_state" ON public.sync_state FOR ALL USING (true);
