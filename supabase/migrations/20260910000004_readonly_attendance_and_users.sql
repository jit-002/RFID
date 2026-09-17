-- ====================================================================
-- SmartAttend — Migration 20260910000004
-- Read-Only Google Sheets Architecture & Supabase User / Duplicate Guard
-- ====================================================================

-- 1. Enforce Unique Constraint on Attendance (Date + Person ID)
-- Guarantees that duplicate RFID scans on the same date cannot create duplicate rows
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_attendance_date_person'
  ) THEN
    ALTER TABLE public.attendance 
      ADD CONSTRAINT unique_attendance_date_person UNIQUE (date, person_id);
  END IF;
END $$;

-- 2. Index for Rapid RFID Lookup on Active Students
CREATE INDEX IF NOT EXISTS idx_students_rfid_active 
  ON public.students (rfid_uid) 
  WHERE status = 'ACTIVE';

-- 3. Index for Attendance Date Queries & Live Feed
CREATE INDEX IF NOT EXISTS idx_attendance_date_timestamp 
  ON public.attendance (date, timestamp DESC);

-- 4. Ensure RLS policies allow authenticated and anonymous read/write where required
CREATE POLICY "Allow read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow manage students" ON public.students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow manage attendance" ON public.attendance FOR ALL USING (true) WITH CHECK (true);
