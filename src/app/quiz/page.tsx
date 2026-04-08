"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

/* ─── Quiz Data ─── */
interface Question {
  level: string;
  code: string;
  question: string;
  options: string[];
  answer: number; // 0-based index
}

const QUESTIONS: Question[] = [
  {
    level: "Lv.1 - 변수/출력",
    code: `x = 10
y = 3
print(x + y)`,
    question: "이 코드의 출력 결과는?",
    options: ["103", "13", "xy", "에러 발생"],
    answer: 1,
  },
  {
    level: "Lv.2 - 조건문",
    code: `score = 75
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
else:
    grade = "C"
print(grade)`,
    question: "이 코드의 출력 결과는?",
    options: ["A", "B", "C", "에러 발생"],
    answer: 2,
  },
  {
    level: "Lv.3 - 반복문",
    code: `total = 0
for i in range(1, 6):
    total += i
print(total)`,
    question: "이 코드의 출력 결과는?",
    options: ["6", "10", "15", "21"],
    answer: 2,
  },
  {
    level: "Lv.4 - 함수",
    code: `def multiply(a, b=2):
    return a * b

result = multiply(3)
print(result)`,
    question: "이 코드의 출력 결과는?",
    options: ["3", "6", "32", "에러 발생"],
    answer: 1,
  },
  {
    level: "Lv.5 - 클래스",
    code: `class Dog:
    def __init__(self, name):
        self.name = name

    def bark(self):
        return f"{self.name}가 멍멍!"

dog = Dog("바둑이")
print(dog.bark())`,
    question: "이 코드의 출력 결과는?",
    options: ['바둑이가 멍멍!', 'Dog가 멍멍!', 'name가 멍멍!', '에러 발생'],
    answer: 0,
  },
];

const OPTION_LABELS = ["A", "B", "C", "D"];

/* ─── Level Mapping ─── */
function getLevel(score: number): {
  label: string;
  tag: string;
  description: string;
  practiceLevel: string;
} {
  if (score <= 1) {
    return {
      label: "초급 (Lv.1)",
      tag: "beginner",
      description: "Python 기초부터 시작해봐요!",
      practiceLevel: "beginner",
    };
  }
  if (score <= 3) {
    return {
      label: "중급 (Lv.2)",
      tag: "intermediate",
      description: "기본기는 있어요! 더 깊이 가볼까요?",
      practiceLevel: "intermediate",
    };
  }
  return {
    label: "고급 (Lv.3)",
    tag: "advanced",
    description: "실력자시네요! 고급 버그에 도전해보세요!",
    practiceLevel: "advanced",
  };
}

/* ─── Page Component ─── */
export default function QuizPage() {
  const router = useRouter();

  // Phases: "name" | "quiz" | "result"
  const [phase, setPhase] = useState<"name" | "quiz" | "result">("name");
  const [studentName, setStudentName] = useState("");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [animating, setAnimating] = useState(false);
  const [saving, setSaving] = useState(false);

  const score = answers.reduce(
    (acc, ans, i) => acc + (ans === QUESTIONS[i].answer ? 1 : 0),
    0
  );
  const levelInfo = getLevel(score);

  /* ─── Handlers ─── */
  function handleNameSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!studentName.trim()) return;
    setPhase("quiz");
  }

  function handleAnswer(optionIndex: number) {
    if (animating) return;

    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (currentQ < QUESTIONS.length - 1) {
      // Animate to next question
      setAnimating(true);
      setTimeout(() => {
        setCurrentQ((prev) => prev + 1);
        setAnimating(false);
      }, 300);
    } else {
      // Quiz complete - save to Supabase
      setPhase("result");
      saveResult(newAnswers);
    }
  }

  async function saveResult(finalAnswers: number[]) {
    const finalScore = finalAnswers.reduce(
      (acc, ans, i) => acc + (ans === QUESTIONS[i].answer ? 1 : 0),
      0
    );
    const info = getLevel(finalScore);

    setSaving(true);
    try {
      await supabase.from("students").insert({
        name: studentName.trim(),
        level: info.tag,
        quiz_score: finalScore,
      });
    } catch (err) {
      console.error("퀴즈 결과 저장 실패:", err);
    } finally {
      setSaving(false);
    }
  }

  function handleStartPractice() {
    router.push(`/practice?level=${levelInfo.practiceLevel}`);
  }

  function handleRetry() {
    setPhase("name");
    setCurrentQ(0);
    setAnswers([]);
    setStudentName("");
  }

  /* ─── Render ─── */
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <h1 className="text-xl font-bold text-white">
              BugHunter <span className="text-2xl">🐛</span>
            </h1>
            <span className="text-sm text-blue-200 hidden sm:inline">
              레벨 진단 퀴즈
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs text-blue-200 hover:text-white hover:underline transition-colors"
            >
              홈
            </Link>
            <Link
              href="/practice"
              className="text-xs text-blue-200 hover:text-white hover:underline transition-colors"
            >
              연습하기
            </Link>
            <Link
              href="/teacher"
              className="text-xs text-blue-200 hover:text-white hover:underline transition-colors"
            >
              강사 모드
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {/* ─── Phase: Name Input ─── */}
        {phase === "name" && (
          <div className="w-full max-w-md animate-fade-in">
            <div className="bg-white rounded-2xl shadow-lg border border-zinc-200 p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🐛</span>
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 mb-2">
                레벨 진단 퀴즈
              </h2>
              <p className="text-sm text-zinc-500 mb-8 leading-relaxed">
                5개의 Python 문제를 풀고
                <br />
                나에게 맞는 디버깅 레벨을 확인해보세요!
              </p>
              <form onSubmit={handleNameSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="이름을 입력하세요"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-center text-zinc-900 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!studentName.trim()}
                  className="w-full py-3 rounded-xl bg-blue-600 text-white text-lg font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  퀴즈 시작하기
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ─── Phase: Quiz ─── */}
        {phase === "quiz" && (
          <div className="w-full max-w-2xl">
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-zinc-500">
                  문제 {currentQ + 1} / {QUESTIONS.length}
                </span>
                <span className="text-xs text-zinc-400">
                  {QUESTIONS[currentQ].level}
                </span>
              </div>
              <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${((currentQ + 1) / QUESTIONS.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div
              className={`bg-white rounded-2xl shadow-lg border border-zinc-200 overflow-hidden transition-all duration-300 ${
                animating
                  ? "opacity-0 translate-x-8"
                  : "opacity-100 translate-x-0"
              }`}
            >
              {/* Code Block */}
              <div className="bg-[#1e1e1e] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-2 text-xs text-zinc-500 font-mono">
                    question_{currentQ + 1}.py
                  </span>
                </div>
                <pre className="text-sm font-mono text-green-400 leading-relaxed whitespace-pre overflow-x-auto">
                  {QUESTIONS[currentQ].code}
                </pre>
              </div>

              {/* Question & Options */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-zinc-900 mb-5">
                  {QUESTIONS[currentQ].question}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {QUESTIONS[currentQ].options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnswer(i)}
                      disabled={animating}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 border-zinc-200 hover:border-blue-500 hover:bg-blue-50 text-left transition-all active:scale-[0.98] disabled:pointer-events-none group"
                    >
                      <span className="w-8 h-8 rounded-lg bg-zinc-100 group-hover:bg-blue-100 group-hover:text-blue-700 flex items-center justify-center text-sm font-bold text-zinc-500 shrink-0 transition-colors">
                        {OPTION_LABELS[i]}
                      </span>
                      <span className="text-sm font-medium text-zinc-700 group-hover:text-blue-700 transition-colors">
                        {option}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Phase: Result ─── */}
        {phase === "result" && (
          <div className="w-full max-w-2xl animate-fade-in">
            <div className="bg-white rounded-2xl shadow-lg border border-zinc-200 overflow-hidden">
              {/* Score Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-center">
                <p className="text-blue-200 text-sm font-medium mb-2">
                  {studentName}님의 진단 결과
                </p>
                <div className="text-6xl font-black text-white mb-2">
                  {score}/{QUESTIONS.length}
                </div>
                <p className="text-blue-100 text-lg">정답</p>
              </div>

              {/* Level Badge */}
              <div className="px-8 py-6 border-b border-zinc-100">
                <div className="flex items-center justify-center gap-4">
                  <div
                    className={`px-5 py-2.5 rounded-xl text-white font-bold text-lg ${
                      levelInfo.tag === "beginner"
                        ? "bg-green-500"
                        : levelInfo.tag === "intermediate"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                  >
                    {levelInfo.label}
                  </div>
                </div>
                <p className="text-center text-zinc-600 mt-3 text-base">
                  {levelInfo.description}
                </p>
                {saving && (
                  <p className="text-center text-zinc-400 text-xs mt-2">
                    결과 저장 중...
                  </p>
                )}
              </div>

              {/* Answer Review */}
              <div className="px-8 py-6">
                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">
                  문제별 결과
                </h3>
                <div className="space-y-3">
                  {QUESTIONS.map((q, i) => {
                    const isCorrect = answers[i] === q.answer;
                    return (
                      <div
                        key={i}
                        className={`flex items-center gap-4 px-4 py-3 rounded-xl border ${
                          isCorrect
                            ? "bg-green-50 border-green-200"
                            : "bg-red-50 border-red-200"
                        }`}
                      >
                        <span
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                            isCorrect
                              ? "bg-green-500 text-white"
                              : "bg-red-500 text-white"
                          }`}
                        >
                          {isCorrect ? "O" : "X"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-zinc-800">
                            {q.level}
                          </p>
                          <p className="text-xs text-zinc-500 truncate">
                            {isCorrect
                              ? `정답: ${OPTION_LABELS[q.answer]}) ${q.options[q.answer]}`
                              : `내 답: ${OPTION_LABELS[answers[i]]}) ${q.options[answers[i]]} → 정답: ${OPTION_LABELS[q.answer]}) ${q.options[q.answer]}`}
                          </p>
                        </div>
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-md ${
                            isCorrect
                              ? "text-green-700 bg-green-100"
                              : "text-red-700 bg-red-100"
                          }`}
                        >
                          {isCorrect ? "정답" : "오답"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="px-8 py-6 border-t border-zinc-100 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleStartPractice}
                  className="flex-1 py-3.5 rounded-xl bg-blue-600 text-white text-base font-semibold hover:bg-blue-700 transition-colors active:scale-[0.98]"
                >
                  내 레벨에 맞는 디버깅 시작하기!
                </button>
                <button
                  onClick={handleRetry}
                  className="px-6 py-3.5 rounded-xl bg-zinc-100 text-zinc-600 text-base font-medium hover:bg-zinc-200 transition-colors active:scale-[0.98]"
                >
                  다시 하기
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
