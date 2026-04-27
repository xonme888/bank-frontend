import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "xbank — 16 Screens",
  description: "Banking system case study — Next.js prototype",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600&display=swap"
        />
      </head>
      <body>
        <TopBar />
        {children}
      </body>
    </html>
  );
}

function TopBar() {
  return (
    <div className="sticky top-0 z-50 flex items-center gap-[18px] px-8 py-3.5 bg-paper border-b border-rule">
      <a href="/" className="font-serif text-lg font-medium text-ink tracking-[-0.01em]">xbank</a>
      <span className="text-rule-strong">/</span>
      <span className="font-mono text-[11px] tracking-[0.04em] uppercase text-ink-3">
        16 SCREENS · NEXT.JS PROTOTYPE
      </span>
    </div>
  );
}
