// Judge0 CE API 클라이언트
// Python 3 코드 실행 및 테스트케이스 검증

const JUDGE0_URL = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_KEY = process.env.JUDGE0_API_KEY || '';

const PYTHON3_LANGUAGE_ID = 71;
const MAX_POLL_ATTEMPTS = 15;
const POLL_INTERVAL_MS = 1000;

interface Judge0Submission {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  status: { id: number; description: string };
  time: string | null;
  memory: number | null;
}

// Judge0에 코드 제출 후 결과 대기
export async function executeCode(sourceCode: string): Promise<Judge0Submission> {
  // base64 인코딩
  const encodedSource = Buffer.from(sourceCode).toString('base64');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  // RapidAPI 사용 시
  if (JUDGE0_KEY) {
    headers['X-RapidAPI-Key'] = JUDGE0_KEY;
    headers['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
  }

  // 제출
  const submitRes = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=true&wait=false`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      language_id: PYTHON3_LANGUAGE_ID,
      source_code: encodedSource,
      cpu_time_limit: 5,
      memory_limit: 131072, // 128MB
    }),
  });

  if (!submitRes.ok) {
    throw new Error(`Judge0 submit failed: ${submitRes.status}`);
  }

  const { token } = await submitRes.json();

  // 폴링으로 결과 대기
  for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));

    const resultRes = await fetch(
      `${JUDGE0_URL}/submissions/${token}?base64_encoded=true&fields=stdout,stderr,compile_output,status,time,memory`,
      { headers }
    );

    if (!resultRes.ok) continue;

    const result = await resultRes.json();

    // status.id: 1=In Queue, 2=Processing, 3=Accepted, 4+=Error
    if (result.status.id >= 3) {
      return {
        stdout: result.stdout ? Buffer.from(result.stdout, 'base64').toString() : null,
        stderr: result.stderr ? Buffer.from(result.stderr, 'base64').toString() : null,
        compile_output: result.compile_output
          ? Buffer.from(result.compile_output, 'base64').toString()
          : null,
        status: result.status,
        time: result.time,
        memory: result.memory,
      };
    }
  }

  throw new Error('Judge0 execution timed out');
}

// 테스트케이스 배열을 하나의 Python 스크립트로 조합하여 실행
export async function runWithTestCases(
  studentCode: string,
  testCases: { input: string; expected_output: string; description: string }[]
): Promise<{
  overall_status: 'pass' | 'fail' | 'error';
  results: {
    test_index: number;
    passed: boolean;
    input: string;
    expected: string;
    actual: string;
    description: string;
  }[];
  stderr: string | null;
}> {
  // 테스트 러너 코드 조합
  const testRunner = `
import json
import sys
import traceback

# 학생 코드
${studentCode}

# 테스트 실행
results = []
${testCases
  .map(
    (tc, i) => `
try:
    _actual_${i} = str(${tc.input})
    _expected_${i} = ${JSON.stringify(tc.expected_output)}
    results.append({
        "test_index": ${i},
        "passed": _actual_${i} == _expected_${i},
        "input": ${JSON.stringify(tc.input)},
        "expected": _expected_${i},
        "actual": _actual_${i},
        "description": ${JSON.stringify(tc.description)}
    })
except Exception as e:
    results.append({
        "test_index": ${i},
        "passed": False,
        "input": ${JSON.stringify(tc.input)},
        "expected": ${JSON.stringify(tc.expected_output)},
        "actual": f"Error: {type(e).__name__}: {e}",
        "description": ${JSON.stringify(tc.description)}
    })
`
  )
  .join('\n')}

print(json.dumps(results))
`;

  try {
    const result = await executeCode(testRunner);

    // 런타임 에러
    if (result.status.id !== 3) {
      return {
        overall_status: 'error',
        results: [],
        stderr: result.stderr || result.compile_output || result.status.description,
      };
    }

    // stdout에서 JSON 파싱
    if (!result.stdout) {
      return {
        overall_status: 'error',
        results: [],
        stderr: 'No output from code execution',
      };
    }

    const testResults = JSON.parse(result.stdout.trim());
    const allPassed = testResults.every((r: { passed: boolean }) => r.passed);

    return {
      overall_status: allPassed ? 'pass' : 'fail',
      results: testResults,
      stderr: result.stderr,
    };
  } catch (error) {
    return {
      overall_status: 'error',
      results: [],
      stderr: error instanceof Error ? error.message : 'Unknown execution error',
    };
  }
}
