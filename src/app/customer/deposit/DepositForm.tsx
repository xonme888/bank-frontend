"use client";
// 입금 폼 — 금액·메모·미리보기·영수증.
// 한도 가드 면제 (BR-TX-90). 검증은 INVALID_TRANSACTION_AMOUNT 1원~10억원만.

import { useState } from "react";
import { Eyebrow } from "@/components/primitives/Eyebrow";

const ACCOUNT = { alias: "주거래 통장", number: "110-***-7890", balance: 2_450_000 };
const MAX_AMOUNT = 1_000_000_000;

export function DepositForm() {
  const [amount, setAmount] = useState(100_000);
  const [memo, setMemo] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const invalid = amount <= 0 || amount > MAX_AMOUNT;
  const projected = ACCOUNT.balance + amount;

  if (submitted) return <Receipt amount={amount} balance={projected} memo={memo} />;

  return (
    <>
      <section className="border border-rule-strong bg-paper p-4 mb-3">
        <div className="flex items-start justify-between">
          <div>
            <Eyebrow className="mb-1">입금 계좌</Eyebrow>
            <div className="font-serif text-sm font-medium">{ACCOUNT.alias}</div>
            <div className="font-mono text-[11px] text-ink-3 tnum">{ACCOUNT.number} · DDA-CHECK</div>
          </div>
          <div className="text-right">
            <Eyebrow className="mb-1">현재 잔액</Eyebrow>
            <div className="font-sans tnum font-medium text-lg">
              {ACCOUNT.balance.toLocaleString("ko-KR")}<span className="text-ink-3 font-normal text-xs ml-1">원</span>
            </div>
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

      <section className="border border-dashed border-rule-strong p-4 mb-2 bg-paper-2">
        <div className="flex justify-between items-baseline mb-1">
          <Eyebrow>입금 후 잔액</Eyebrow>
          <span className="font-sans tnum font-medium text-lg" style={{ color: "var(--tx-deposit)" }}>
            {projected.toLocaleString("ko-KR")}<span className="text-ink-3 font-normal text-xs ml-1">원</span>
          </span>
        </div>
        <div className="font-mono text-[10px] text-ink-3 tnum">
          {ACCOUNT.balance.toLocaleString("ko-KR")} + {amount.toLocaleString("ko-KR")}
        </div>
      </section>

      <section className="border-l-2 bg-paper p-3 mb-4" style={{ borderColor: "var(--tx-deposit)" }}>
        <div className="font-mono text-[10px] uppercase tracking-[0.04em]" style={{ color: "var(--tx-deposit)" }}>
          한도 가드 면제
        </div>
        <div className="text-xs text-ink-2 leading-relaxed mt-1">
          입금은 출금성 거래가 아니므로 일일 한도 산정에서 제외됩니다 (BR-TX-90).
        </div>
      </section>

      <button
        onClick={() => !invalid && setSubmitted(true)}
        disabled={invalid}
        className="w-full bg-ink text-paper py-4 font-serif text-base disabled:bg-ink-3"
      >
        입금하기
      </button>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function Receipt({ amount, balance, memo }: { amount: number; balance: number; memo: string }) {
  return (
    <div className="border border-rule-strong bg-paper p-6">
      <div className="font-mono text-[11px] tracking-[0.06em] text-ink-3 uppercase mb-3">200 OK · 입금 완료</div>
      <div className="font-serif text-[28px] mb-1 leading-tight">입금되었습니다</div>
      <div
        className="font-sans tnum font-medium text-[40px] tracking-[-0.025em] mb-1"
        style={{ color: "var(--tx-deposit)" }}
      >
        +{amount.toLocaleString("ko-KR")}<span className="text-ink-3 font-normal text-base ml-1">원</span>
      </div>
      <div className="font-mono text-[11px] text-ink-3 mb-5">
        입금 후 잔액 · {balance.toLocaleString("ko-KR")}원
      </div>

      <div className="border-t border-dashed border-rule pt-4 mb-5">
        <div className="grid grid-cols-2 gap-4 font-mono text-[11px]">
          <div>
            <div className="text-ink-3 mb-0.5">계좌</div>
            <div className="tnum">{ACCOUNT.number}</div>
          </div>
          <div>
            <div className="text-ink-3 mb-0.5">메모</div>
            <div>{memo || "—"}</div>
          </div>
          <div>
            <div className="text-ink-3 mb-0.5">유형</div>
            <div style={{ color: "var(--tx-deposit)" }}>DEPOSIT</div>
          </div>
          <div>
            <div className="text-ink-3 mb-0.5">채널</div>
            <div>MOBILE · CUSTOMER</div>
          </div>
        </div>
      </div>

      <button className="w-full border border-ink py-3 font-serif text-sm">영수증 다운로드</button>
    </div>
  );
}
