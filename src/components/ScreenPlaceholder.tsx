// 16화면을 placeholder route 들로 자동 스캐폴드.
// Claude Code 가 실제 화면 컴포넌트로 채울 때까지의 임시 페이지.

import Link from "next/link";
import { SCREENS } from "@/lib/screens";

export function ScreenPlaceholder({ id }: { id: string }) {
  const s = SCREENS.find((s) => s.id === id);
  if (!s) return <div>unknown screen: {id}</div>;

  return (
    <div className="bg-paper-2 min-h-[calc(100vh-58px)] p-10">
      <div className="mx-auto max-w-[960px]">
        <Link href="/" className="font-mono text-[11px] text-ink-3 hover:text-ink">← all screens</Link>

        <div className="mt-6 mb-3 font-mono text-[11px] tracking-[0.06em] text-ink-3">
          SCREEN {s.n} · {s.group.replace("_", " ")}
        </div>
        <h1 className="font-serif text-[40px] leading-[1.1] font-medium tracking-[-0.025em] mb-2">
          {s.title}
        </h1>
        <p className="font-serif text-base text-ink-2 max-w-[640px] leading-relaxed">
          {s.desc}
        </p>

        <div className="mt-10 border border-rule-strong bg-paper p-12 text-center">
          <div className="font-mono text-[11px] tracking-[0.08em] uppercase text-ink-3 mb-2">
            Placeholder
          </div>
          <div className="font-serif text-lg text-ink-2 max-w-[480px] mx-auto">
            원본 HTML 프로토타입의 <code className="font-mono text-sm bg-paper-2 px-1.5 py-0.5">{s.id}</code> 컴포넌트를
            여기에 이식.
          </div>
          <div className="mt-6 font-mono text-[10px] uppercase tracking-[0.04em] text-ink-3 flex gap-2 justify-center flex-wrap">
            {s.tags.map((t) => (
              <span key={t} className="px-1.5 py-0.5 border border-rule-strong">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
