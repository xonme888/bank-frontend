"use client";
// 출금 화면 — 정상 시나리오는 실 API (POST /api/v1/accounts/1/withdraw),
// 거부 시나리오는 mock (자연 발생 어려운 거부 케이스 시연용 분기 보존).
//
// 시나리오 ID 와 거부 ErrorCode 매핑은 백엔드 ErrorCode 와 1:1.

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { GaugeRow } from "@/components/primitives/GaugeRow";
import { api, ApiError } from "@/api/client";
import type { ChannelGroup } from "@/lib/tokens";

const ACCOUNT_ID = 1;

type Scenario =
  | "none"
  | "insufficient"
  | "limit_transfer"
  | "limit_atm"
  | "fds"
  | "suspended"
  | "td"
  | "invalid";

const SCENARIOS: ReadonlyArray<{ id: Scenario; label: string; channel: ChannelGroup; codeBadge: string }> = [
  { id: "none",           label: "정상",                            channel: "NON_FACE_TO_FACE", codeBadge: "200 OK" },
  { id: "insufficient",   label: "잔액 부족",                       channel: "NON_FACE_TO_FACE", codeBadge: "INSUFFICIENT_BALANCE" },
  { id: "limit_transfer", label: "비대면 한도 초과",                channel: "NON_FACE_TO_FACE", codeBadge: "DAILY_TRANSFER_LIMIT_EXCEEDED" },
  { id: "limit_atm",      label: "ATM 한도 초과",                   channel: "ATM",              codeBadge: "DAILY_ATM_WITHDRAW_LIMIT_EXCEEDED" },
  { id: "fds",            label: "FDS 거부",                         channel: "NON_FACE_TO_FACE", codeBadge: "FRAUD_DETECTION_REJECTED" },
  { id: "suspended",      label: "정지 계좌",                        channel: "NON_FACE_TO_FACE", codeBadge: "ACCOUNT_SUSPENDED_TRANSACTION_BLOCKED" },
  { id: "td",             label: "정기예금 직접 출금",               channel: "NON_FACE_TO_FACE", codeBadge: "TRANSACTION_NOT_ALLOWED_ON_TIME_DEPOSIT" },
  { id: "invalid",        label: "금액 범위 초과",                   channel: "NON_FACE_TO_FACE", codeBadge: "INVALID_TRANSACTION_AMOUNT" },
];

const CURRENT_BALANCE = 2_450_000;
const DAILY_TRANSFER_LIMIT = 5_000_000;
const DAILY_ATM_LIMIT = 1_000_000;
const USED_TRANSFER = 3_000_000;
const USED_ATM = 250_000;

type LiveResult = {
  amount: number;
  balanceAfter: string;
  txnId: number;
  traceId: string | null;
};

export function WithdrawScreen({ initialScenario }: { initialScenario: string }) {
  const [scenario, setScenario] = useState<Scenario>(toScenario(initialScenario));
  const [amount, setAmount] = useState<number>(50_000);
  const [memo, setMemo] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [liveResult, setLiveResult] = useState<LiveResult | null>(null);
  const [liveError, setLiveError] = useState<{ code: string; status: number } | null>(null);

  const def = useMemo(() => SCENARIOS.find((s) => s.id === scenario)!, [scenario]);

  const transferPct = Math.round((USED_TRANSFER / DAILY_TRANSFER_LIMIT) * 100);
  const atmPct      = Math.round((USED_ATM / DAILY_ATM_LIMIT) * 100);
  const projected   = CURRENT_BALANCE - amount;

  function pickAmount(n: number) {
    setAmount(n);
    setSubmitted(false);
    setLiveResult(null);
    setLiveError(null);
  }

  async function submit() {
    if (amount <= 0 || submitting) return;
    if (def.id !== "none") {
      // 거부 시나리오 — mock 분기 (자연 발생 어려운 케이스 시연 보존)
      setSubmitted(true);
      return;
    }
    // 정상 시나리오 — 실 API 호출
    setSubmitting(true);
    setLiveError(null);
    try {
      type TxResp = { id: number; balanceAfter: string; traceId: string | null };
      const resp = await api.post<TxResp>(`/api/v1/accounts/${ACCOUNT_ID}/withdraw`, {
        amount,
        description: memo || undefined,
      });
      setLiveResult({ amount, balanceAfter: resp.balanceAfter, txnId: resp.id, traceId: resp.traceId });
      setSubmitted(true);
    } catch (e) {
      if (e instanceof ApiError) {
        setLiveError({ code: e.code, status: e.status });
      } else {
        setLiveError({ code: "NETWORK_ERROR", status: 0 });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <ScenarioToggle value={scenario} onChange={(s) => {
        setScenario(s);
        setSubmitted(false);
        setLiveResult(null);
        setLiveError(null);
      }} />

      {submitted && liveResult
        ? <LiveSuccess result={liveResult} />
        : submitted && def.id !== "none"
          ? <Rejection scenario={def} amount={amount} />
          : (
            <>
              <AccountCard />
              <AmountInput amount={amount} onPick={pickAmount} onChange={(n) => { setAmount(n); setSubmitted(false); setLiveResult(null); }} />
              <Limits transferPct={transferPct} atmPct={atmPct} channel={def.channel} />
              <MemoInput memo={memo} onChange={setMemo} />
              <Preview projected={projected} />
              {liveError && <LiveErrorBanner code={liveError.code} status={liveError.status} />}
              <button
                onClick={submit}
                disabled={amount <= 0 || submitting}
                className="w-full mt-5 bg-ink text-paper py-4 font-serif text-base disabled:bg-ink-3"
              >
                {submitting ? "처리 중…" : def.id === "none" ? "출금하기 (LIVE)" : "출금하기"}
              </button>
            </>
          )
      }
    </>
  );
}

function LiveSuccess({ result }: { result: LiveResult }) {
  return (
    <div className="border border-rule-strong bg-paper p-8">
      <div className="font-mono text-[11px] tracking-[0.06em] uppercase mb-3" style={{ color: "var(--tx-deposit)" }}>
        200 OK · LIVE · 출금 완료
      </div>
      <div className="font-serif text-[28px] mb-1 leading-tight">출금되었습니다</div>
      <div className="font-sans tnum font-medium text-[40px] tracking-[-0.025em] mb-1">
        −{result.amount.toLocaleString("ko-KR")}<span className="text-ink-3 font-normal text-base ml-1">원</span>
      </div>
      <div className="font-mono text-[11px] text-ink-3 mb-2">
        출금 후 잔액 · {result.balanceAfter}원 (PiiMasker — 거래 영수증 정책)
      </div>
      <div className="font-mono text-[10px] text-ink-3 mb-6 tnum">
        거래 #{result.txnId} · trace_id {result.traceId ?? "—"}
      </div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <Link href={"/customer/history?type=WITHDRAW" as Route} className="border border-ink py-3 text-center font-serif text-sm hover:bg-paper-2">
          거래 내역
        </Link>
        <Link href={"/customer/home" as Route} className="bg-ink text-paper py-3 text-center font-serif text-sm">
          홈으로
        </Link>
      </div>
    </div>
  );
}

function LiveErrorBanner({ code, status }: { code: string; status: number }) {
  return (
    <div className="border-l-2 bg-paper p-3 mt-3" style={{ borderColor: "var(--st-suspended)" }}>
      <div className="font-mono text-[10px] uppercase tracking-[0.04em]" style={{ color: "var(--st-suspended)" }}>
        ✕ {status} {code}
      </div>
      <div className="text-xs text-ink-2 mt-1">
        백엔드가 거래를 거부했습니다. (실제 잔액·한도·계좌 상태 기반 — 시나리오 토글이 아닌 실 데이터)
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function ScenarioToggle({ value, onChange }: { value: Scenario; onChange: (s: Scenario) => void }) {
  return (
    <div className="border border-rule-strong bg-paper p-3 mb-4">
      <Eyebrow className="mb-2">시나리오 토글 · 백엔드 ErrorCode 와 1:1</Eyebrow>
      <div className="flex flex-wrap gap-1">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => onChange(s.id)}
            className={
              "font-mono text-[10px] tracking-[0.02em] px-2 py-1 border " +
              (value === s.id
                ? "bg-ink text-paper border-ink"
                : "bg-paper text-ink-2 border-rule-strong hover:border-ink hover:text-ink")
            }
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function AccountCard() {
  return (
    <section className="border border-rule-strong bg-paper p-4 mb-3">
      <div className="flex items-start justify-between">
        <div>
          <Eyebrow className="mb-1">출금 계좌</Eyebrow>
          <div className="font-serif text-sm font-medium">주거래 통장</div>
          <div className="font-mono text-[11px] text-ink-3 tnum">110-***-7890 · DDA-CHECK</div>
        </div>
        <div className="text-right">
          <Eyebrow className="mb-1">현재 잔액</Eyebrow>
          <div className="font-sans tnum font-medium text-lg">
            {CURRENT_BALANCE.toLocaleString("ko-KR")}<span className="text-ink-3 font-normal text-xs ml-1">원</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function AmountInput({ amount, onPick, onChange }: {
  amount: number;
  onPick: (n: number) => void;
  onChange: (n: number) => void;
}) {
  const presets = [10_000, 50_000, 100_000, 500_000, 1_000_000];
  return (
    <section className="border border-rule-strong bg-paper p-4 mb-3">
      <Eyebrow className="mb-2">출금 금액</Eyebrow>
      <div className="font-sans tnum font-medium text-[40px] tracking-[-0.025em] mb-3">
        <input
          type="text"
          inputMode="numeric"
          value={amount.toLocaleString("ko-KR")}
          onChange={(e) => onChange(Number(e.target.value.replace(/[^\d]/g, "")) || 0)}
          className="bg-transparent border-b border-rule focus:outline-none focus:border-ink w-full"
        />
        <span className="text-ink-3 font-normal text-base ml-1">원</span>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {presets.map((p) => (
          <button
            key={p}
            onClick={() => onPick(p)}
            className={
              "font-mono text-[11px] tnum px-2 py-1 border " +
              (amount === p
                ? "bg-ink text-paper border-ink"
                : "bg-paper text-ink-2 border-rule-strong hover:border-ink hover:text-ink")
            }
          >
            +{p.toLocaleString("ko-KR")}
          </button>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function Limits({ transferPct, atmPct, channel }: {
  transferPct: number;
  atmPct: number;
  channel: ChannelGroup;
}) {
  return (
    <section className="border border-rule-strong bg-paper p-4 mb-3">
      <div className="flex items-center justify-between mb-3">
        <Eyebrow>일일 한도</Eyebrow>
        <span className="font-mono text-[10px] text-ink-3">
          채널: {channel === "NON_FACE_TO_FACE" ? "비대면" : channel === "ATM" ? "ATM" : "대면 (면제)"}
        </span>
      </div>
      <GaugeRow pct={transferPct} label="비대면 (모바일·웹)" exempt={channel === "FACE_TO_FACE" || channel === "BATCH"} />
      <GaugeRow pct={atmPct} label="ATM" exempt={channel === "FACE_TO_FACE" || channel === "BATCH"} />
      <div className="font-mono text-[10px] text-ink-3 mt-2 leading-relaxed">
        BR-TX-90~93 · 영업창구·콜센터는 본인확인 강함으로 면제 (BR-TX-105). SYSTEM/BATCH actor 도 면제 (BR-TX-103·104).
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function MemoInput({ memo, onChange }: { memo: string; onChange: (s: string) => void }) {
  return (
    <section className="border border-rule-strong bg-paper p-4 mb-3">
      <Eyebrow className="mb-2">메모 (선택)</Eyebrow>
      <input
        type="text"
        value={memo}
        onChange={(e) => onChange(e.target.value.slice(0, 32))}
        placeholder="거래내역에 표시될 메모 (최대 32자)"
        className="w-full bg-transparent border-b border-rule focus:outline-none focus:border-ink font-serif text-sm py-1"
      />
      <div className="font-mono text-[10px] text-ink-3 mt-1 text-right tnum">{memo.length}/32</div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function Preview({ projected }: { projected: number }) {
  return (
    <section className="border border-dashed border-rule-strong p-4 mb-2 bg-paper-2">
      <div className="flex justify-between items-baseline">
        <Eyebrow>출금 후 잔액</Eyebrow>
        <span className="font-sans tnum font-medium text-lg">
          {projected.toLocaleString("ko-KR")}<span className="text-ink-3 font-normal text-xs ml-1">원</span>
        </span>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function Success({ amount, balance }: { amount: number; balance: number }) {
  return (
    <div className="border border-rule-strong bg-paper p-8">
      <div className="font-mono text-[11px] tracking-[0.06em] text-ink-3 uppercase mb-3">200 OK · 출금 완료</div>
      <div className="font-serif text-[28px] mb-1 leading-tight">출금되었습니다</div>
      <div className="font-sans tnum font-medium text-[40px] tracking-[-0.025em] mb-1">
        −{amount.toLocaleString("ko-KR")}<span className="text-ink-3 font-normal text-base ml-1">원</span>
      </div>
      <div className="font-mono text-[11px] text-ink-3 mb-6">출금 후 잔액 · {balance.toLocaleString("ko-KR")}원</div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <Link href={"/customer/history?type=WITHDRAW" as Route} className="border border-ink py-3 text-center font-serif text-sm hover:bg-paper-2">
          거래 내역
        </Link>
        <Link href={"/customer/home" as Route} className="bg-ink text-paper py-3 text-center font-serif text-sm">
          홈으로
        </Link>
      </div>
      <button className="w-full border border-rule py-2.5 font-serif text-xs text-ink-2">영수증 다운로드</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function Rejection({ scenario, amount }: { scenario: typeof SCENARIOS[number]; amount: number }) {
  if (scenario.id === "none") return null;
  const detail = REJECTION_DETAIL[scenario.id];
  return (
    <div className="border border-rule-strong bg-paper p-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="font-mono text-[10px] px-1.5 py-px border" style={{ borderColor: "var(--st-suspended)", color: "var(--st-suspended)" }}>
          422
        </span>
        <code className="font-mono text-[11px] font-medium">{scenario.codeBadge}</code>
      </div>
      <div className="font-serif text-[24px] leading-tight mb-2">{detail.title}</div>
      <p className="font-serif text-sm text-ink-2 leading-relaxed mb-4">{detail.body}</p>

      {detail.diagnosis && (
        <div className="border-l-2 pl-3 mb-5" style={{ borderColor: "var(--st-suspended)" }}>
          <Eyebrow className="mb-1">진단</Eyebrow>
          <div className="font-mono text-[11px] tnum text-ink-2">{detail.diagnosis(amount)}</div>
        </div>
      )}

      <div className="flex gap-2">
        {detail.primaryCta && (
          <button className="flex-1 bg-ink text-paper py-3 font-serif text-sm">{detail.primaryCta}</button>
        )}
        {detail.secondaryCta && (
          <button className="flex-1 border border-ink py-3 font-serif text-sm">{detail.secondaryCta}</button>
        )}
      </div>
    </div>
  );
}

const REJECTION_DETAIL: Record<Exclude<Scenario, "none">, {
  title: string;
  body: string;
  diagnosis?: (amount: number) => string;
  primaryCta?: string;
  secondaryCta?: string;
}> = {
  insufficient: {
    title: "잔액이 부족합니다",
    body: "현재 계좌 잔액보다 큰 금액을 출금할 수 없습니다.",
    diagnosis: (amt) => `요청 ${amt.toLocaleString("ko-KR")}원 · 잔액 ${CURRENT_BALANCE.toLocaleString("ko-KR")}원 · 부족 ${(amt - CURRENT_BALANCE).toLocaleString("ko-KR")}원`,
    primaryCta: "금액 줄여 다시 시도",
  },
  limit_transfer: {
    title: "비대면 일일 한도를 초과했습니다",
    body: "오늘 모바일·웹 채널의 누적 출금이 한도에 도달했습니다. 영업창구를 이용하면 한도 면제로 즉시 처리됩니다 (본인확인 강함).",
    diagnosis: (amt) => `누적 ${USED_TRANSFER.toLocaleString("ko-KR")}원 + 신규 ${amt.toLocaleString("ko-KR")}원 > 한도 ${DAILY_TRANSFER_LIMIT.toLocaleString("ko-KR")}원`,
    primaryCta: "영업창구 안내",
    secondaryCta: "내일 다시 시도",
  },
  limit_atm: {
    title: "ATM 일일 한도를 초과했습니다",
    body: "ATM 채널의 일일 누적 출금이 한도에 도달했습니다. 비대면(모바일·웹) 또는 영업창구는 별개 한도로 가능합니다.",
    diagnosis: (amt) => `누적 ${USED_ATM.toLocaleString("ko-KR")}원 + 신규 ${amt.toLocaleString("ko-KR")}원 > 한도 ${DAILY_ATM_LIMIT.toLocaleString("ko-KR")}원`,
    primaryCta: "비대면으로 출금",
    secondaryCta: "영업창구 안내",
  },
  fds: {
    title: "이상 거래 감지로 거부되었습니다",
    body: "단기간 다회 송금 패턴이 감지되었습니다. 본인이 진행한 거래라면 영업창구나 고객센터를 통해 처리할 수 있습니다.",
    diagnosis: () => "reasonCode: VELOCITY_SHORT_WINDOW · score: 0.87 · summary: 30분 내 5회 이상 출금 시도",
    primaryCta: "고객센터 연결",
    secondaryCta: "다시 시도",
  },
  suspended: {
    title: "계좌가 일시 정지되었습니다",
    body: "본 계좌는 컴플라이언스 사유로 일시 정지된 상태입니다. 영업창구에서 사유 확인 후 해제 가능합니다.",
    diagnosis: () => "사유 코드: SUSPENDED_BY_COMPLIANCE · 일시: 2026-04-12 14:32 KST",
    primaryCta: "영업창구 안내",
  },
  td: {
    title: "정기예금에서는 직접 출금할 수 없습니다",
    body: "정기예금 자금은 만기 또는 중도 해지를 통해서만 결제 DDA로 이동합니다. 직접 출금 경로는 차단됩니다.",
    primaryCta: "중도 해지 시뮬레이션",
    secondaryCta: "만기 영수증 보기",
  },
  invalid: {
    title: "거래 금액이 올바르지 않습니다",
    body: "단일 거래 금액은 1원 이상 10억원 이하여야 합니다.",
    diagnosis: (amt) => `요청 ${amt.toLocaleString("ko-KR")}원 · 허용 1 ~ 1,000,000,000원`,
    primaryCta: "금액 수정",
  },
};

function toScenario(s: string): Scenario {
  const known: Scenario[] = ["none", "insufficient", "limit_transfer", "limit_atm", "fds", "suspended", "td", "invalid"];
  return (known.includes(s as Scenario) ? s : "none") as Scenario;
}
