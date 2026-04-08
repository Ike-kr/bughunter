import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white scroll-smooth">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-zinc-100 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐛</span>
            <span className="text-xl font-bold text-zinc-900">BugHunter</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#problem" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors hidden sm:inline">문제점</a>
            <a href="#solution" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors hidden sm:inline">솔루션</a>
            <a href="#compare" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors hidden sm:inline">차별점</a>
            <Link
              href="/quiz"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              레벨 진단하기
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-amber-50/30" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-8">
            <span>🏆</span>
            <span>AI활용 차세대 교육 솔루션 공모전 출품작</span>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-zinc-900 mb-6 tracking-tight">
            BugHunter <span className="inline-block">🐛</span>
          </h1>
          <p className="text-xl sm:text-2xl text-zinc-600 mb-4 font-medium leading-relaxed">
            AI가 만든 버그를 찾아라!<br className="sm:hidden" /> 디버깅으로 성장하는 코딩 교육 플랫폼
          </p>
          <div className="max-w-2xl mx-auto mb-10">
            <p className="text-base sm:text-lg text-zinc-500 leading-relaxed">
              모든 교육은 코드 <strong className="text-zinc-700">짜는 법</strong>을 가르칩니다.<br />
              하지만 실무의 60%는 코드 <strong className="text-amber-600">고치는 법</strong>입니다.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/quiz"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-blue-600 text-white text-lg font-semibold hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-200 active:scale-[0.98]"
            >
              레벨 진단하기
            </Link>
            <Link
              href="/practice"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-zinc-700 text-lg font-semibold border-2 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-all active:scale-[0.98]"
            >
              바로 연습하기
            </Link>
            <Link
              href="/teacher"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-zinc-700 text-lg font-semibold border-2 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-all active:scale-[0.98]"
            >
              강사 대시보드
            </Link>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="py-20 bg-zinc-900 scroll-mt-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-sm font-medium mb-4">PROBLEM</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">교육 현장의 진짜 문제</h2>
            <p className="text-zinc-400 text-lg">지금 코딩 교육에는 구조적인 한계가 있습니다</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ProblemCard
              number="01"
              title="30명 한 반, 수준은 천차만별"
              description="강사 1명이 30명의 학생에게 개별 피드백을 줄 수 없습니다. 빠른 학생은 지루하고, 느린 학생은 따라갈 수 없습니다."
              icon="👥"
            />
            <ProblemCard
              number="02"
              title="중도 탈락률 30~50%"
              description="성장을 체감하지 못한 학생은 포기합니다. '내가 얼마나 나아졌는지' 알 수 있는 피드백이 없습니다."
              icon="📉"
            />
            <ProblemCard
              number="03"
              title="수료해도 실무에서 디버깅 못 해"
              description="코드 짜기만 배우고 고치기는 배우지 않습니다. 실무에 투입되면 디버깅에서 막힙니다."
              icon="🚫"
            />
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solution" className="py-20 bg-white scroll-mt-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-4">SOLUTION</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">BugHunter는 다릅니다</h2>
            <p className="text-zinc-500 text-lg">AI가 교육의 빈틈을 채웁니다</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <SolutionCard
              icon={
                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
              }
              title="AI가 수준별 버그 생성"
              description="초급부터 고급까지, 학생의 레벨에 맞는 디버깅 문제를 AI가 자동으로 생성합니다. 문법 에러부터 로직 버그까지 다양한 유형을 경험할 수 있습니다."
              highlight="맞춤형 난이도"
            />
            <SolutionCard
              icon={
                <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                </svg>
              }
              title="3단계 AI 힌트 시스템"
              description="답을 바로 주지 않고, 사고 과정을 단계별로 유도합니다. 방향 제시 → 범위 좁히기 → 거의 답, 스스로 문제를 해결하는 경험을 제공합니다."
              highlight="코칭형 AI"
            />
            <SolutionCard
              icon={
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                </svg>
              }
              title="강사 대시보드"
              description="30명의 풀이 현황을 한눈에 파악합니다. AI가 25명을 맡고, 강사는 가장 도움이 필요한 5명에 집중할 수 있습니다."
              highlight="효율적 관리"
            />
          </div>
        </div>
      </section>

      {/* Differentiator Section */}
      <section id="compare" className="py-20 bg-zinc-50 scroll-mt-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-sm font-medium mb-4">COMPARE</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">기존 도구와 뭐가 다른가요?</h2>
            <p className="text-zinc-500 text-lg">BugHunter만의 차별화된 접근법</p>
          </div>
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200">
                    <th className="px-6 py-4 text-left text-zinc-400 font-medium"></th>
                    <th className="px-6 py-4 text-center text-zinc-500 font-medium">프로그래머스/백준</th>
                    <th className="px-6 py-4 text-center text-zinc-500 font-medium">ChatGPT</th>
                    <th className="px-6 py-4 text-center font-bold text-blue-600 bg-blue-50/50">BugHunter</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-zinc-100">
                    <td className="px-6 py-4 text-zinc-700 font-medium">목표</td>
                    <td className="px-6 py-4 text-center text-zinc-500">코드 짜기</td>
                    <td className="px-6 py-4 text-center text-zinc-500">질문/답변</td>
                    <td className="px-6 py-4 text-center font-semibold text-blue-700 bg-blue-50/50">코드 고치기</td>
                  </tr>
                  <tr className="border-b border-zinc-100">
                    <td className="px-6 py-4 text-zinc-700 font-medium">피드백</td>
                    <td className="px-6 py-4 text-center text-zinc-500">맞다/틀리다</td>
                    <td className="px-6 py-4 text-center text-zinc-500">답을 바로 줌</td>
                    <td className="px-6 py-4 text-center font-semibold text-blue-700 bg-blue-50/50">AI가 사고를 유도</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-zinc-700 font-medium">실무 연결</td>
                    <td className="px-6 py-4 text-center text-zinc-500">코딩테스트</td>
                    <td className="px-6 py-4 text-center text-zinc-500">없음</td>
                    <td className="px-6 py-4 text-center font-semibold text-blue-700 bg-blue-50/50">디버깅 역량</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-green-50 text-green-600 text-sm font-medium mb-4">HOW IT WORKS</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">이렇게 동작합니다</h2>
            <p className="text-zinc-500 text-lg">3분이면 체험할 수 있습니다</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StepCard step={1} title="주제 선택" description="강사 또는 학생이 학습할 프로그래밍 주제를 선택합니다" />
            <StepCard step={2} title="AI가 버그 생성" description="선택한 주제와 난이도에 맞춰 AI가 버그가 숨겨진 코드를 만듭니다" />
            <StepCard step={3} title="디버깅 도전" description="코드를 실행하고 분석하며 버그를 찾아 수정합니다. 막히면 AI 힌트!" />
            <StepCard step={4} title="성장 확인" description="성장 리포트에서 레벨 진행도, 주제별 강점/약점, 해결률 변화를 한눈에 확인합니다" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">지금 바로 시작해보세요</h2>
          <p className="text-blue-100 text-lg mb-8">회원가입 없이 바로 체험할 수 있습니다</p>
          <Link
            href="/practice"
            className="inline-flex items-center gap-2 px-10 py-5 rounded-xl bg-white text-blue-700 text-lg font-bold hover:bg-blue-50 transition-all hover:shadow-lg active:scale-[0.98]"
          >
            버그 잡으러 가기 🐛
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-900 py-10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">🐛</span>
            <span className="text-lg font-bold text-white">BugHunter</span>
          </div>
          <p className="text-zinc-400 text-sm mb-2">AI활용 차세대 교육 솔루션 공모전 출품작</p>
          <p className="text-zinc-500 text-xs">Powered by GPT-4o, Next.js, Supabase</p>
          <div className="mt-6 flex items-center justify-center gap-6">
            <Link href="/quiz" className="text-zinc-400 text-sm hover:text-white transition-colors">
              레벨 진단
            </Link>
            <Link href="/practice" className="text-zinc-400 text-sm hover:text-white transition-colors">
              학생 모드
            </Link>
            <Link href="/teacher" className="text-zinc-400 text-sm hover:text-white transition-colors">
              강사 모드
            </Link>
            <Link href="/report" className="text-zinc-400 text-sm hover:text-white transition-colors">
              성장 리포트
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ProblemCard({ number, title, description, icon }: { number: string; title: string; description: string; icon: string }) {
  return (
    <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-2xl p-7 hover:bg-zinc-800 transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{icon}</span>
        <span className="text-xs font-mono text-zinc-500">{number}</span>
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
    </div>
  );
}

function SolutionCard({ icon, title, description, highlight }: { icon: React.ReactNode; title: string; description: string; highlight: string }) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-7 hover:shadow-lg hover:shadow-zinc-100 transition-all hover:-translate-y-1">
      <div className="w-14 h-14 rounded-xl bg-zinc-50 flex items-center justify-center mb-5">
        {icon}
      </div>
      <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-medium mb-3">{highlight}</span>
      <h3 className="text-lg font-bold text-zinc-900 mb-2">{title}</h3>
      <p className="text-sm text-zinc-500 leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({ step, title, description }: { step: number; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
        {step}
      </div>
      <h3 className="text-base font-bold text-zinc-900 mb-2">{title}</h3>
      <p className="text-sm text-zinc-500 leading-relaxed">{description}</p>
    </div>
  );
}
