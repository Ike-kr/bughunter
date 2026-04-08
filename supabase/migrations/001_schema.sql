-- BugHunter DB 스키마
-- Supabase SQL Editor에서 실행

-- 1. users 테이블 (Supabase Auth 확장)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('teacher', 'student')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. classes 테이블 (반)
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. class_members 테이블 (반 소속)
CREATE TABLE IF NOT EXISTS public.class_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(class_id, student_id)
);

-- 4. bug_challenges 테이블 (버그 챌린지)
CREATE TABLE IF NOT EXISTS public.bug_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  buggy_code TEXT NOT NULL,
  correct_code TEXT NOT NULL,
  bug_description TEXT NOT NULL DEFAULT '',
  bug_type TEXT DEFAULT '',
  test_cases JSONB DEFAULT '[]'::jsonb,
  instructions TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. submissions 테이블 (학생 제출)
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.bug_challenges(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  submitted_code TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pass', 'fail', 'error')),
  feedback TEXT DEFAULT '',
  test_results JSONB DEFAULT '[]'::jsonb,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  submitted_at TIMESTAMPTZ DEFAULT now()
);

-- 6. hints_used 테이블 (힌트 사용 기록)
CREATE TABLE IF NOT EXISTS public.hints_used (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.bug_challenges(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  hint_level INTEGER NOT NULL CHECK (hint_level IN (1, 2, 3)),
  hint_content TEXT NOT NULL,
  used_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(challenge_id, student_id, hint_level)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_classes_teacher ON public.classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classes_invite ON public.classes(invite_code);
CREATE INDEX IF NOT EXISTS idx_class_members_class ON public.class_members(class_id);
CREATE INDEX IF NOT EXISTS idx_class_members_student ON public.class_members(student_id);
CREATE INDEX IF NOT EXISTS idx_challenges_class ON public.bug_challenges(class_id);
CREATE INDEX IF NOT EXISTS idx_submissions_challenge ON public.submissions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON public.submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_hints_challenge ON public.hints_used(challenge_id);
CREATE INDEX IF NOT EXISTS idx_hints_student ON public.hints_used(student_id);

-- RLS 활성화
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bug_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hints_used ENABLE ROW LEVEL SECURITY;

-- RLS 정책: users
CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- RLS 정책: classes
CREATE POLICY "Teachers can CRUD own classes" ON public.classes
  FOR ALL USING (auth.uid() = teacher_id);
CREATE POLICY "Students can read joined classes" ON public.classes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.class_members
      WHERE class_id = classes.id AND student_id = auth.uid()
    )
  );
-- 초대코드로 반 조회 (가입 전)
CREATE POLICY "Anyone can find class by invite code" ON public.classes
  FOR SELECT USING (true);

-- RLS 정책: class_members
CREATE POLICY "Teachers can read own class members" ON public.class_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.classes
      WHERE id = class_members.class_id AND teacher_id = auth.uid()
    )
  );
CREATE POLICY "Students can manage own membership" ON public.class_members
  FOR ALL USING (auth.uid() = student_id);

-- RLS 정책: bug_challenges
CREATE POLICY "Teachers can CRUD own challenges" ON public.bug_challenges
  FOR ALL USING (auth.uid() = teacher_id);
CREATE POLICY "Students can read challenges in their class" ON public.bug_challenges
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.class_members
      WHERE class_id = bug_challenges.class_id AND student_id = auth.uid()
    )
  );
-- class_id가 NULL인 챌린지 (게스트 모드)는 누구나 조회 가능
CREATE POLICY "Anyone can read guest challenges" ON public.bug_challenges
  FOR SELECT USING (class_id IS NULL);

-- RLS 정책: submissions
CREATE POLICY "Students can CRUD own submissions" ON public.submissions
  FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "Teachers can read submissions in their class" ON public.submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bug_challenges bc
      JOIN public.classes c ON c.id = bc.class_id
      WHERE bc.id = submissions.challenge_id AND c.teacher_id = auth.uid()
    )
  );

-- RLS 정책: hints_used
CREATE POLICY "Students can CRUD own hints" ON public.hints_used
  FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "Teachers can read hints in their class" ON public.hints_used
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bug_challenges bc
      JOIN public.classes c ON c.id = bc.class_id
      WHERE bc.id = hints_used.challenge_id AND c.teacher_id = auth.uid()
    )
  );

-- 회원가입 시 자동으로 public.users에 프로필 생성하는 트리거
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 연결
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
