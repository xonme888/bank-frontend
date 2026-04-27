"use client";
// EDD 큐 — 좌 리스트 + 우 상세 + 결정 영역.
//   결정 영역의 "승인 확정" 은 LIVE — POST /api/v1/accounts/{id}/approve-edd

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import type { EddQueueItem } from "@/data/operator-fixtures";
import { api, ApiError } from "@/api/client";
import { DEMO_OPERATOR_ACTOR } from "@/api/actor";

const REJECT_REASONS = [
  "KYC 보강 요청",
  "위험 신호 다수 — 추가 조사 필요",
  "고객 동의 미달",
  "타 기관 신고 정보",
] as const;

type Decision = "APPROVE" | "REJECT";

export function EddQueueView({ items, live = false }: { items: EddQueueItem[]; live?: boolean }) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});

  const active = items.find((i) => i.id === activeId);

  // EDD-{accountId} 형식에서 accountId 파싱 (LIVE 진입 시 backend approve 호출용)
  function accountIdOf(itemId: string): number | null {
    const m = /^EDD-(\d+)$/.exec(itemId);
    return m ? Number(m[1]) : null;
  }

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
          live={live}
          accountId={accountIdOf(active.id)}
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
  item, decision, onDecide, live, accountId,
}: {
  item: EddQueueItem;
  decision: Decision | undefined;
  onDecide: (d: Decision) => void;
  live: boolean;
  accountId: number | null;
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

      <DecisionForm onDecide={onDecide} current={decision} live={live} accountId={accountId} />
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

function DecisionForm({ current, onDecide, live, accountId }: {
  current: Decision | undefined;
  onDecide: (d: Decision) => void;
  live: boolean;
  accountId: number | null;
}) {
  const [reason, setReason] = useState<string>(REJECT_REASONS[0]);
  const [memo, setMemo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<{ code: string; status: number } | null>(null);
  const [submitOk, setSubmitOk] = useState(false);

  async function commit() {
    if (current !== "APPROVE") return;
    if (!live || accountId == null) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await api.post(`/api/v1/accounts/${accountId}/approve-edd`, {
        approvalReason: memo || "OPERATOR 승인 — 위험점수 임계 검토 완료",
      }, { actor: DEMO_OPERATOR_ACTOR });
      setSubmitOk(true);
    } catch (e) {
      if (e instanceof ApiError) setSubmitError({ code: e.code, status: e.status });
      else setSubmitError({ code: "NETWORK_ERROR", status: 0 });
    } finally {
      setSubmitting(false);
    }
  }

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

      {submitError && (
        <div className="mt-3 border-l-2 bg-paper p-2.5" style={{ borderColor: "var(--st-suspended)" }}>
          <div className="font-mono text-[10px] uppercase tracking-[0.04em]" style={{ color: "var(--st-suspended)" }}>
            ✕ {submitError.status} {submitError.code}
          </div>
        </div>
      )}
      {submitOk && (
        <div className="mt-3 border-l-2 bg-paper p-2.5" style={{ borderColor: "var(--tx-deposit)" }}>
          <div className="font-mono text-[10px] uppercase tracking-[0.04em]" style={{ color: "var(--tx-deposit)" }}>
            ✓ 200 OK · LIVE · approve-edd 처리 완료
          </div>
          <div className="text-[11px] text-ink-2 mt-1">계좌 상태가 ACTIVE 로 전이되고 감사 로그 1건이 기록됨.</div>
        </div>
      )}
      <button
        onClick={commit}
        disabled={current !== "APPROVE" || !live || submitting || submitOk}
        className="w-full mt-3 bg-ink text-paper py-3 font-serif text-sm disabled:bg-ink-3"
      >
        {submitting ? "처리 중…" : submitOk ? "처리 완료" : current === "APPROVE" && live ? "결정 확정 (LIVE 감사로그 기록)" : "결정 확정 (감사로그 기록)"}
      </button>
      <Link
        href={"/operator/customer-360" as Route}
        className="block w-full mt-2 border border-ink py-2.5 font-serif text-xs text-center hover:bg-paper-2"
      >
        고객 360° 에서 추가 검토 →
      </Link>
    </div>
  );
}
