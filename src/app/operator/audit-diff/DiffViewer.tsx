"use client";
// 2-패널 JSON diff 뷰어 + PII 토글.
// before/after 가 같은 키 집합이라고 가정하되, 다른 경우에도 union 으로 합쳐 표시.

import { useMemo, useState } from "react";
import { Eyebrow } from "@/components/primitives/Eyebrow";

type Json = Record<string, unknown>;

const PII_KEYS = new Set(["accountNumber", "phone", "email", "name"]);

export function DiffViewer({ before, after }: { before: Json; after: Json }) {
  const [showPii, setShowPii] = useState(false);

  const keys = useMemo(() => {
    const set = new Set<string>([...Object.keys(before), ...Object.keys(after)]);
    return Array.from(set);
  }, [before, after]);

  return (
    <section className="border border-rule-strong bg-paper p-5 mb-3">
      <div className="flex items-center justify-between mb-3">
        <Eyebrow>before / after diff</Eyebrow>
        <button
          onClick={() => setShowPii((v) => !v)}
          className={
            "font-mono text-[10px] uppercase tracking-[0.04em] px-2 py-1 border " +
            (showPii
              ? "bg-st-suspended text-paper border-st-suspended"
              : "bg-paper text-ink-2 border-rule-strong hover:border-ink hover:text-ink")
          }
        >
          {showPii ? "✓ PII 원본 보기" : "PII 마스킹"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Pane label="BEFORE">
          {keys.map((k) => (
            <Line key={k} k={k} before={before[k]} after={after[k]} side="before" showPii={showPii} />
          ))}
        </Pane>
        <Pane label="AFTER">
          {keys.map((k) => (
            <Line key={k} k={k} before={before[k]} after={after[k]} side="after" showPii={showPii} />
          ))}
        </Pane>
      </div>

      <div className="mt-3 flex items-center gap-3 font-mono text-[10px] text-ink-3 tracking-[0.04em] uppercase">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2" style={{ background: "var(--st-suspended)" }} />
          제거/이전값
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2" style={{ background: "var(--tx-deposit)" }} />
          추가/이후값
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2" style={{ background: "var(--rule-strong)" }} />
          변경 없음
        </span>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function Pane({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border border-rule p-3 bg-paper-2">
      <div className="font-mono text-[10px] text-ink-3 tracking-[0.06em] uppercase mb-2">{label}</div>
      <pre className="font-mono text-[11px] leading-[1.7] m-0">{children}</pre>
    </div>
  );
}

function Line({
  k, before, after, side, showPii,
}: {
  k: string;
  before: unknown;
  after: unknown;
  side: "before" | "after";
  showPii: boolean;
}) {
  const value = side === "before" ? before : after;
  const changed = !Object.is(before, after);
  const isAdded = before === undefined && after !== undefined;
  const isRemoved = after === undefined && before !== undefined;

  let bg = "transparent";
  if (changed) {
    if (side === "before") bg = "rgba(139,69,67,0.12)";  // 적색 (제거/이전)
    else                   bg = "rgba(61,107,84,0.12)";  // 녹색 (추가/이후)
  }
  if (isAdded && side === "before") bg = "transparent";
  if (isRemoved && side === "after") bg = "transparent";

  const isPii = PII_KEYS.has(k);
  const display = formatValue(value, { showPii, isPii });

  return (
    <div className="flex items-baseline gap-2 px-1.5 -mx-1.5" style={{ background: bg }}>
      <span className="text-ink-3 select-none w-3 shrink-0">
        {changed && side === "before" && !isAdded ? "−" : changed && side === "after" && !isRemoved ? "+" : " "}
      </span>
      <span className="text-ink-3 shrink-0">{k}:</span>
      <span className="text-ink break-all">{display}</span>
    </div>
  );
}

function formatValue(v: unknown, { showPii, isPii }: { showPii: boolean; isPii: boolean }): string {
  if (v === undefined) return "—";
  if (v === null) return "null";
  if (typeof v === "string") {
    const masked = isPii && !showPii ? maskPii(v) : v;
    return JSON.stringify(masked);
  }
  return JSON.stringify(v);
}

function maskPii(s: string): string {
  if (s.length <= 4) return "***";
  return s.slice(0, 2) + "***" + s.slice(-2);
}
