// ===== Database Types =====

export type UserRole = 'teacher' | 'student';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type SubmissionStatus = 'pass' | 'fail' | 'error';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
}

export interface Class {
  id: string;
  teacher_id: string;
  name: string;
  invite_code: string;
  created_at: string;
  // joined fields
  student_count?: number;
  challenge_count?: number;
}

export interface ClassMember {
  id: string;
  class_id: string;
  student_id: string;
  joined_at: string;
}

export interface TestCase {
  input: string;
  expected_output: string;
  description: string;
}

export interface BugChallenge {
  id: string;
  class_id: string;
  teacher_id: string;
  title: string;
  topic: string;
  difficulty: Difficulty;
  buggy_code: string;
  correct_code: string;
  bug_description: string;
  test_cases: TestCase[];
  instructions: string;
  created_at: string;
  // joined fields
  my_status?: 'not_started' | 'attempting' | 'solved';
  my_attempts?: number;
  hints_used_count?: number;
}

export interface Submission {
  id: string;
  challenge_id: string;
  student_id: string;
  submitted_code: string;
  status: SubmissionStatus;
  test_results: TestResult[];
  attempt_number: number;
  submitted_at: string;
}

export interface TestResult {
  test_index: number;
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
  description: string;
}

export interface HintUsed {
  id: string;
  challenge_id: string;
  student_id: string;
  hint_level: 1 | 2 | 3;
  hint_content: string;
  used_at: string;
}

// ===== API Types =====

export interface GenerateChallengesRequest {
  topic: string;
  class_id: string;
}

export interface RunCodeRequest {
  source_code: string;
  challenge_id: string;
}

export interface SubmitCodeRequest {
  submitted_code: string;
}

export interface HintRequest {
  current_code: string;
}

export interface RunCodeResponse {
  overall_status: 'pass' | 'fail' | 'error';
  results: TestResult[];
  stderr: string | null;
}

export interface HintResponse {
  hint_level: number;
  hint_content: string;
  hints_remaining: number;
}

// ===== AI Generation Types =====

export interface AIGeneratedChallenge {
  title: string;
  difficulty: Difficulty;
  buggy_code: string;
  correct_code: string;
  bug_description: string;
  instructions: string;
  test_cases: TestCase[];
}

// ===== Dashboard Types =====

export interface DashboardSummary {
  total_students: number;
  total_challenges: number;
  avg_solve_rate: number;
  avg_attempts: number;
  avg_hints_used: number;
}

export interface ChallengeStats {
  id: string;
  title: string;
  difficulty: Difficulty;
  solved_count: number;
  attempted_count: number;
  not_started_count: number;
  avg_attempts: number;
  avg_hints_used: number;
}

export interface StudentStats {
  id: string;
  name: string;
  solved: number;
  attempted: number;
  total_attempts: number;
  total_hints: number;
  last_activity: string | null;
}
