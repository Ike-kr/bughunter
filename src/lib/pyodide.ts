/* eslint-disable @typescript-eslint/no-explicit-any */

let pyodideInstance: any = null;
let loadingPromise: Promise<any> | null = null;

declare global {
  interface Window {
    loadPyodide?: (config: { indexURL: string }) => Promise<any>;
  }
}

function loadPyodideScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Pyodide는 브라우저에서만 실행할 수 있습니다."));
      return;
    }
    if (window.loadPyodide) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Pyodide 스크립트 로드 실패"));
    document.head.appendChild(script);
  });
}

export async function getPyodide(): Promise<any> {
  if (pyodideInstance) return pyodideInstance;

  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    await loadPyodideScript();
    if (!window.loadPyodide) {
      throw new Error("Pyodide 스크립트가 로드되지 않았습니다.");
    }
    pyodideInstance = await window.loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.5/full/",
    });
    return pyodideInstance;
  })();

  return loadingPromise;
}

export interface PythonResult {
  output: string;
  error: string | null;
}

export async function runPython(code: string): Promise<PythonResult> {
  try {
    const pyodide = await getPyodide();

    // stdout/stderr 캡처를 위한 설정
    pyodide.runPython(`
import sys
import io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
`);

    try {
      pyodide.runPython(code);
    } catch (pyErr: any) {
      const stderr = pyodide.runPython("sys.stderr.getvalue()") as string;
      const stdout = pyodide.runPython("sys.stdout.getvalue()") as string;

      // Reset stdout/stderr
      pyodide.runPython(`
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
`);

      return {
        output: stdout,
        error: stderr || pyErr.message || String(pyErr),
      };
    }

    const stdout = pyodide.runPython("sys.stdout.getvalue()") as string;

    // Reset stdout/stderr
    pyodide.runPython(`
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
`);

    return { output: stdout, error: null };
  } catch (err: any) {
    return {
      output: "",
      error: err.message || "Python 실행 중 알 수 없는 오류가 발생했습니다.",
    };
  }
}
