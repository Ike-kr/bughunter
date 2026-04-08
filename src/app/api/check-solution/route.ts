import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { safeParseJSON } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const { studentCode, correctCode, buggyCode, executionMatch } = await request.json();

    if (!studentCode || !correctCode || !buggyCode) {
      return NextResponse.json(
        { error: "studentCode, correctCode, buggyCode는 필수입니다." },
        { status: 400 }
      );
    }

    // 1차 검증: 클라이언트에서 보낸 실행 결과 비교 (있는 경우)
    // executionMatch: 학생 코드와 정답 코드의 실행 출력이 동일한지 여부
    if (executionMatch === true) {
      // 실행 결과가 일치하면 높은 확률로 정답
      // AI에게 최종 확인만 요청 (더 빠르고 정확)
      const quickPrompt = `학생이 버그를 수정한 코드와 정답 코드의 실행 결과가 동일합니다. 코드를 간단히 확인해주세요.

## 원본 버그 코드
\`\`\`python
${buggyCode}
\`\`\`

## 정답 코드
\`\`\`python
${correctCode}
\`\`\`

## 학생의 수정 코드
\`\`\`python
${studentCode}
\`\`\`

실행 결과가 동일하므로 핵심 버그가 수정되었는지만 확인해주세요.
반드시 아래 JSON 형식으로만 응답하세요:
{
  "correct": true 또는 false,
  "feedback": "학생에게 전달할 피드백 (한글, 2-3문장)"
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: quickPrompt }],
        temperature: 0.2,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        try {
          return NextResponse.json(safeParseJSON(content));
        } catch {
          // 파싱 실패 시 실행 결과 기반으로 정답 처리
          return NextResponse.json({
            correct: true,
            feedback: "코드 실행 결과가 정답과 일치합니다. 잘 수정했어요! 🎉"
          });
        }
      }
    }

    // 2차 검증: AI 기반 전체 분석
    const prompt = `당신은 Python 프로그래밍 채점 전문가입니다. 학생이 버그가 있는 코드를 수정했습니다. 학생의 수정이 올바른지 판단해주세요.

## 원본 버그 코드
\`\`\`python
${buggyCode}
\`\`\`

## 정답 코드
\`\`\`python
${correctCode}
\`\`\`

## 학생의 수정 코드
\`\`\`python
${studentCode}
\`\`\`

## 채점 기준
1. 학생의 코드가 정답 코드와 완전히 동일할 필요는 없습니다.
2. 핵심 버그가 올바르게 수정되었는지가 중요합니다.
3. 변수명이 다르거나 코드 스타일이 다른 것은 허용합니다.
4. 같은 결과를 내는 다른 방법으로 수정한 것도 정답으로 인정합니다.
5. 새로운 버그를 만들지 않았는지 확인합니다.

## 응답 형식
반드시 아래 JSON 형식으로만 응답하세요:
{
  "correct": true 또는 false,
  "feedback": "학생에게 전달할 피드백 (한글, 2-3문장). 맞았으면 칭찬과 함께 어떤 버그를 잘 찾았는지 설명. 틀렸으면 아직 남아있는 문제가 무엇인지 간단히 알려주세요."
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "AI 응답을 받지 못했습니다." },
        { status: 500 }
      );
    }

    try {
      const result = safeParseJSON(content);
      return NextResponse.json(result);
    } catch (parseError) {
      console.error("채점 JSON 파싱 에러:", parseError, "원본:", content);
      return NextResponse.json(
        { error: "채점 결과를 파싱하지 못했습니다. 다시 시도해주세요." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("채점 에러:", error);
    const message = error instanceof Error ? error.message : "알 수 없는 오류";
    if (message.includes("429") || message.includes("quota")) {
      return NextResponse.json(
        { error: "API 사용량 초과입니다. 잠시 후 다시 시도해주세요." },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: "채점 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
