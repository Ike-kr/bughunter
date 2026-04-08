import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const { buggyCode, studentCode, correctCode, hintLevel } =
      await request.json();

    if (!buggyCode || !correctCode || !hintLevel) {
      return NextResponse.json(
        { error: "buggyCode, correctCode, hintLevel은 필수입니다." },
        { status: 400 }
      );
    }

    const hintDescriptions: Record<number, string> = {
      1: `1단계 힌트 (방향 제시):
- 버그의 정확한 위치나 정답을 알려주지 마세요.
- "어떤 종류의 문제가 있는지" 방향만 제시하세요.
- 예시: "반복문이 몇 번 실행되는지 확인해봐", "변수의 초기값을 확인해봐"
- 1~2문장으로 짧게 작성하세요.`,
      2: `2단계 힌트 (범위 좁히기):
- 버그가 있는 대략적인 위치(몇 번째 줄 근처)를 알려주세요.
- 정확한 답을 알려주지는 마세요.
- 예시: "5번째 줄의 range 조건을 확인해봐", "리스트에 값을 추가하는 부분을 다시 봐봐"
- 1~2문장으로 작성하세요.`,
      3: `3단계 힌트 (거의 답):
- 버그의 정확한 위치와 무엇이 잘못되었는지 구체적으로 설명하세요.
- 어떻게 고쳐야 하는지 방향을 명확히 제시하되, 코드 자체를 직접 작성해주지는 마세요.
- 예시: "range(1,10)은 9까지만 반복해. 10을 포함하려면 어떻게 해야 할까?"
- 2~3문장으로 작성하세요.`,
    };

    const prompt = `당신은 친절한 Python 프로그래밍 튜터입니다. 학생이 디버깅 문제를 풀고 있습니다.

## 버그가 있는 원본 코드
\`\`\`python
${buggyCode}
\`\`\`

## 학생이 현재 작성한 코드
\`\`\`python
${studentCode || buggyCode}
\`\`\`

## 정답 코드
\`\`\`python
${correctCode}
\`\`\`

## 힌트 수준
${hintDescriptions[hintLevel] || hintDescriptions[1]}

## 요구사항
- 한글로 작성하세요.
- 학생의 현재 코드 상태를 고려하여 힌트를 제공하세요.
- 학생이 이미 일부 수정한 경우 그 점을 인정하고 남은 문제에 대해 힌트를 주세요.
- 따뜻하고 격려하는 톤으로 작성하세요.

반드시 아래 JSON 형식으로만 응답하세요:
{ "hint": "힌트 내용" }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "AI 응답을 받지 못했습니다." },
        { status: 500 }
      );
    }

    const result = JSON.parse(content);
    return NextResponse.json(result);
  } catch (error) {
    console.error("힌트 생성 에러:", error);
    return NextResponse.json(
      { error: "힌트 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
