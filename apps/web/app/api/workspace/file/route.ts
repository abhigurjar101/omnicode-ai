import { NextRequest, NextResponse } from "next/server";

// In-memory file cache for deployed serverless instances
const fileCache: Record<string, string> = {
  "my-app/src/App.tsx": `import { useState } from 'react'
import './index.css'

export default function App() {
  const [count, setCount] = useState(3)

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white">
      <header className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2">
          <span className="text-red-500 text-2xl font-bold">NEMI-CO</span>
        </div>
        <nav className="hidden md:flex gap-8 text-sm text-zinc-400">
          <a href="#" className="hover:text-white">Home</a>
          <a href="#" className="hover:text-white">Features</a>
          <a href="#" className="hover:text-white">Docs</a>
        </nav>
      </header>

      <main className="flex flex-col items-center justify-center text-center px-6 py-24">
        <h1 className="text-5xl font-bold mb-4">
          Build something amazing with <span className="text-red-500">NEMI-CO</span>
        </h1>
        <p className="text-zinc-300 text-lg mb-8">
          Your AI coding partner. Write, run, and see results instantly.
        </p>
        <button
          onClick={() => setCount(count + 1)}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-full shadow-lg shadow-red-600/30 transition-all cursor-pointer"
        >
          Clicked {count} times
        </button>
      </main>
    </div>
  )
}`,
  "my-app/src/main.tsx": `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
  "my-app/src/index.css": `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  background: #000;
  color: #fff;
}`,
  "my-app/package.json": `{\n  "name": "my-app",\n  "private": true,\n  "version": "0.1.0",\n  "type": "module"\n}`,
  "palindrome.py": `def is_palindrome(text: str) -> bool:
    """Checks if a string is a palindrome, ignoring case and punctuation."""
    cleaned = "".join(char.lower() for char in text if char.isalnum())
    return cleaned == cleaned[::-1]

if __name__ == "__main__":
    tests = [
        ("racecar", True),
        ("radar", True),
        ("level", True),
        ("hello", False),
        ("A man, a plan, a canal: Panama", True),
    ]
    all_passed = True
    for word, expected in tests:
        actual = is_palindrome(word)
        status = "PASS" if actual == expected else "FAIL"
        if actual != expected:
            all_passed = False
        print(f"[{status}] '{word}' -> {actual}")
    if all_passed:
        print("\\nALL TESTS PASSED: Palindrome verification successful.")
`,
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filePath = searchParams.get("path") || "my-app/src/App.tsx";

  try {
    const res = await fetch(`http://localhost:8000/api/workspace/file?path=${encodeURIComponent(filePath)}`, {
      signal: AbortSignal.timeout(1000),
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {}

  const content = fileCache[filePath] || "// File content ready for editing\n";
  return NextResponse.json({
    success: true,
    file_path: filePath,
    content,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const filePath = body.file_path || "my-app/src/App.tsx";
  const content = body.content || "";

  try {
    const res = await fetch("http://localhost:8000/api/workspace/file", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(1000),
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {}

  fileCache[filePath] = content;
  return NextResponse.json({
    success: true,
    file_path: filePath,
    saved: true,
  });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filePath = searchParams.get("path") || "";

  try {
    const res = await fetch(`http://localhost:8000/api/workspace/file?path=${encodeURIComponent(filePath)}`, {
      method: "DELETE",
      signal: AbortSignal.timeout(1000),
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {}

  delete fileCache[filePath];
  return NextResponse.json({ success: true, deleted: filePath });
}
