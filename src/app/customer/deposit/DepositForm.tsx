"use client";
// 입금 폼 — 실 백엔드 호출 (POST /api/v1/accounts/1/deposit).
// 한도 가드 면제 (BR-TX-90). 검증은 INVALID_TRANSACTION_AMOUNT 1원~10억원만.

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { api, ApiError } from "@/api/client";

const ACCOUNT_ID = 1;
const ACCOUNT = { alias: "주거래 통장", number: "110-***-7890" };
const MAX_AMOUNT = 1_000_000_000;

type ReceiptData = {
  amount: number;
  balanceAfter: string;       // 백엔드 마스킹 그대로 (TransactionResponse 정책)
  memo: string;
  txnId: number;
  traceId: string | null;
};

export function DepositForm() {
  const [amount, setAmount] = useState(100_000);
  const [memo, setMemo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [error, setError] = useState<{ code: string; status: number } | null>(null);

  const invalid = amount <= 0 || amount > MAX_AMOUNT;

  async function submit() {
    if (invalid || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      type TxResp = {
        id: number;
        amount: string;
        balanceAfter: string;
        traceId: string | null;
      };
      const resp = await api.post<TxResp>(`/api/v1/accounts/${ACCOUNT_ID}/deposit`, {
        amount,
        description: memo || undefined,
      });
      setReceipt({
        amount,
        balanceAfter: resp.balanceAfter,
        memo,
        txnId: resp.id,
        traceId: resp.traceId,
      });
    } catch (e) {
      if (e instanceof ApiError) {
        setError({ code: e.code, status: e.status });
      } else {
        setError({ code: "NETWORK_ERROR", status: 0 });
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (receipt) return <Receipt data={receipt} />;

  return (
    <>
      <section className="border border-rule-strong bg-paper p-4 mb-3">
        <div className="flex items-start justify-between">
          <div>
            <Eyebrow className="mb-1">입금 계좌</Eyebrow>
            <div className="font-serif text-sm font-medium">{ACCOUNT.alias}</div>
            <div className="font-mono text-[11px] text-ink-3 tnum">{ACCOUNT.number} · DDA001</div>
          </div>
          <div className="text-right">
            <Eyebrow className="mb-1">계좌 ID</Eyebrow>
            <div className="font-mono tnum text-sm">#{ACCOUNT_ID}</div>
          </div>
        </div>
      </section>

      <section className="border border-rule-strong bg-paper p-4 mb-3">
        <Eyebrow className="mb-2">입금 금액</Eyebrow>
        <div className="font-sans tnum font-medium text-[40px] tracking-[-0.025em] mb-3">
          <input
            type="text"
            inputMode="numeric"
            value={amount.toLocaleString("ko-KR")}
            onChange={(e) => setAmount(Number(e.target.value.replace(/[^\d]/g, "")) || 0)}
            className={
              "bg-transparent border-b focus:outline-none w-full " +
              (invalid && amount > 0 ? "border-st-suspended" : "border-rule focus:border-ink")
            }
          />
          <span className="text-ink-3 font-normal text-base ml-1">원</span>
        </div>
        {invalid && amount > 0 && (
          <div
            className="font-mono text-[10px] uppercase tracking-[0.04em] mb-2"
            style={{ color: "var(--st-suspended)" }}
          >
            ✕ 422 INVALID_TRANSACTION_AMOUNT · 1원 ~ {MAX_AMOUNT.toLocaleString("ko-KR")}원 범위
          </div>
        )}
        <div className="flex gap-1.5 flex-wrap">
          {[10_000, 50_000, 100_000, 500_000, 1_000_000].map((p) => (
            <button
              key={p}
              onClick={() => setAmount(p)}
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

      <section className="border border-rule-strong bg-paper p-4 mb-3">
        <Eyebrow className="mb-2">메모 (선택)</Eyebrow>
        <input
          type="text"
          value={memo}
          onChange={(e) => setMemo(e.target.value.slice(0, 32))}
          placeholder="거래 내역에 표시될 메모 (최대 32자)"
          className="w-full bg-transparent border-b border-rule focus:outline-none focus:border-ink font-serif text-sm py-1"
        />
        <div className="font-mono text-[10px] text-ink-3 mt-1 text-right tnum">{memo.length}/32</div>
      </section>

      <section className="border-l-2 bg-paper p-3 mb-4" style={{ borderColor: "var(--tx-deposit)" }}>
        <div className="font-mono text-[10px] uppercase tracking-[0.04em]" style={{ color: "var(--tx-deposit)" }}>
          한도 가드 면제
        </div>
        <div className="text-xs text-ink-2 leading-relaxed mt-1">
          입금은 출금성 거래가 아니므로 일일 한도 산정에서 제외됩니다 (BR-TX-90).
        </div>
      </section>

      {error && <ErrorBanner code={error.code} status={error.status} />}

      <button
        onClick={submit}
        disabled={invalid || submitting}
        className="w-full bg-ink text-paper py-4 font-serif text-base disabled:bg-ink-3"
      >
        {submitting ? "처리 중…" : "입금하기"}
      </button>
    </>
  );
}

function ErrorBanner({ code, status }: { code: string; status: number }) {
  return (
    <div className="border-l-2 bg-paper p-3 mb-3" style={{ borderColor: "var(--st-suspended)" }}>
      <div className="font-mono text-[10px] uppercase tracking-[0.04em]" style={{ color: "var(--st-suspended)" }}>
        ✕ {status} {code}
      </div>
      <div className="text-xs text-ink-2 mt-1">
        백엔드가 거래를 거부했습니다. 금액·계좌 상태 확인 후 다시 시도하세요.
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function Receipt({ data }: { data: ReceiptData }) {
  return (
    <div className="border border-rule-strong bg-paper p-6">
      <div className="font-mono text-[11px] tracking-[0.06em] text-ink-3 uppercase mb-3">200 OK · 입금 완료</div>
      <div className="font-serif text-[28px] mb-1 leading-tight">입금되었습니다</div>
      <div
        className="font-sans tnum font-medium text-[40px] tracking-[-0.025em] mb-1"
        style={{ color: "var(--tx-deposit)" }}
      >
        +{data.amount.toLocaleString("ko-KR")}<span className="text-ink-3 font-normal text-base ml-1">원</span>
      </div>
      <div className="font-mono text-[11px] text-ink-3 mb-5">
        입금 후 잔액 · {data.balanceAfter}원 (PiiMasker 마스킹 — 거래 영수증 정책)
      </div>

      <div className="border-t border-dashed border-rule pt-4 mb-5">
        <div className="grid grid-cols-2 gap-4 font-mono text-[11px]">
          <div>
            <div className="text-ink-3 mb-0.5">계좌</div>
            <div className="tnum">{ACCOUNT.number}</div>
          </div>
          <div>
            <div className="text-ink-3 mb-0.5">메모</div>
            <div>{data.memo || "—"}</div>
          </div>
          <div>
            <div className="text-ink-3 mb-0.5">거래 ID</div>
            <div className="tnum">#{data.txnId}</div>
          </div>
          <div>
            <div className="text-ink-3 mb-0.5">trace_id</div>
            <div className="tnum break-all">{data.traceId ?? "—"}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-2">
        <Link href={"/customer/history?type=DEPOSIT" as Route} className="border border-ink py-3 text-center font-serif text-sm hover:bg-paper-2">
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
