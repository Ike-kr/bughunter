"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

interface Submission {
  id: string;
  student_name: string;
  topic: string;
  level: string;
  bug_type: string | null;
  hints_used: number;
  solved: boolean;
  time_spent_seconds: number | null;
  created_at: string;
}

interface TopicStats {
  topic: string;
  total: number;
  solved: number;
  solveRate: number;
  avgHints: number;
}

// Level definitions mapped to topics
const SKILL_LEVELS = [
  { level: 1, label: "변수/출력", topics: ["변수와 자료형"], color: "from-green-400 to-green-500" },
  { level: 2, label: "조건문", topics: ["조건문 (if/else)"], color: "from-blue-400 to-blue-500" },
  { level: 3, label: "반복문", topics: ["반복문 (for/while)"], color: "from-yellow-400 to-yellow-500" },
  { level: 4, label: "함수", topics: ["함수", "문자열 처리", "리스트와 튜플", "딕셔너리"], color: "from-orange-400 to-orange-500" },
  { level: 5, label: "클래스", topics: ["클래스와 객체", "예외 처리", "파일 입출력"], color: "from-red-400 to-red-500" },
];

function formatTime(seconds: number | null): string {
  if (seconds === null || seconds === undefined) return "-";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}분 ${s}초` : `${s}초`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ReportPage() {
  const [studentName, setStudentName] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const fetchReport = useCallback(async () => {
    if (!studentName.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const { data, error: fetchError } = await supabase
        .from("submissions")
        .select("*")
        .eq("student_name", studentName.trim())
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setSubmissions(data || []);
    } catch (err) {
      console.error("리포트 조회 실패:", err);
      setError("데이터를 불러오는데 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }, [studentName]);

  // Summary stats
  const totalSubmissions = submissions.length;
  const solvedCount = submissions.filter((s) => s.solved).length;
  const solveRate = totalSubmissions > 0 ? Math.round((solvedCount / totalSubmissions) * 100) : 0;
  const avgHints =
    totalSubmissions > 0
      ? (submissions.reduce((sum, s) => sum + s.hints_used, 0) / totalSubmissions).toFixed(1)
      : "0";
  const timeSubs = submissions.filter((s) => s.time_spent_seconds !== null);
  const avgTime =
    timeSubs.length > 0
      ? Math.round(timeSubs.reduce((sum, s) => sum + (s.time_spent_seconds || 0), 0) / timeSubs.length)
      : null;

  // Topic breakdown
  const topicMap = new Map<string, { total: number; solved: number; hints: number }>();
  submissions.forEach((s) => {
    const existing = topicMap.get(s.topic) || { total: 0, solved: 0, hints: 0 };
    existing.total++;
    if (s.solved) existing.solved++;
    existing.hints += s.hints_used;
    topicMap.set(s.topic, existing);
  });
  const topicStats: TopicStats[] = Array.from(topicMap.entries())
    .map(([topic, stats]) => ({
      topic,
      total: stats.total,
      solved: stats.solved,
      solveRate: Math.round((stats.solved / stats.total) * 100),
      avgHints: parseFloat((stats.hints / stats.total).toFixed(1)),
    }))
    .sort((a, b) => b.total - a.total);

  // Level progress: determine which levels are "cleared" (>= 1 solved in that level's topics)
  const solvedTopics = new Set(
    submissions.filter((s) => s.solved).map((s) => s.topic)
  );
  const currentLevelIndex = SKILL_LEVELS.reduce((maxIdx, lvl, idx) => {
    const cleared = lvl.topics.some((t) => solvedTopics.has(t));
    return cleared ? idx : maxIdx;
  }, -1);

  // Recent 10 submissions
  const recentSubmissions = submissions.slice(0, 10);

  // Growth message
  const getGrowthMessage = () => {
    if (totalSubmissions === 0) return null;
    if (solveRate > 80) return { text: "대단해요! 디버깅 실력이 빠르게 성장하고 있어요!", emoji: "🔥", bg: "bg-orange-50 border-orange-200 text-orange-800" };
    if (solveRate >= 50) return { text: "좋은 페이스예요! 꾸준히 하면 금방 고급자가 될 거예요!", emoji: "💪", bg: "bg-blue-50 border-blue-200 text-blue-800" };
    return { text: "포기하지 마세요! 디버깅은 연습할수록 늘어요! 힌트를 적극 활용해보세요", emoji: "🌱", bg: "bg-green-50 border-green-200 text-green-800" };
  };

  const growthMessage = getGrowthMessage();

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <span className="text-2xl">🐛</span>
            <h1 className="text-xl font-bold text-white">
              BugHunter 성장 리포트
            </h1>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-blue-200 hover:text-white hover:underline transition-colors">
            홈
          </Link>
          <Link href="/practice" className="text-sm text-blue-200 hover:text-white hover:underline transition-colors">
            연습 모드
          </Link>
          <Link href="/teacher" className="text-sm text-blue-200 hover:text-white hover:underline transition-colors">
            강사 모드
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Student Name Input */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="text-lg font-bold text-zinc-900 mb-4">학생 성장 리포트</h2>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="학생 이름을 입력하세요"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") fetchReport(); }}
              className="flex-1 max-w-xs rounded-lg border border-zinc-300 px-4 py-2.5 text-sm bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={fetchReport}
              disabled={loading || !studentName.trim()}
              className="px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "조회 중..." : "리포트 보기"}
            </button>
          </div>
          {error && (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          )}
        </div>

        {searched && !loading && submissions.length === 0 && (
          <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🔍</span>
            </div>
            <p className="text-lg font-semibold text-zinc-700 mb-2">
              &ldquo;{studentName}&rdquo; 학생의 기록이 없습니다
            </p>
            <p className="text-sm text-zinc-400">
              연습 모드에서 이름을 입력하고 문제를 풀면 기록이 저장됩니다.
            </p>
          </div>
        )}

        {submissions.length > 0 && (
          <>
            {/* Growth Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <SummaryCard
                title="총 풀이 수"
                value={String(totalSubmissions)}
                unit="문제"
                colorClass="text-blue-700"
              />
              <SummaryCard
                title="해결률"
                value={String(solveRate)}
                unit="%"
                colorClass="text-green-700"
              />
              <SummaryCard
                title="평균 힌트 사용"
                value={avgHints}
                unit="회"
                colorClass="text-purple-700"
              />
              <SummaryCard
                title="평균 소요 시간"
                value={avgTime !== null ? formatTime(avgTime) : "-"}
                unit=""
                colorClass="text-orange-700"
              />
            </div>

            {/* Level Progress Visualization */}
            <div className="bg-white rounded-xl border border-zinc-200 p-6">
              <h2 className="text-lg font-bold text-zinc-900 mb-6">레벨 진행도</h2>
              <div className="flex items-center gap-0">
                {SKILL_LEVELS.map((lvl, idx) => {
                  const cleared = lvl.topics.some((t) => solvedTopics.has(t));
                  const isCurrent = idx === currentLevelIndex;

                  return (
                    <div key={lvl.level} className="flex items-center flex-1 min-w-0">
                      {/* Node */}
                      <div className="flex flex-col items-center relative z-10">
                        <div
                          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-sm font-bold transition-all shrink-0 ${
                            cleared
                              ? `bg-gradient-to-br ${lvl.color} text-white shadow-lg ${isCurrent ? "ring-4 ring-blue-200 scale-110" : ""}`
                              : "bg-zinc-100 text-zinc-400 border-2 border-zinc-200"
                          }`}
                        >
                          Lv.{lvl.level}
                        </div>
                        <span
                          className={`text-xs mt-2 font-medium text-center ${
                            cleared ? "text-zinc-800" : "text-zinc-400"
                          }`}
                        >
                          {lvl.label}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] mt-0.5 text-blue-600 font-semibold">현재</span>
                        )}
                      </div>

                      {/* Connector */}
                      {idx < SKILL_LEVELS.length - 1 && (
                        <div className="flex-1 mx-1 sm:mx-2">
                          <div
                            className={`h-1.5 rounded-full transition-all ${
                              cleared && SKILL_LEVELS[idx + 1].topics.some((t) => solvedTopics.has(t))
                                ? "bg-gradient-to-r from-green-400 to-green-500"
                                : cleared
                                  ? "bg-gradient-to-r from-green-400 to-zinc-200"
                                  : "bg-zinc-200"
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Topic Breakdown */}
            {topicStats.length > 0 && (
              <div className="bg-white rounded-xl border border-zinc-200 p-6">
                <h2 className="text-lg font-bold text-zinc-900 mb-4">주제별 분석</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200 text-left text-zinc-500">
                        <th className="px-4 py-3 font-medium">주제</th>
                        <th className="px-4 py-3 font-medium text-center">풀이 수</th>
                        <th className="px-4 py-3 font-medium text-center">해결률</th>
                        <th className="px-4 py-3 font-medium text-center">평균 힌트</th>
                        <th className="px-4 py-3 font-medium text-center">평가</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {topicStats.map((stat) => (
                        <tr key={stat.topic} className="hover:bg-zinc-50 transition-colors">
                          <td className="px-4 py-3 font-medium text-zinc-900">
                            {stat.topic}
                          </td>
                          <td className="px-4 py-3 text-center text-zinc-600">
                            {stat.total}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-16 bg-zinc-100 rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    stat.solveRate >= 70
                                      ? "bg-green-500"
                                      : stat.solveRate >= 40
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
                                  }`}
                                  style={{ width: `${Math.max(stat.solveRate, 4)}%` }}
                                />
                              </div>
                              <span className="text-zinc-600">{stat.solveRate}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center text-zinc-600">
                            {stat.avgHints}회
                          </td>
                          <td className="px-4 py-3 text-center">
                            {stat.solveRate >= 70 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                                강점 💪
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
                                보완 필요 📝
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Recent Activity Timeline */}
            <div className="bg-white rounded-xl border border-zinc-200 p-6">
              <h2 className="text-lg font-bold text-zinc-900 mb-4">최근 활동</h2>
              <div className="space-y-3">
                {recentSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${
                      sub.solved
                        ? "bg-green-50/50 border-green-200"
                        : "bg-red-50/50 border-red-200"
                    }`}
                  >
                    {/* Status indicator */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${
                        sub.solved
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {sub.solved ? "O" : "X"}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-zinc-900">{sub.topic}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            sub.level === "beginner"
                              ? "bg-green-100 text-green-700"
                              : sub.level === "intermediate"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {sub.level === "beginner" ? "초급" : sub.level === "intermediate" ? "중급" : "고급"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-zinc-400">
                        <span>힌트 {sub.hints_used}회</span>
                        <span>{formatTime(sub.time_spent_seconds)}</span>
                      </div>
                    </div>

                    {/* Date */}
                    <span className="text-xs text-zinc-400 shrink-0">
                      {formatDate(sub.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Growth Message */}
            {growthMessage && (
              <div className={`rounded-xl border p-6 text-center ${growthMessage.bg}`}>
                <span className="text-4xl block mb-3">{growthMessage.emoji}</span>
                <p className="text-lg font-semibold">{growthMessage.text}</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  unit,
  colorClass,
}: {
  title: string;
  value: string;
  unit: string;
  colorClass: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5">
      <p className="text-sm text-zinc-500 mb-1">{title}</p>
      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-bold ${colorClass}`}>{value}</span>
        {unit && <span className="text-sm text-zinc-400">{unit}</span>}
      </div>
    </div>
  );
}
