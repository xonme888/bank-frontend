"use client";
// 정기예금 시뮬레이터 — 슬라이더·기간 토글·실시간 계산·결제 DDA 선택.

import { useMemo, useState } from "react";
import { Eyebrow } from "@/components/primitives/Eyebrow";

const PRODUCTS = [
  { code: "TDA-12M", name: "12개월 정기예금",     baseRate: 3.00, preferred: 0.50 },
  { code: "TDA-24M", name: "24개월 정기예금",     baseRate: 3.30, preferred: 0.40 },
  { code: "TDA-36M", name: "36개월 정기예금",     baseRate: 3.50, preferred: 0.30 },
] as const;

const PERIODS_BY_CODE: Record<string, ReadonlyArray<number>> = {
  "TDA-12M": [6, 12],
  "TDA-24M": [12, 18, 24],
  "TDA-36M": [24, 36],
};

const SETTLEMENT_DDAS = [
  { id: 1, alias: "주거래 통장",   number: "110-***-7890", status: "ACTIVE" },
  { id: 2, alias: "비상금 통장",   number: "110-***-2381", status: "ACTIVE" },
  { id: 3, alias: "월급 통장",     number: "110-***-9054", status: "EDD_PENDING", disabled: true },
];

const TAX_RATE = 0.154;     // 14% 소득세 + 1.4% 지방소득세

export function TimeDepositSimulator() {
  const [productCode, setProductCode] = useState<string>(PRODUCTS[0].code);
  const [amount, setAmount] = useState(10_000_000);
  const [periodMonths, setPeriodMonths] = useState(12);
  const [settlementId, setSettlementId] = useState<number>(1);
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const product = PRODUCTS.find((p) => p.code === productCode)!;
  const allowedPeriods = PERIODS_BY_CODE[productCode];
  const effectivePeriod = allowedPeriods.includes(periodMonths) ? periodMonths : allowedPeriods[0];
  const rate = product.baseRate + product.preferred;

  const calc = useMemo(() => {
    const interest = Math.round(amount * (rate / 100) * (effectivePeriod / 12));
    const tax = Math.round(interest * TAX_RATE);
    const net = interest - tax;
    return { interest, tax, net, total: amount + net };
  }, [amount, rate, effectivePeriod]);

  if (submitted) return <Submitted product={product} amount={amount} period={effectivePeriod} settlement={SETTLEMENT_DDAS.find((s) => s.id === settlementId)!} calc={calc} />;

  return (
    <>
      <ProductPicker
        products={PRODUCTS}
        active={productCode}
        onChange={(c) => {
          setProductCode(c);
          setPeriodMonths(PERIODS_BY_CODE[c][0]);
        }}
      />

      <section className="border border-rule-strong bg-paper p-4 mb-3">
        <Eyebrow className="mb-2">가입 금액</Eyebrow>
        <input
          type="text"
          inputMode="numeric"
          value={amount.toLocaleString("ko-KR")}
          onChange={(e) => setAmount(Number(e.target.value.replace(/[^\d]/g, "")) || 0)}
          className="w-full font-sans tnum font-medium text-[36px] tracking-[-0.025em] bg-transparent border-b border-rule focus:outline-none focus:border-ink mb-1"
        />
        <input
          type="range"
          min={1_000_000}
          max={100_000_000}
          step={1_000_000}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full mt-2 accent-ink"
        />
        <div className="flex justify-between font-mono text-[10px] text-ink-3 mt-1 tnum">
          <span>1,000,000원</span>
          <span>100,000,000원</span>
        </div>
      </section>

      <section className="border border-rule-strong bg-paper p-4 mb-3">
        <Eyebrow className="mb-2">기간 · 개월</Eyebrow>
        <div className="flex gap-1.5 flex-wrap">
          {allowedPeriods.map((m) => (
            <button
              key={m}
              onClick={() => setPeriodMonths(m)}
              className={
                "font-mono text-[11px] tnum px-3 py-1.5 border " +
                (effectivePeriod === m
                  ? "bg-ink text-paper border-ink"
                  : "bg-paper text-ink-2 border-rule-strong hover:border-ink hover:text-ink")
              }
            >
              {m}개월
            </button>
          ))}
        </div>
        <div className="font-mono text-[10px] text-ink-3 mt-2 tnum">
          연 {rate.toFixed(2)}% (기본 {product.baseRate.toFixed(2)}% + 우대 {product.preferred.toFixed(2)}%)
        </div>
      </section>

      <ResultCard amount={amount} calc={calc} period={effectivePeriod} />

      <section className="border border-rule-strong bg-paper p-4 mb-3">
        <div className="flex items-center justify-between mb-2">
          <Eyebrow>결제 DDA</Eyebrow>
          <span className="font-mono text-[10px] text-st-suspended">1회 등록 후 변경 불가</span>
        </div>
        <ul className="space-y-1">
          {SETTLEMENT_DDAS.map((d) => (
            <li key={d.id}>
              <button
                onClick={() => !d.disabled && setSettlementId(d.id)}
                disabled={d.disabled}
                className={
                  "w-full text-left flex items-center justify-between px-3 py-2 border " +
                  (settlementId === d.id
                    ? "bg-ink text-paper border-ink"
                    : d.disabled
                      ? "bg-paper-2 text-ink-3 border-rule cursor-not-allowed"
                      : "bg-paper text-ink-2 border-rule-strong hover:border-ink")
                }
              >
                <span className="font-serif text-sm">{d.alias}</span>
                <span className="font-mono text-[11px] tnum">
                  {d.number}{d.disabled && " · EDD 대기"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="border border-rule-strong bg-paper p-4 mb-4">
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 accent-ink"
          />
          <span className="text-sm text-ink-2 leading-relaxed">
            <span className="font-medium text-ink">필수 약관 동의</span> ·
            상품설명서 / 중도해지율표 / 개인정보처리방침 / 결제 DDA 자동입금 안내
          </span>
        </label>
      </section>

      <button
        onClick={() => agreed && setSubmitted(true)}
        disabled={!agreed || amount <= 0}
        className="w-full bg-ink text-paper py-4 font-serif text-base disabled:bg-ink-3"
      >
        가입하기
      </button>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function ProductPicker({ products, active, onChange }: {
  products: ReadonlyArray<typeof PRODUCTS[number]>;
  active: string;
  onChange: (code: string) => void;
}) {
  return (
    <section className="mb-3">
      <Eyebrow className="mb-2">상품</Eyebrow>
      <div className="grid grid-cols-3 gap-2">
        {products.map((p) => (
          <button
            key={p.code}
            onClick={() => onChange(p.code)}
            className={
              "p-3 text-left border " +
              (active === p.code
                ? "bg-ink text-paper border-ink"
                : "bg-paper text-ink-2 border-rule-strong hover:border-ink hover:text-ink")
            }
          >
            <div className="font-mono text-[10px] tracking-[0.04em] uppercase mb-1 opacity-70">{p.code}</div>
            <div className="font-serif text-sm font-medium leading-tight mb-1">{p.name}</div>
            <div className="font-mono text-[11px] tnum">
              연 {(p.baseRate + p.preferred).toFixed(2)}%
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function ResultCard({ amount, calc, period }: {
  amount: number;
  calc: { interest: number; tax: number; net: number; total: number };
  period: number;
}) {
  return (
    <section className="border-2 border-ink bg-paper p-5 mb-3">
      <Eyebrow className="mb-3">예상 만기 수령액 · {period}개월 후</Eyebrow>
      <div className="font-sans tnum font-medium text-[44px] tracking-[-0.025em] leading-none mb-3">
        {calc.total.toLocaleString("ko-KR")}<span className="text-ink-3 font-normal text-base ml-1">원</span>
      </div>
      <table className="w-full font-mono text-[11px] tnum">
        <tbody>
          <tr className="border-t border-rule">
            <td className="py-1.5 text-ink-3">원금</td>
            <td className="py-1.5 text-right">{amount.toLocaleString("ko-KR")}원</td>
          </tr>
          <tr className="border-t border-rule">
            <td className="py-1.5 text-ink-3">세전 이자</td>
            <td className="py-1.5 text-right">+{calc.interest.toLocaleString("ko-KR")}원</td>
          </tr>
          <tr className="border-t border-rule">
            <td className="py-1.5 text-ink-3">세금 (15.4%)</td>
            <td className="py-1.5 text-right">−{calc.tax.toLocaleString("ko-KR")}원</td>
          </tr>
          <tr className="border-t border-ink font-medium">
            <td className="py-1.5">실수령 이자</td>
            <td className="py-1.5 text-right">+{calc.net.toLocaleString("ko-KR")}원</td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function Submitted({ product, amount, period, settlement, calc }: {
  product: typeof PRODUCTS[number];
  amount: number;
  period: number;
  settlement: typeof SETTLEMENT_DDAS[number];
  calc: { interest: number; tax: number; net: number; total: number };
}) {
  return (
    <div className="border border-rule-strong bg-paper p-6">
      <div className="font-mono text-[11px] tracking-[0.06em] text-ink-3 uppercase mb-3">200 OK · 가입 완료</div>
      <div className="font-serif text-[28px] mb-1 leading-tight">{product.name}이 개설되었습니다</div>
      <div className="font-mono text-[11px] text-ink-3 mb-5">{product.code} · 연 {(product.baseRate + product.preferred).toFixed(2)}% · {period}개월</div>

      <div className="border-t border-dashed border-rule pt-4 mb-4">
        <Eyebrow className="mb-2">결제 DDA · 만기·해지 시 자동입금</Eyebrow>
        <div className="font-serif text-sm">{settlement.alias}</div>
        <div className="font-mono text-[11px] text-ink-3 tnum">{settlement.number}</div>
      </div>

      <div className="border-t border-dashed border-rule pt-4 mb-5">
        <div className="flex justify-between mb-1">
          <span className="font-mono text-[11px] text-ink-3">예상 만기 수령액</span>
          <span className="font-sans tnum font-medium text-lg">
            {calc.total.toLocaleString("ko-KR")}<span className="text-ink-3 font-normal text-xs ml-1">원</span>
          </span>
        </div>
        <div className="flex justify-between font-mono text-[11px] text-ink-3 tnum">
          <span>= 원금 {amount.toLocaleString("ko-KR")}</span>
          <span>+ 실수령 이자 {calc.net.toLocaleString("ko-KR")}</span>
        </div>
      </div>

      <button className="w-full border border-ink py-3 font-serif text-sm">정기예금 상세 보기</button>
    </div>
  );
}
