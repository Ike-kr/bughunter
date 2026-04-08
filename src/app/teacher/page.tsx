"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { LEVEL_BADGE, formatTime, formatDate } from "@/lib/utils";

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

interface BugTypeStats {
  bugType: string;
  total: number;
  solved: number;
  solveRate: number;
}

export default function TeacherDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setSubmissions(data || []);
    } catch (err) {
      console.error("데이터 조회 실패:", err);
      setError("데이터를 불러오는데 실패했습니다. Supabase 연결을 확인해주세요.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Summary calculations
  const uniqueStudents = new Set(submissions.map((s) => s.student_name)).size;
  const totalSubmissions = submissions.length;
  const solvedCount = submissions.filter((s) => s.solved).length;
  const avgSolveRate =
    totalSubmissions > 0
      ? Math.round((solvedCount / totalSubmissions) * 100)
      : 0;
  const avgHints =
    totalSubmissions > 0
      ? (
          submissions.reduce((sum, s) => sum + s.hints_used, 0) /
          totalSubmissions
        ).toFixed(1)
      : "0";

  // Bug type analysis
  const bugTypeMap = new Map<string, { total: number; solved: number }>();
  submissions.forEach((s) => {
    const type = s.bug_type || "unknown";
    const existing = bugTypeMap.get(type) || { total: 0, solved: 0 };
    existing.total++;
    if (s.solved) existing.solved++;
    bugTypeMap.set(type, existing);
  });
  const bugTypeStats: BugTypeStats[] = Array.from(bugTypeMap.entries())
    .map(([bugType, stats]) => ({
      bugType,
      total: stats.total,
      solved: stats.solved,
      solveRate: Math.round((stats.solved / stats.total) * 100),
    }))
    .sort((a, b) => a.solveRate - b.solveRate);

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <span className="text-2xl">🐛</span>
            <h1 className="text-xl font-bold text-white">
              BugHunter 강사 대시보드
            </h1>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm text-blue-200 hover:text-white hover:underline transition-colors"
          >
            홈
          </Link>
          <Link
            href="/report"
            className="text-sm text-blue-200 hover:text-white hover:underline transition-colors"
          >
            성장 리포트
          </Link>
          <Link
            href="/practice"
            className="text-sm text-blue-200 hover:text-white hover:underline transition-colors"
          >
            학생 모드 &rarr;
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Key Message */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 flex items-center gap-3">
          <span className="text-2xl">💡</span>
          <p className="text-sm text-blue-800">
            <strong>AI가 25명의 학생에게 실시간 힌트를 제공합니다.</strong> 강사님은 아래에서 고전 중인 학생을 확인하고 집중 지도하세요.
          </p>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-end">
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-white border border-zinc-300 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 transition-colors"
          >
            {loading ? "로딩 중..." : "새로고침"}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            title="참여 학생 수"
            value={String(uniqueStudents)}
            unit="명"
            color="blue"
          />
          <SummaryCard
            title="총 제출 수"
            value={String(totalSubmissions)}
            unit="건"
            color="indigo"
          />
          <SummaryCard
            title="평균 해결률"
            value={String(avgSolveRate)}
            unit="%"
            color="green"
          />
          <SummaryCard
            title="평균 힌트 사용"
            value={avgHints}
            unit="회"
            color="purple"
          />
        </div>

        {/* Bug Type Analysis */}
        {bugTypeStats.length > 0 && (
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <h2 className="text-lg font-bold text-zinc-900 mb-4">
              버그 유형별 분석
            </h2>
            <div className="space-y-3">
              {bugTypeStats.map((stat) => (
                <div key={stat.bugType} className="flex items-center gap-4">
                  <span className="w-40 text-sm font-medium text-zinc-700 truncate">
                    {stat.bugType}
                  </span>
                  <div className="flex-1 bg-zinc-100 rounded-full h-6 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        stat.solveRate >= 70
                          ? "bg-green-500"
                          : stat.solveRate >= 40
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${Math.max(stat.solveRate, 2)}%` }}
                    />
                  </div>
                  <span className="text-sm text-zinc-600 w-24 text-right">
                    {stat.solveRate}% ({stat.solved}/{stat.total})
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-zinc-400 mt-3">
              해결률이 낮은 버그 유형이 상단에 표시됩니다.
            </p>
          </div>
        )}

        {/* Submissions Table */}
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-200">
            <h2 className="text-lg font-bold text-zinc-900">
              전체 제출 기록
            </h2>
          </div>
          {submissions.length === 0 && !loading ? (
            <div className="px-6 py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-zinc-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
              </div>
              <p className="text-lg font-semibold text-zinc-700 mb-2">아직 제출 기록이 없습니다</p>
              <p className="text-sm text-zinc-400 mb-6">학생들이 문제를 풀고 제출하면 여기에 기록이 표시됩니다.</p>
              <Link
                href="/practice"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                학생 모드에서 테스트해보기 &rarr;
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-zinc-50 text-left text-zinc-500">
                    <th className="px-4 py-3 font-medium">학생 이름</th>
                    <th className="px-4 py-3 font-medium">주제</th>
                    <th className="px-4 py-3 font-medium">난이도</th>
                    <th className="px-4 py-3 font-medium">버그 유형</th>
                    <th className="px-4 py-3 font-medium text-center">힌트 사용</th>
                    <th className="px-4 py-3 font-medium text-center">해결 여부</th>
                    <th className="px-4 py-3 font-medium">소요 시간</th>
                    <th className="px-4 py-3 font-medium">날짜</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {submissions.map((sub) => {
                    const badge = LEVEL_BADGE[sub.level] || {
                      label: sub.level,
                      className: "bg-zinc-100 text-zinc-600",
                    };
                    return (
                      <tr key={sub.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-zinc-900">
                          {sub.student_name}
                        </td>
                        <td className="px-4 py-3 text-zinc-600">{sub.topic}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-zinc-600">
                          {sub.bug_type || "-"}
                        </td>
                        <td className="px-4 py-3 text-center text-zinc-600">
                          {sub.hints_used}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {sub.solved ? (
                            <span className="text-green-600 font-medium">O</span>
                          ) : (
                            <span className="text-red-500 font-medium">X</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-zinc-600">
                          {formatTime(sub.time_spent_seconds)}
                        </td>
                        <td className="px-4 py-3 text-zinc-400">
                          {formatDate(sub.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  unit,
  color,
}: {
  title: string;
  value: string;
  unit: string;
  color: "blue" | "indigo" | "green" | "purple";
}) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-700",
    indigo: "bg-indigo-50 text-indigo-700",
    green: "bg-green-50 text-green-700",
    purple: "bg-purple-50 text-purple-700",
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5">
      <p className="text-sm text-zinc-500 mb-1">{title}</p>
      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-bold ${colorMap[color].split(" ")[1]}`}>
          {value}
        </span>
        <span className="text-sm text-zinc-400">{unit}</span>
      </div>
    </div>
  );
}
