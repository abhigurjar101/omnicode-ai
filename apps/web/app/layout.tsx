import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NEMI-CODE — Intelligent Autonomous Software Engineering",
  description: "An intelligent, autonomous software engineering environment powered by NVIDIA.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "NEMI-CODE — Intelligent Autonomous Software Engineering",
    description: "An intelligent, autonomous software engineering environment powered by NVIDIA.",
    siteName: "NEMI-CODE",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-screen bg-black text-cinematic-soft antialiased overflow-x-hidden selection:bg-signal-red selection:text-white">
        {children}
      </body>
    </html>
  );
}
