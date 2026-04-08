-- BugHunter DB Schema for Supabase
-- Supabase SQL Editor에서 실행하세요.

-- Students table
create table students (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  level text default 'beginner', -- beginner, intermediate, advanced
  created_at timestamp with time zone default now()
);

-- Sessions table (teacher creates a debugging session)
create table sessions (
  id uuid default gen_random_uuid() primary key,
  topic text not null,
  created_at timestamp with time zone default now()
);

-- Submissions table (student attempts)
create table submissions (
  id uuid default gen_random_uuid() primary key,
  student_name text not null,
  session_id uuid references sessions(id),
  topic text not null,
  level text not null,
  bug_type text,
  hints_used integer default 0,
  solved boolean default false,
  time_spent_seconds integer,
  created_at timestamp with time zone default now()
);

-- RLS 비활성화 (MVP 단계에서는 인증 없이 사용)
alter table students enable row level security;
alter table sessions enable row level security;
alter table submissions enable row level security;

-- 모든 사용자에게 읽기/쓰기 허용 (MVP용, 프로덕션에서는 수정 필요)
create policy "Allow all access to students" on students for all using (true) with check (true);
create policy "Allow all access to sessions" on sessions for all using (true) with check (true);
create policy "Allow all access to submissions" on submissions for all using (true) with check (true);
