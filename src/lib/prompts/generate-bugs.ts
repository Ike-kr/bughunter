// AI 버그 챌린지 생성 프롬프트

export function buildBugGenerationPrompt(topic: string): string {
  return `너는 프로그래밍 교육 전문가이자 Python 코드 버그 생성기야.
학생들이 디버깅 능력을 훈련할 수 있도록, 의도적으로 버그가 포함된 Python 코드를 만들어줘.

## 요청
주제: "${topic}"
언어: Python

## 규칙
1. 3개의 난이도별(beginner, intermediate, advanced) 버그 챌린지를 만들어.
2. 각 챌린지에는 정확히 **버그 1개**만 포함해. 여러 개 넣지 마.
3. 버그는 학생들이 실제로 자주 하는 실수여야 해:
   - beginner: 문법 오류, 인덱스 오류, 타입 오류 등 명확한 에러
   - intermediate: 로직 오류 (무한루프, off-by-one, 조건 반전 등) — 실행은 되지만 결과가 틀림
   - advanced: 엣지케이스 미처리, 비효율적 알고리즘, 미묘한 로직 버그
4. 정답 코드(correct_code)는 반드시 모든 테스트케이스를 통과해야 해.
5. 테스트케이스는 최소 3개, 다양한 입력을 커버해.
6. instructions는 학생에게 보여줄 문제 설명이야. 버그의 위치나 종류를 직접 알려주지 마.
7. 코드는 함수 형태로 작성해. 메인 함수 이름은 명확하게.

## JSON 응답 형식 (반드시 이 형식으로만 응답해)
\`\`\`json
[
  {
    "title": "챌린지 제목 (한국어)",
    "difficulty": "beginner",
    "buggy_code": "def example(...):\\n    ...",
    "correct_code": "def example(...):\\n    ...",
    "bug_description": "강사용 버그 설명 (한국어)",
    "instructions": "학생용 문제 설명 (한국어). 이 함수가 무엇을 하는 함수인지, 어떤 문제가 있는지 설명. 버그 위치는 알려주지 않음.",
    "test_cases": [
      {"input": "example([3,1,2])", "expected_output": "[1, 2, 3]", "description": "기본 테스트"}
    ]
  },
  {
    "title": "...",
    "difficulty": "intermediate",
    ...
  },
  {
    "title": "...",
    "difficulty": "advanced",
    ...
  }
]
\`\`\`

JSON 배열만 응답해. 다른 텍스트 없이.`;
}
