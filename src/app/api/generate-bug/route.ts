import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { safeParseJSON } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const { topic, level } = await request.json();

    if (!topic || !level) {
      return NextResponse.json(
        { error: "topic과 level은 필수입니다." },
        { status: 400 }
      );
    }

    const levelDescriptions: Record<string, string> = {
      beginner: `초급 버그: 문법 에러, 간단한 오타, 잘못된 변수명, 잘못된 들여쓰기, 빠진 콜론 등.
학생이 Python 기본 문법을 배우는 단계이므로 코드는 간단하고 버그가 명확해야 합니다.`,
      intermediate: `중급 버그: off-by-one 에러, 잘못된 반복문 조건, 잘못된 논리 연산자, 누적 변수 초기화 실수, 잘못된 인덱싱 등.
코드는 동작하지만 잘못된 결과를 출력합니다. 문법적으로는 올바르지만 로직에 문제가 있어야 합니다.`,
      advanced: `고급 버그: 엣지 케이스 미처리, 타입 관련 에러, 알고리즘 오류, 재귀 종료 조건 실수, 가변 기본 인자 문제, 얕은 복사 vs 깊은 복사 등.
코드가 대부분의 경우 동작하지만 특정 입력에서 실패하거나, 미묘한 논리적 결함이 있어야 합니다.`,
    };

    const prompt = `당신은 Python 프로그래밍 교육 전문가입니다. 학생들의 디버깅 능력을 기르기 위한 버그가 포함된 Python 코드를 생성해주세요.

## 주제
${topic}

## 난이도
${levelDescriptions[level] || levelDescriptions.beginner}

## 요구사항
1. 코드는 10~30줄 사이여야 합니다.
2. 주제와 관련된 실용적인 코드여야 합니다.
3. 정확히 1개의 버그만 포함해야 합니다.
4. 코드에는 적절한 한글 주석이 포함되어야 합니다.
5. print()문으로 결과를 출력해야 합니다.
6. 매번 다른 시나리오, 변수명, 숫자, 상황을 사용하세요. 예를 들어 같은 "반복문" 주제라도 구구단, 합계 구하기, 평균 계산, 소수 판별, 별 찍기 등 다양한 상황을 활용하세요.
7. 현재 시각 기반 시드: ${Date.now()}

## 응답 형식
반드시 아래의 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요.

{
  "title": "문제 제목 (한글)",
  "description": "이 코드가 무엇을 해야 하는지 설명 + 현재 어떤 문제가 있는지 힌트 없이 설명 (한글, 2-3문장)",
  "bugType": "버그 유형 (예: syntax_error, off_by_one, logic_error, type_error, edge_case 등)",
  "buggyCode": "버그가 포함된 Python 코드",
  "correctCode": "올바르게 수정된 Python 코드"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "AI 응답을 받지 못했습니다." },
        { status: 500 }
      );
    }

    // 안전한 JSON 파싱 (마크다운 코드 블록 처리 포함)
    try {
      const result = safeParseJSON(content);

      // 필수 필드 검증
      const parsed = result as Record<string, unknown>;
      const requiredFields = ["title", "description", "bugType", "buggyCode", "correctCode"];
      const missingFields = requiredFields.filter((f) => !parsed[f]);
      if (missingFields.length > 0) {
        console.error("AI 응답에 필수 필드 누락:", missingFields, "원본:", content);
        return NextResponse.json(
          { error: `AI 응답에 필수 필드가 누락되었습니다: ${missingFields.join(", ")}. 다시 시도해주세요.` },
          { status: 500 }
        );
      }

      return NextResponse.json(result);
    } catch (parseError) {
      console.error("JSON 파싱 에러:", parseError, "원본:", content);
      return NextResponse.json(
        { error: "AI 응답을 파싱하지 못했습니다. 다시 시도해주세요." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("버그 생성 에러:", error);
    const message = error instanceof Error ? error.message : "알 수 없는 오류";
    // API 키 문제인지 확인
    if (message.includes("429") || message.includes("quota")) {
      return NextResponse.json(
        { error: "API 사용량 초과입니다. 잠시 후 다시 시도해주세요." },
        { status: 429 }
      );
    }
    if (message.includes("401") || message.includes("API key")) {
      return NextResponse.json(
        { error: "API 키가 유효하지 않습니다. 설정을 확인해주세요." },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: "버그 코드 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
