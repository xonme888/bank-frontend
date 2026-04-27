"use client";
// 카테고리 탭 + 검색 필터 + 카드 그리드.
// 인터랙션 격리를 위해 page.tsx 와 분리 — page 는 RSC 로 데이터만 전달.

import { useMemo, useState } from "react";
import type { ErrorCategory, ErrorEntry } from "@/data/error-codes";
import { Eyebrow } from "@/components/primitives/Eyebrow";

type Bucket = { category: ErrorCategory; label: string; items: ErrorEntry[] };

export function SearchableCatalog({ byCategory }: { byCategory: Bucket[] }) {
  const [active, setActive] = useState<ErrorCategory | "ALL">("ALL");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return byCategory
      .filter((b) => active === "ALL" || b.category === active)
      .map((b) => ({
        ...b,
        items: b.items.filter((e) =>
          q.length === 0
            ? true
            : e.code.toLowerCase().includes(q) || e.label.toLowerCase().includes(q),
        ),
      }))
      .filter((b) => b.items.length > 0);
  }, [byCategory, active, query]);

  const totalShown = filtered.reduce((s, b) => s + b.items.length, 0);

  return (
    <section>
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <div className="flex gap-1 flex-wrap">
          <Tab label="모두" active={active === "ALL"} onClick={() => setActive("ALL")} />
          {byCategory.map((b) => (
            <Tab
              key={b.category}
              label={`${b.label} ${b.items.length}`}
              active={active === b.category}
              onClick={() => setActive(b.category)}
            />
          ))}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="코드명 또는 한국어 라벨로 검색"
          className="border border-rule-strong bg-paper px-3 py-1.5 font-mono text-[11px] w-[280px] focus:outline-none focus:border-ink"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="border border-rule-strong bg-paper p-10 text-center font-serif text-ink-2">
          “{query}” 와 일치하는 코드가 없어요
        </div>
      ) : (
        filtered.map((b) => (
          <div key={b.category} className="mb-6 last:mb-0">
            <Eyebrow className="mb-2">{b.label} · {b.items.length}</Eyebrow>
            <ul className="grid grid-cols-2 gap-2">
              {b.items.map((e) => <Card key={e.code} entry={e} highlight={query.trim().toLowerCase()} />)}
            </ul>
          </div>
        ))
      )}

      <div className="mt-8 font-mono text-[10px] text-ink-3 tracking-[0.04em] uppercase">
        Showing {totalShown} of {byCategory.reduce((s, b) => s + b.items.length, 0)}
      </div>
    </section>
  );
}

function Tab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={
        "font-mono text-[11px] tracking-[0.04em] px-2.5 py-1 border " +
        (active
          ? "bg-ink text-paper border-ink"
          : "bg-paper text-ink-2 border-rule-strong hover:border-ink hover:text-ink")
      }
    >
      {label}
    </button>
  );
}

function Card({ entry, highlight }: { entry: ErrorEntry; highlight: string }) {
  const statusColor = STATUS_COLOR[entry.status] ?? "var(--ink-3)";
  return (
    <li className="border border-rule-strong bg-paper p-3 flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <code
          className="font-mono text-[11px] font-medium tnum break-all"
          dangerouslySetInnerHTML={{ __html: highlightText(entry.code, highlight) }}
        />
        <span
          className="font-mono text-[10px] tnum px-1.5 py-px border shrink-0"
          style={{ color: statusColor, borderColor: statusColor }}
        >
          {entry.status}
        </span>
      </div>
      <div
        className="font-serif text-[13px] text-ink-2 leading-snug"
        dangerouslySetInnerHTML={{ __html: highlightText(entry.label, highlight) }}
      />
      {entry.retry && (
        <div className="font-mono text-[10px] text-ink-3 mt-0.5 flex items-start gap-1">
          <span>↻</span>
          <span>{entry.retry}</span>
        </div>
      )}
    </li>
  );
}

const STATUS_COLOR: Record<number, string> = {
  400: "var(--st-edd-pending)",
  403: "var(--st-suspended)",
  404: "var(--ink-3)",
  409: "var(--st-edd-pending)",
  422: "var(--st-suspended)",
  500: "var(--st-suspended)",
  503: "var(--st-matured)",
};

function highlightText(text: string, q: string): string {
  if (!q) return escapeHtml(text);
  const lower = text.toLowerCase();
  const idx = lower.indexOf(q);
  if (idx < 0) return escapeHtml(text);
  return (
    escapeHtml(text.slice(0, idx)) +
    `<mark class="bg-paper-2 text-ink px-px">${escapeHtml(text.slice(idx, idx + q.length))}</mark>` +
    escapeHtml(text.slice(idx + q.length))
  );
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
