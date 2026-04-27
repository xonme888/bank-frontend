"use client";
// 거래 내역 — 기간 + 6 유형 chip 필터, 행 단위 색상 구분.

import { useMemo, useState } from "react";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { TX_TYPE_LABEL, TX_TYPE_TOKEN, type TxType } from "@/lib/tokens";
import type { TxRow } from "@/data/transactions-fixture";

type RangeKey = "7D" | "30D" | "90D" | "ALL";

const RANGES: ReadonlyArray<{ id: RangeKey; label: string; days: number | null }> = [
  { id: "7D",  label: "7일",  days: 7 },
  { id: "30D", label: "30일", days: 30 },
  { id: "90D", label: "90일", days: 90 },
  { id: "ALL", label: "전체", days: null },
];

const TYPES: ReadonlyArray<TxType> = [
  "DEPOSIT", "WITHDRAW", "TRANSFER_OUT", "TRANSFER_IN", "MATURITY_PAYOUT", "EARLY_TERMINATION_PAYOUT",
];

export function HistoryView({ rows, initialType, initialRange }: {
  rows: TxRow[];
  initialType: string;
  initialRange: string;
}) {
  const [activeType, setActiveType] = useState<TxType | "ALL">(toType(initialType));
  const [activeRange, setActiveRange] = useState<RangeKey>(toRange(initialRange));

  const filtered = useMemo(() => {
    const now = Date.now();
    const days = RANGES.find((r) => r.id === activeRange)?.days ?? null;
    return rows
      .filter((r) => activeType === "ALL" || r.type === activeType)
      .filter((r) => days == null || (now - new Date(r.occurredAt).getTime()) <= days * 86_400_000);
  }, [rows, activeType, activeRange]);

  const balance = filtered[0]?.balanceAfter ?? rows[0]?.balanceAfter ?? 0;

  return (
    <>
      <BalanceWidget balance={balance} count={filtered.length} />

      <section className="mb-3">
        <Eyebrow className="mb-2">기간</Eyebrow>
        <div className="flex gap-1 flex-wrap">
          {RANGES.map((r) => (
            <Chip key={r.id} active={activeRange === r.id} onClick={() => setActiveRange(r.id)}>
              {r.label}
            </Chip>
          ))}
        </div>
      </section>

      <section className="mb-4">
        <Eyebrow className="mb-2">유형 · 6 TxType</Eyebrow>
        <div className="flex gap-1 flex-wrap">
          <Chip active={activeType === "ALL"} onClick={() => setActiveType("ALL")}>모두</Chip>
          {TYPES.map((t) => (
            <Chip
              key={t}
              active={activeType === t}
              onClick={() => setActiveType(t)}
              accent={TX_TYPE_TOKEN[t]}
            >
              {TX_TYPE_LABEL[t]}
            </Chip>
          ))}
        </div>
      </section>

      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="space-y-1.5">
          {filtered.map((r) => <Row key={r.id} row={r} />)}
        </ul>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function BalanceWidget({ balance, count }: { balance: number; count: number }) {
  return (
    <section className="border-2 border-ink bg-paper p-5 mb-4">
      <Eyebrow className="mb-1">현재 잔액</Eyebrow>
      <div className="font-sans tnum font-medium text-[40px] tracking-[-0.025em] leading-none">
        {balance.toLocaleString("ko-KR")}<span className="text-ink-3 font-normal text-base ml-1">원</span>
      </div>
      <div className="font-mono text-[11px] text-ink-3 mt-2 tnum">필터 결과 {count}건</div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function Chip({ children, active, onClick, accent }: {
  children: React.ReactNode; active: boolean; onClick: () => void; accent?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "font-mono text-[11px] px-2.5 py-1 border " +
        (active
          ? "bg-ink text-paper border-ink"
          : "bg-paper text-ink-2 border-rule-strong hover:border-ink hover:text-ink")
      }
      style={accent && active ? { background: accent, borderColor: accent, color: "var(--paper)" } : undefined}
    >
      {accent && !active && (
        <span className="inline-block w-1.5 h-1.5 mr-1.5 align-middle" style={{ background: accent }} />
      )}
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function Row({ row }: { row: TxRow }) {
  const color = TX_TYPE_TOKEN[row.type];
  const sign = row.signed > 0 ? "+" : "−";
  return (
    <li className="border border-rule-strong bg-paper p-3 flex items-start gap-3">
      <div
        className="w-8 h-8 flex items-center justify-center font-mono text-base shrink-0 border"
        style={{ borderColor: color, color }}
      >
        {symbolFor(row.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.04em]" style={{ color }}>
            {TX_TYPE_LABEL[row.type]}
          </span>
          <span className="font-mono text-[10px] text-ink-3">· {row.channel}</span>
        </div>
        <div className="font-serif text-sm font-medium truncate">{row.memo}</div>
        {row.counterpartyMasked && (
          <div className="font-mono text-[10px] text-ink-3 truncate tnum">{row.counterpartyMasked}</div>
        )}
        <div className="font-mono text-[10px] text-ink-3 mt-0.5 tnum">
          {new Date(row.occurredAt).toLocaleString("ko-KR")} · {row.id}
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="font-sans tnum font-medium text-base" style={{ color }}>
          {sign}{row.amount.toLocaleString("ko-KR")}<span className="text-ink-3 font-normal text-xs ml-1">원</span>
        </div>
        <div className="font-mono text-[10px] text-ink-3 tnum mt-0.5">
          잔액 {row.balanceAfter.toLocaleString("ko-KR")}원
        </div>
      </div>
    </li>
  );
}

function symbolFor(t: TxType): string {
  switch (t) {
    case "DEPOSIT":                  return "+";
    case "WITHDRAW":                 return "−";
    case "TRANSFER_OUT":             return "→";
    case "TRANSFER_IN":              return "←";
    case "MATURITY_PAYOUT":          return "M";
    case "EARLY_TERMINATION_PAYOUT": return "T";
  }
}

function EmptyState() {
  return (
    <div className="border border-dashed border-rule-strong p-10 text-center">
      <div className="font-serif text-base text-ink-2 mb-2">조건에 맞는 거래가 없어요</div>
      <div className="font-mono text-[11px] text-ink-3">기간 또는 유형 필터를 조정해 보세요</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function toType(s: string): TxType | "ALL" {
  const known: ReadonlyArray<TxType | "ALL"> = ["ALL", ...TYPES];
  return (known.includes(s as TxType | "ALL") ? s : "ALL") as TxType | "ALL";
}

function toRange(s: string): RangeKey {
  const known: RangeKey[] = ["7D", "30D", "90D", "ALL"];
  return (known.includes(s as RangeKey) ? s : "30D") as RangeKey;
}
