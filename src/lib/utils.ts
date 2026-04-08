// 공통 유틸리티 함수 및 상수

// ===== 상수 =====

export const TOPICS = [
  "변수와 자료형",
  "조건문 (if/else)",
  "반복문 (for/while)",
  "리스트와 튜플",
  "딕셔너리",
  "함수",
  "문자열 처리",
  "파일 입출력",
  "클래스와 객체",
  "예외 처리",
] as const;

export const LEVELS = [
  { value: "beginner" as const, label: "초급", color: "bg-green-500" },
  { value: "intermediate" as const, label: "중급", color: "bg-yellow-500" },
  { value: "advanced" as const, label: "고급", color: "bg-red-500" },
];

export const LEVEL_BADGE: Record<string, { label: string; className: string }> = {
  beginner: { label: "초급", className: "bg-green-100 text-green-700" },
  intermediate: { label: "중급", className: "bg-yellow-100 text-yellow-700" },
  advanced: { label: "고급", className: "bg-red-100 text-red-700" },
};

// ===== 포맷팅 함수 =====

export function formatTime(seconds: number | null): string {
  if (seconds === null || seconds === undefined) return "-";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}분 ${s}초` : `${s}초`;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ===== AI 응답 파싱 =====

/**
 * AI 응답에서 JSON을 안전하게 추출
 * 마크다운 코드 블록(```json ... ```)이 포함되어 있어도 처리
 */
export function safeParseJSON(content: string): unknown {
  // 마크다운 코드 블록 제거
  let cleaned = content.trim();

  // ```json ... ``` 패턴 제거
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1].trim();
  }

  // 앞뒤 불필요한 텍스트 제거 (JSON 배열이나 객체 시작점 찾기)
  const jsonStart = cleaned.search(/[\[{]/);
  const jsonEnd = Math.max(cleaned.lastIndexOf(']'), cleaned.lastIndexOf('}'));
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd >= jsonStart) {
    cleaned = cleaned.slice(jsonStart, jsonEnd + 1);
  }

  return JSON.parse(cleaned);
}
