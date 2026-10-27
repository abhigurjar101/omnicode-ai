import { NextResponse } from "next/server";

export async function GET() {
  // If local backend is available, proxy to it; otherwise return standard workspace file tree
  try {
    const res = await fetch("http://localhost:8000/api/workspace/files?max_depth=4", {
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(1000),
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {}

  // Fallback standalone workspace file list for deployed environments
  return NextResponse.json({
    success: true,
    files: [
      "my-app/src/App.tsx",
      "my-app/src/main.tsx",
      "my-app/src/index.css",
      "my-app/package.json",
      "my-app/index.html",
      "palindrome.py",
    ],
  });
}
