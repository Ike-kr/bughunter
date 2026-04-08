import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { studentName, topic, level, bugType, hintsUsed, solved, timeSpentSeconds } =
      await request.json();

    if (!studentName || !topic || !level) {
      return NextResponse.json(
        { error: "studentName, topic, level은 필수입니다." },
        { status: 400 }
      );
    }

    // 서버에서는 Admin 클라이언트 사용 (RLS 우회)
    const supabase = createAdminClient();

    const { data, error } = await supabase.from("submissions").insert({
      student_name: studentName,
      topic,
      level,
      bug_type: bugType || null,
      hints_used: hintsUsed ?? 0,
      solved: solved ?? false,
      time_spent_seconds: timeSpentSeconds ?? null,
    }).select().single();

    if (error) {
      console.error("Supabase insert error:", error);
      // 테이블이 없는 경우
      if (error.code === '42P01') {
        return NextResponse.json(
          { error: "DB 테이블이 아직 생성되지 않았습니다." },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: "제출 저장에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, submission: data });
  } catch (error) {
    console.error("제출 처리 에러:", error);
    return NextResponse.json(
      { error: "제출 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
