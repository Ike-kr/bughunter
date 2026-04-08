import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

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
