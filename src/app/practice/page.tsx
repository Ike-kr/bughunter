"use client";

import { useState, useCallback, useRef, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { runPython, getPyodide } from "@/lib/pyodide";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-[#1e1e1e] text-zinc-400">
      에디터 로딩 중...
    </div>
  ),
});

interface BugProblem {
  title: string;
  description: string;
  bugType: string;
  buggyCode: string;
  correctCode: string;
}

const TOPICS = [
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
];

const LEVELS = [
  { value: "beginner", label: "초급", color: "bg-green-500" },
  { value: "intermediate", label: "중급", color: "bg-yellow-500" },
  { value: "advanced", label: "고급", color: "bg-red-500" },
] as const;

export default function PracticePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-zinc-50 text-zinc-500">
          로딩 중...
        </div>
      }
    >
      <PracticeContent />
    </Suspense>
  );
}

function PracticeContent() {
  const searchParams = useSearchParams();
  const levelParam = searchParams.get("level");
  const initialLevel =
    levelParam === "beginner" || levelParam === "intermediate" || levelParam === "advanced"
      ? levelParam
      : "beginner";

  const [studentName, setStudentName] = useState("");
  const [topic, setTopic] = useState(TOPICS[2]);
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">(
    initialLevel
  );
  const [problem, setProblem] = useState<BugProblem | null>(null);
  const [code, setCode] = useState("");
  const [consoleOutput, setConsoleOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isHinting, setIsHinting] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [hints, setHints] = useState<string[]>([]);
  const [result, setResult] = useState<{
    correct: boolean;
    feedback: string;
  } | null>(null);
  const [pyodideReady, setPyodideReady] = useState(false);
  const [pyodideLoading, setPyodideLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const editorRef = useRef<unknown>(null);
  const timerStartRef = useRef<number | null>(null);

  // Pyodide 미리 로드
  useEffect(() => {
    setPyodideLoading(true);
    getPyodide()
      .then(() => setPyodideReady(true))
      .catch(() => setConsoleOutput("Pyodide 로드 실패. 페이지를 새로고침해주세요."))
      .finally(() => setPyodideLoading(false));
  }, []);

  const generateBug = useCallback(async () => {
    setIsGenerating(true);
    setResult(null);
    setHints([]);
    setHintLevel(0);
    setConsoleOutput("");
    setShowAnswerUsed(false);

    try {
      const res = await fetch("/api/generate-bug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, level }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "문제 생성 실패");
      }

      const data: BugProblem = await res.json();
      setProblem(data);
      setCode(data.buggyCode);
      timerStartRef.current = Date.now();
    } catch (err) {
      setConsoleOutput(
        `오류: ${err instanceof Error ? err.message : "문제 생성 중 오류 발생"}`
      );
    } finally {
      setIsGenerating(false);
    }
  }, [topic, level]);

  const handleRunCode = useCallback(async () => {
    if (!pyodideReady) {
      setConsoleOutput("Python 엔진을 로딩 중입니다. 잠시 기다려주세요...");
      return;
    }

    setIsRunning(true);
    setConsoleOutput("실행 중...");

    try {
      const { output, error } = await runPython(code);
      let display = "";
      if (output) display += output;
      if (error) display += (display ? "\n" : "") + `오류:\n${error}`;
      if (!display) display = "(출력 없음)";
      setConsoleOutput(display);
    } catch {
      setConsoleOutput("Python 실행 중 오류가 발생했습니다.");
    } finally {
      setIsRunning(false);
    }
  }, [code, pyodideReady]);

  const handleGetHint = useCallback(async () => {
    if (!problem) return;
    const nextHintLevel = Math.min(hintLevel + 1, 3) as 1 | 2 | 3;

    setIsHinting(true);

    try {
      const res = await fetch("/api/get-hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buggyCode: problem.buggyCode,
          studentCode: code,
          correctCode: problem.correctCode,
          hintLevel: nextHintLevel,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "힌트 생성 실패");
      }

      const data = await res.json();
      setHints((prev) => [...prev, data.hint]);
      setHintLevel(nextHintLevel);
    } catch (err) {
      setConsoleOutput(
        `힌트 오류: ${err instanceof Error ? err.message : "힌트 생성 중 오류 발생"}`
      );
    } finally {
      setIsHinting(false);
    }
  }, [problem, code, hintLevel]);

  const submitResult = useCallback(
    async (solved: boolean) => {
      if (!problem || !studentName.trim()) return;
      const timeSpentSeconds = timerStartRef.current
        ? Math.round((Date.now() - timerStartRef.current) / 1000)
        : null;
      try {
        await fetch("/api/submit-result", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentName: studentName.trim(),
            topic,
            level,
            bugType: problem.bugType,
            hintsUsed: hintLevel,
            solved,
            timeSpentSeconds,
          }),
        });
      } catch (err) {
        console.error("제출 저장 실패:", err);
      }
    },
    [problem, studentName, topic, level, hintLevel]
  );

  const handleCheckSolution = useCallback(async () => {
    if (!problem) return;

    setIsChecking(true);
    setResult(null);

    try {
      const res = await fetch("/api/check-solution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentCode: code,
          correctCode: problem.correctCode,
          buggyCode: problem.buggyCode,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "채점 실패");
      }

      const data = await res.json();
      setResult(data);

      // 학생 이름이 입력된 경우에만 제출 기록 저장
      if (studentName.trim()) {
        setSubmitting(true);
        await submitResult(data.correct);
        setSubmitting(false);
      }
    } catch (err) {
      setConsoleOutput(
        `채점 오류: ${err instanceof Error ? err.message : "채점 중 오류 발생"}`
      );
    } finally {
      setIsChecking(false);
    }
  }, [problem, code, studentName, submitResult]);

  const [showAnswerUsed, setShowAnswerUsed] = useState(false);

  const handleShowAnswer = useCallback(() => {
    if (!problem) return;
    if (!problem.correctCode) {
      setConsoleOutput("정답 코드를 불러올 수 없습니다. 새 문제를 생성해주세요.");
      return;
    }
    setCode(problem.correctCode);
    setResult(null);
    setShowAnswerUsed(true);
    setConsoleOutput("✅ 정답 코드가 오른쪽 에디터에 표시되었습니다.\n▶ '실행' 버튼을 눌러 결과를 확인해보세요.");
  }, [problem]);

  return (
    <div className="flex flex-col h-screen bg-zinc-50 overflow-hidden">
      {/* Mobile Notice */}
      <div className="md:hidden bg-amber-50 border-b border-amber-200 px-4 py-3 text-center">
        <p className="text-sm text-amber-800">
          💻 코드 에디터는 PC에서 최적화되어 있습니다. PC로 접속하시면 더 좋은 경험을 할 수 있어요!
        </p>
      </div>
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <h1 className="text-xl font-bold text-white">
              BugHunter <span className="text-2xl">🐛</span>
            </h1>
          </Link>
          <span className="text-sm text-blue-200 hidden sm:inline">
            AI 디버깅 교육 플랫폼
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-xs text-blue-200 hover:text-white hover:underline transition-colors"
          >
            홈
          </Link>
          <Link
            href="/quiz"
            className="text-xs text-blue-200 hover:text-white hover:underline transition-colors"
          >
            레벨 진단
          </Link>
          <Link
            href="/teacher"
            className="text-xs text-blue-200 hover:text-white hover:underline transition-colors"
          >
            강사 모드
          </Link>
          <Link
            href="/report"
            className="text-xs text-blue-200 hover:text-white hover:underline transition-colors"
          >
            내 성장 리포트
          </Link>
          <div className="flex items-center gap-2 text-xs text-blue-100">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                pyodideReady
                  ? "bg-green-400"
                  : pyodideLoading
                    ? "bg-yellow-400 animate-pulse"
                    : "bg-red-400"
              }`}
            />
            {pyodideReady
              ? "Python 준비 완료"
              : pyodideLoading
                ? "Python 로딩중..."
                : "Python 미연결"}
          </div>
        </div>
      </header>

      {/* Controls Bar */}
      <div className="bg-white border-b border-zinc-200 px-6 py-3 flex flex-wrap items-center gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-zinc-700">이름</label>
          <input
            type="text"
            placeholder="학생 이름"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm bg-white text-zinc-900 w-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-zinc-700">주제</label>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {TOPICS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <label className="text-sm font-medium text-zinc-700">난이도</label>
          {LEVELS.map((l) => (
            <button
              key={l.value}
              onClick={() => setLevel(l.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                level === l.value
                  ? `${l.color} text-white shadow-sm`
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

      </div>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0">
        {/* Left Panel - Problem Description */}
        <div className="w-[380px] shrink-0 bg-white border-r border-zinc-200 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5">
            {!problem ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center mb-6">
                  <span className="text-5xl">🐛</span>
                </div>
                <p className="text-lg font-bold text-zinc-800 mb-2">버그를 잡을 준비 되셨나요?</p>
                <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
                  AI가 만든 버그 코드에서 문제를 찾아 수정해보세요!<br />
                  막히면 AI 힌트가 도와줍니다.
                </p>
                <div className="bg-zinc-50 rounded-xl p-4 w-full max-w-[280px] text-left space-y-3 mb-4">
                  <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">시작 방법</p>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                    <p className="text-sm text-zinc-600">위에서 <strong>학생 이름</strong> 입력</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                    <p className="text-sm text-zinc-600"><strong>주제</strong>와 <strong>난이도</strong> 선택</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                    <p className="text-sm text-zinc-600"><strong>새 문제 생성</strong> 버튼 클릭!</p>
                  </div>
                </div>
                <div className="space-y-3 w-full max-w-[240px]">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm shrink-0">1</div>
                    <p className="text-xs text-zinc-500">AI가 버그가 숨겨진 코드를 생성해요</p>
                  </div>
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm shrink-0">2</div>
                    <p className="text-xs text-zinc-500">코드를 분석하고 버그를 찾아 수정하세요</p>
                  </div>
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm shrink-0">3</div>
                    <p className="text-xs text-zinc-500">막히면 AI 힌트를 요청할 수 있어요</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Title & Badge */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium text-white ${
                        LEVELS.find((l) => l.value === level)?.color
                      }`}
                    >
                      {LEVELS.find((l) => l.value === level)?.label}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-600">
                      {problem.bugType}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-zinc-900">
                    {problem.title}
                  </h2>
                </div>

                {/* Description */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-blue-800 mb-1">
                    문제 설명
                  </h3>
                  <p className="text-sm text-blue-700 leading-relaxed">
                    {problem.description}
                  </p>
                </div>

                {/* Mission */}
                <div className="bg-amber-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-amber-800 mb-1">
                    미션
                  </h3>
                  <p className="text-sm text-amber-700">
                    오른쪽 코드에서 버그를 찾아 수정한 후 &ldquo;제출&rdquo; 버튼을 눌러주세요.
                    막히면 &ldquo;힌트&rdquo; 버튼을 눌러보세요!
                  </p>
                </div>

                {/* Hints */}
                {hints.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-zinc-700">
                      힌트
                    </h3>
                    {hints.map((hint, i) => (
                      <div
                        key={i}
                        className="bg-purple-50 rounded-lg p-3 border border-purple-100"
                      >
                        <span className="text-xs font-medium text-purple-600 block mb-1">
                          힌트 {i + 1}단계
                        </span>
                        <p className="text-sm text-purple-800">{hint}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Result */}
                {result && (
                  <div
                    className={`rounded-lg p-4 ${
                      result.correct
                        ? "bg-green-50 border border-green-200"
                        : "bg-red-50 border border-red-200"
                    }`}
                  >
                    <h3
                      className={`text-sm font-semibold mb-1 ${
                        result.correct ? "text-green-800" : "text-red-800"
                      }`}
                    >
                      {result.correct ? "정답입니다! 🎉" : "아직 아니에요 💪"}
                    </h3>
                    <p
                      className={`text-sm ${
                        result.correct ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {result.feedback}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons — 모든 주요 버튼을 여기에 모아서 찾기 쉽게 */}
          <div className="border-t border-zinc-200 p-3 flex flex-col gap-2 shrink-0">
            {/* 새 문제 생성 */}
            <button
              onClick={generateBug}
              disabled={isGenerating}
              className="w-full px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner /> 문제 생성 중...
                </span>
              ) : (
                "🐛 새 문제 생성"
              )}
            </button>

            {problem && (
              <>
                {/* 실행 + 제출 (가로 배치) */}
                <div className="flex gap-2">
                  <button
                    onClick={handleRunCode}
                    disabled={isRunning || !code}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-1.5"
                  >
                    {isRunning ? (
                      <>
                        <Spinner /> 실행 중
                      </>
                    ) : (
                      <>▶ 실행</>
                    )}
                  </button>
                  <button
                    onClick={handleCheckSolution}
                    disabled={isChecking || submitting || !code}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-1.5"
                  >
                    {isChecking ? (
                      <>
                        <Spinner /> 채점 중
                      </>
                    ) : submitting ? (
                      <>
                        <Spinner /> 저장 중
                      </>
                    ) : (
                      "✓ 제출"
                    )}
                  </button>
                </div>

                {/* 힌트 */}
                <button
                  onClick={handleGetHint}
                  disabled={isHinting || hintLevel >= 3}
                  className="w-full px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-bold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isHinting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Spinner /> 힌트 생성 중
                    </span>
                  ) : hintLevel >= 3 ? (
                    "힌트 모두 사용"
                  ) : (
                    `💡 힌트 받기 (${hintLevel}/3)`
                  )}
                </button>

                {/* 정답 보기 */}
                <button
                  onClick={handleShowAnswer}
                  className={`w-full px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    showAnswerUsed
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border-zinc-200"
                  }`}
                >
                  {showAnswerUsed ? "✅ 정답이 에디터에 표시됨" : "👀 정답 보기"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right Panel - Code Editor + Console */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Editor Toolbar */}
          <div className="bg-[#252526] px-4 py-2 flex items-center shrink-0">
            <span className="text-zinc-400 text-sm font-mono">
              solution.py
            </span>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 min-h-0">
            <MonacoEditor
              height="100%"
              language="python"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || "")}
              onMount={(editor) => {
                editorRef.current = editor;
              }}
              options={{
                fontSize: 14,
                lineHeight: 22,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
                wordWrap: "on",
                tabSize: 4,
                insertSpaces: true,
                renderWhitespace: "selection",
                automaticLayout: true,
              }}
            />
          </div>

          {/* Console Output — 축소된 사이즈 */}
          <div className="h-[220px] shrink-0 bg-[#1e1e1e] border-t border-[#333] flex flex-col">
            <div className="px-4 py-1.5 border-b border-[#333] flex items-center justify-between">
              <span className="text-zinc-400 text-xs font-medium uppercase tracking-wider">
                콘솔 출력
              </span>
              <button
                onClick={() => setConsoleOutput("")}
                className="text-zinc-500 text-xs hover:text-zinc-300 transition-colors"
              >
                지우기
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {consoleOutput ? (
                <pre className="text-sm font-mono text-green-400 whitespace-pre-wrap leading-relaxed">
                  {consoleOutput}
                </pre>
              ) : (
                <p className="text-sm text-zinc-500 italic">
                  코드를 실행하면 결과가 여기에 표시됩니다.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
