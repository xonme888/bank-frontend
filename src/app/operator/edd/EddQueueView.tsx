"use client";
// EDD 큐 — 좌 리스트 + 우 상세 + 결정 영역.

import { useState } from "react";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import type { EddQueueItem } from "@/data/operator-fixtures";

const REJECT_REASONS = [
  "KYC 보강 요청",
  "위험 신호 다수 — 추가 조사 필요",
  "고객 동의 미달",
  "타 기관 신고 정보",
] as const;

type Decision = "APPROVE" | "REJECT";

export function EddQueueView({ items }: { items: EddQueueItem[] }) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});

  const active = items.find((i) => i.id === activeId);

  return (
    <div className="grid grid-cols-[1fr_440px] gap-3 p-6">
      <div>
        <header className="flex items-center justify-between mb-3">
          <Eyebrow>심사 대기 큐 · {items.length}건</Eyebrow>
          <Filters />
        </header>
        <ul className="border border-rule-strong bg-paper divide-y divide-rule">
          {items.map((it) => (
            <li key={it.id}>
              <button
                onClick={() => setActiveId(it.id)}
                className={
                  "w-full text-left px-4 py-3 grid grid-cols-[120px_1fr_100px_70px_80px] gap-3 items-center hover:bg-paper-2 " +
                  (activeId === it.id ? "bg-paper-2 border-l-2 border-ink pl-3.5" : "")
                }
              >
                <div className="font-mono text-[10px] text-ink-3 tnum">
                  {new Date(it.receivedAt).toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" })}
                </div>
                <div>
                  <div className="font-serif text-sm font-medium">{it.customerNameMasked}</div>
                  <div className="font-mono text-[10px] text-ink-3">{it.id} · {it.productCode}</div>
                </div>
                <RiskBadge score={it.riskScore} />
                <div className="font-mono text-[11px] tnum text-right">{it.waitMinutes}분</div>
                <DecisionBadge decision={decisions[it.id]} />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {active ? (
        <DetailPanel
          item={active}
          decision={decisions[active.id]}
          onDecide={(d) => setDecisions({ ...decisions, [active.id]: d })}
        />
      ) : (
        <div className="border border-rule-strong bg-paper p-10 text-center text-sm text-ink-3">
          왼쪽 큐에서 항목을 선택
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function Filters() {
  return (
    <div className="flex gap-1 flex-wrap font-mono text-[10px]">
      {["우선순위 ↑", "대기시간 ↑", "위험점수 ↑"].map((l) => (
        <button
          key={l}
          className="px-2 py-1 border border-rule-strong bg-paper text-ink-2 hover:border-ink hover:text-ink"
        >
          {l}
        </button>
      ))}
    </div>
  );
}

function RiskBadge({ score }: { score: number }) {
  const color =
    score >= 0.8 ? "var(--st-suspended)"
    : score >= 0.5 ? "var(--st-edd-pending)"
    : "var(--tx-deposit)";
  return (
    <div className="text-center">
      <div className="font-mono text-[10px] uppercase tracking-[0.04em] text-ink-3">위험점수</div>
      <div className="font-mono tnum text-sm font-medium" style={{ color }}>
        {score.toFixed(2)}
      </div>
    </div>
  );
}

function DecisionBadge({ decision }: { decision: Decision | undefined }) {
  if (!decision) return <span className="font-mono text-[10px] text-ink-3 text-right tnum">대기</span>;
  const isApprove = decision === "APPROVE";
  const color = isApprove ? "var(--tx-deposit)" : "var(--st-suspended)";
  return (
    <span
      className="font-mono text-[10px] uppercase tracking-[0.04em] px-1.5 py-px border text-center"
      style={{ color, borderColor: color }}
    >
      {isApprove ? "승인" : "반려"}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function DetailPanel({
  item, decision, onDecide,
}: {
  item: EddQueueItem;
  decision: Decision | undefined;
  onDecide: (d: Decision) => void;
}) {
  return (
    <aside className="border border-rule-strong bg-paper p-5 sticky top-3 self-start">
      <header className="flex items-center justify-between mb-3">
        <Eyebrow>{item.id}</Eyebrow>
        <DecisionBadge decision={decision} />
      </header>

      <div className="font-serif text-2xl font-medium mb-1">{item.customerNameMasked}</div>
      <div className="font-mono text-[11px] text-ink-3 tnum mb-4">
        {item.productCode} · 접수 {new Date(item.receivedAt).toLocaleString("ko-KR")} · 대기 {item.waitMinutes}분
      </div>

      <KycResult result={item.kycResult} terms={item.termsConsented} />

      <div className="mt-4 mb-3">
        <Eyebrow className="mb-2">위험점수 근거 · {item.reasons.length}개 신호</Eyebrow>
        <ul className="space-y-1.5">
          {item.reasons.map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="font-mono text-[10px] text-st-suspended mt-0.5">●</span>
              <span className="text-ink-2 leading-snug">{r}</span>
            </li>
          ))}
        </ul>
      </div>

      <ScoreGauge score={item.riskScore} />

      <DecisionForm onDecide={onDecide} current={decision} />
    </aside>
  );
}

function KycResult({ result, terms }: { result: EddQueueItem["kycResult"]; terms: boolean }) {
  const map = {
    PASSED: { color: "var(--tx-deposit)",      label: "PASSED" },
    WARN:   { color: "var(--st-edd-pending)",  label: "WARN" },
    FAILED: { color: "var(--st-suspended)",    label: "FAILED" },
  };
  const k = map[result];
  return (
    <div className="border border-rule p-3 grid grid-cols-2 gap-3">
      <div>
        <Eyebrow className="mb-1">KYC</Eyebrow>
        <div className="font-mono text-sm font-medium" style={{ color: k.color }}>{k.label}</div>
      </div>
      <div>
        <Eyebrow className="mb-1">필수 약관</Eyebrow>
        <div className="font-mono text-sm font-medium" style={{ color: terms ? "var(--tx-deposit)" : "var(--st-suspended)" }}>
          {terms ? "동의 완료" : "미동의"}
        </div>
      </div>
    </div>
  );
}

function ScoreGauge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color =
    pct >= 80 ? "var(--st-suspended)"
    : pct >= 50 ? "var(--st-edd-pending)"
    : "var(--tx-deposit)";
  return (
    <div className="my-3">
      <div className="flex justify-between font-mono text-[10px] mb-1">
        <span className="text-ink-3">위험점수</span>
        <span className="tnum" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-1.5 bg-rule">
        <div className="h-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function DecisionForm({ current, onDecide }: { current: Decision | undefined; onDecide: (d: Decision) => void }) {
  const [reason, setReason] = useState<string>(REJECT_REASONS[0]);
  const [memo, setMemo] = useState("");

  return (
    <div className="border-t border-dashed border-rule mt-4 pt-4">
      <Eyebrow className="mb-2">결정</Eyebrow>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <button
          onClick={() => onDecide("APPROVE")}
          className={
            "py-2.5 font-serif text-sm border " +
            (current === "APPROVE"
              ? "bg-ink text-paper border-ink"
              : "bg-paper text-ink-2 border-rule-strong hover:border-ink hover:text-ink")
          }
        >
          승인
        </button>
        <button
          onClick={() => onDecide("REJECT")}
          className={
            "py-2.5 font-serif text-sm border " +
            (current === "REJECT"
              ? "bg-st-suspended text-paper border-st-suspended"
              : "bg-paper text-st-suspended border-st-suspended hover:bg-st-suspended hover:text-paper")
          }
        >
          반려
        </button>
      </div>

      {current === "REJECT" && (
        <div className="mb-3">
          <Eyebrow className="mb-1">반려 사유</Eyebrow>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full font-serif text-sm bg-paper border border-rule p-2 focus:outline-none focus:border-ink"
          >
            {REJECT_REASONS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
      )}

      <div>
        <Eyebrow className="mb-1">메모 (감사로그)</Eyebrow>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value.slice(0, 200))}
          rows={3}
          placeholder="결정 근거를 남기세요. tb_account_audit_log 에 기록됩니다."
          className="w-full font-serif text-sm bg-paper border border-rule p-2 focus:outline-none focus:border-ink resize-none"
        />
        <div className="font-mono text-[10px] text-ink-3 text-right tnum mt-1">{memo.length}/200</div>
      </div>

      <button className="w-full mt-3 bg-ink text-paper py-3 font-serif text-sm">
        결정 확정 (감사로그 기록)
      </button>
    </div>
  );
}
