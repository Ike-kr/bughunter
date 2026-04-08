-- BugHunter 데모용 시드 데이터
-- 강사 대시보드 & 성장 리포트에서 보기 좋은 샘플 데이터

-- 학생 데이터
INSERT INTO students (name, level) VALUES
  ('김민준', 'beginner'),
  ('이서연', 'intermediate'),
  ('박지호', 'advanced'),
  ('정하은', 'beginner'),
  ('최우진', 'intermediate');

-- 세션 데이터
INSERT INTO sessions (topic) VALUES
  ('반복문 (for/while)'),
  ('리스트와 튜플'),
  ('함수');

-- 풀이 기록 (submissions)
-- 김민준 (초급, 성장 중)
INSERT INTO submissions (student_name, topic, level, bug_type, hints_used, solved, time_spent_seconds) VALUES
  ('김민준', '변수와 자료형', 'beginner', 'syntax_error', 3, true, 180),
  ('김민준', '조건문 (if/else)', 'beginner', 'syntax_error', 2, true, 150),
  ('김민준', '반복문 (for/while)', 'beginner', 'off_by_one', 3, false, 300),
  ('김민준', '반복문 (for/while)', 'beginner', 'off_by_one', 2, true, 210);

-- 이서연 (중급, 우수 학생)
INSERT INTO submissions (student_name, topic, level, bug_type, hints_used, solved, time_spent_seconds) VALUES
  ('이서연', '반복문 (for/while)', 'intermediate', 'off_by_one', 1, true, 90),
  ('이서연', '리스트와 튜플', 'intermediate', 'logic_error', 0, true, 75),
  ('이서연', '함수', 'intermediate', 'logic_error', 1, true, 120),
  ('이서연', '딕셔너리', 'intermediate', 'type_error', 2, true, 160);

-- 박지호 (고급, 도전적)
INSERT INTO submissions (student_name, topic, level, bug_type, hints_used, solved, time_spent_seconds) VALUES
  ('박지호', '함수', 'advanced', 'edge_case', 1, true, 110),
  ('박지호', '클래스와 객체', 'advanced', 'logic_error', 0, true, 95),
  ('박지호', '예외 처리', 'advanced', 'edge_case', 2, false, 280),
  ('박지호', '리스트와 튜플', 'advanced', 'edge_case', 1, true, 130);

-- 정하은 (초급, 고전 중 — 강사 주목 대상)
INSERT INTO submissions (student_name, topic, level, bug_type, hints_used, solved, time_spent_seconds) VALUES
  ('정하은', '변수와 자료형', 'beginner', 'syntax_error', 3, false, 300),
  ('정하은', '변수와 자료형', 'beginner', 'syntax_error', 3, true, 270),
  ('정하은', '조건문 (if/else)', 'beginner', 'syntax_error', 3, false, 290);

-- 최우진 (중급, 꾸준한 성장)
INSERT INTO submissions (student_name, topic, level, bug_type, hints_used, solved, time_spent_seconds) VALUES
  ('최우진', '반복문 (for/while)', 'intermediate', 'off_by_one', 2, true, 140),
  ('최우진', '문자열 처리', 'intermediate', 'logic_error', 1, true, 100),
  ('최우진', '함수', 'intermediate', 'type_error', 2, false, 240),
  ('최우진', '딕셔너리', 'intermediate', 'logic_error', 1, true, 115);
