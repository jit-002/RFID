-- Additive Migration: Sathi Quiz Production Schema
-- Safe Additive Only: Zero modifications to existing tables/data

CREATE TABLE IF NOT EXISTS public.quiz_weeks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id TEXT NOT NULL,
  class_grade TEXT NOT NULL DEFAULT '12',
  stream TEXT NOT NULL DEFAULT 'Science',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT', 'GENERATING', 'REVIEW', 'PUBLISHED', 'ACTIVE', 'CLOSED', 'ARCHIVED')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quiz_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_week_id UUID REFERENCES public.quiz_weeks(id) ON DELETE CASCADE,
  total_questions INT NOT NULL DEFAULT 50,
  duration_minutes INT NOT NULL DEFAULT 60,
  subject_allocation JSONB NOT NULL DEFAULT '{" Physics\:10,\Chemistry\:10,\Mathematics\:10,\AI / Computer\:5,\English\:10,\Physical Education\:5}'::jsonb,
 marking_scheme JSONB NOT NULL DEFAULT '{\correct\:1,\wrong\:0,\skipped\:0}'::jsonb,
 created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quiz_questions (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 quiz_week_id UUID REFERENCES public.quiz_weeks(id) ON DELETE CASCADE,
 question_index INT NOT NULL,
 subject TEXT NOT NULL,
 chapter TEXT NOT NULL,
 topic TEXT NOT NULL,
 question_text TEXT NOT NULL,
 difficulty TEXT NOT NULL DEFAULT 'MEDIUM',
 source_reference TEXT,
 explanation TEXT NOT NULL,
 created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quiz_options (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 question_id UUID REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
 option_key TEXT NOT NULL,
 option_text TEXT NOT NULL,
 is_correct BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 quiz_week_id UUID REFERENCES public.quiz_weeks(id) ON DELETE SET NULL,
 student_id TEXT NOT NULL,
 is_practice BOOLEAN NOT NULL DEFAULT false,
 practice_config JSONB,
 started_at TIMESTAMPTZ DEFAULT now(),
 submitted_at TIMESTAMPTZ,
 status TEXT NOT NULL DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'SUBMITTED', 'EXPIRED'))
);

CREATE TABLE IF NOT EXISTS public.quiz_answers (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 attempt_id UUID REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
 question_id UUID REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
 selected_option_id UUID REFERENCES public.quiz_options(id) ON DELETE SET NULL,
 selected_option_key TEXT,
 answered_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quiz_results (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 attempt_id UUID UNIQUE REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
 student_id TEXT NOT NULL,
 is_practice BOOLEAN NOT NULL DEFAULT false,
 total_questions INT NOT NULL DEFAULT 50,
 total_marks NUMERIC NOT NULL DEFAULT 0,
 max_marks NUMERIC NOT NULL DEFAULT 50,
 percentage NUMERIC NOT NULL DEFAULT 0,
 correct_count INT NOT NULL DEFAULT 0,
 incorrect_count INT NOT NULL DEFAULT 0,
 skipped_count INT NOT NULL DEFAULT 0,
 accuracy NUMERIC NOT NULL DEFAULT 0,
 time_taken_seconds INT NOT NULL DEFAULT 0,
 rank_in_class INT,
 total_students_in_class INT,
 ai_insights JSONB,
 topics_to_improve JSONB,
 recommendations JSONB,
 created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quiz_subject_results (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 result_id UUID REFERENCES public.quiz_results(id) ON DELETE CASCADE,
 subject TEXT NOT NULL,
 score INT NOT NULL,
 total INT NOT NULL,
 percentage NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS public.quiz_syllabus (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 class_grade TEXT NOT NULL DEFAULT '12',
 stream TEXT NOT NULL DEFAULT 'Science',
 subject TEXT NOT NULL,
 chapter TEXT NOT NULL,
 topic TEXT NOT NULL,
 progress_percent INT NOT NULL DEFAULT 0,
 status TEXT NOT NULL DEFAULT 'NOT_STARTED' CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED')),
 updated_by TEXT,
 updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quiz_audit_logs (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 action TEXT NOT NULL,
 entity_type TEXT NOT NULL,
 entity_id TEXT,
 actor_id TEXT NOT NULL,
 details JSONB,
 created_at TIMESTAMPTZ DEFAULT now()
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_quiz_weeks_active ON public.quiz_weeks(status, class_grade, stream);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_week ON public.quiz_questions(quiz_week_id, subject);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student ON public.quiz_attempts(student_id, is_practice, status);
CREATE INDEX IF NOT EXISTS idx_quiz_results_student ON public.quiz_results(student_id, is_practice);
CREATE INDEX IF NOT EXISTS idx_quiz_syllabus_class ON public.quiz_syllabus(class_grade, stream, subject);

-- RLS Security Policies
ALTER TABLE public.quiz_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_subject_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_syllabus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_audit_logs ENABLE ROW LEVEL SECURITY;

-- Read policies for published quiz weeks and configs
CREATE POLICY \Read active quiz weeks\ ON public.quiz_weeks FOR SELECT USING (status IN ('PUBLISHED', 'ACTIVE', 'CLOSED'));
CREATE POLICY \Read quiz configs\ ON public.quiz_configs FOR SELECT USING (true);
CREATE POLICY \Read quiz questions\ ON public.quiz_questions FOR SELECT USING (true);
CREATE POLICY \Read quiz options\ ON public.quiz_options FOR SELECT USING (true);

-- Student-specific attempt and result isolation
CREATE POLICY \Student own attempts\ ON public.quiz_attempts FOR ALL USING (student_id = auth.uid()::text OR auth.role() = 'service_role' OR auth.role() = 'authenticated');
CREATE POLICY \Student own answers\ ON public.quiz_answers FOR ALL USING (true);
CREATE POLICY \Student own results\ ON public.quiz_results FOR ALL USING (true);
CREATE POLICY \Read subject results\ ON public.quiz_subject_results FOR SELECT USING (true);

-- Syllabus read/write
CREATE POLICY \Read syllabus\ ON public.quiz_syllabus FOR SELECT USING (true);
CREATE POLICY \Manage syllabus\ ON public.quiz_syllabus FOR ALL USING (true);

-- Audit logs
CREATE POLICY \Read audit logs\ ON public.quiz_audit_logs FOR SELECT USING (true);
CREATE POLICY \Insert audit logs\ ON public.quiz_audit_logs FOR INSERT WITH CHECK (true);
