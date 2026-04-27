"use client";
// 정기예금 시뮬레이터 — 슬라이더로 실시간 만기 수령액 + 가입 LIVE.
//
// 가입 LIVE 흐름 (정상 시나리오만):
//   1. POST /api/v1/time-deposits  (KYC + 약관 + 결제 DDA + CDD)
//   2. POST /api/v1/time-deposits/{id}/deposit  (자금 입금 → ACTIVE 전이)
// 백엔드 KYC stub: customerName 이 "KYC실패검증" 이 아니면 통과 (StubKycVerifier).
// 거부 케이스 (한도 초과·결제 DDA 비활성 등) 는 백엔드가 422 반환 → ApiError 분기.

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { api, ApiError } from "@/api/client";

// 화면 표기 vs 백엔드 productCode 분리 — 백엔드는 TDA001 단일, 화면 라벨만 차별
type ProductCard = {
  id: string;            // 화면 식별
  backendCode: string;   // 백엔드 productCode
  name: string;
  baseRate: number;
  preferred: number;
};

const PRODUCTS: ReadonlyArray<ProductCard> = [
  { id: "12M", backendCode: "TDA001", name: "12개월 정기예금", baseRate: 3.00, preferred: 0.50 },
  { id: "24M", backendCode: "TDA001", name: "24개월 정기예금", baseRate: 3.30, preferred: 0.40 },
  { id: "36M", backendCode: "TDA001", name: "36개월 정기예금", baseRate: 3.50, preferred: 0.30 },
];

const PERIODS_BY_ID: Record<string, ReadonlyArray<number>> = {
  "12M": [6, 12],
  "24M": [12, 18, 24],
  "36M": [24, 36],
};

// 시드된 DDA 와 정합 (DemoSeeder 결과)
const SETTLEMENT_DDAS = [
  { id: 1, alias: "주거래 통장",   number: "110-***-7890", status: "ACTIVE" },
  { id: 2, alias: "이체 수취 통장", number: "110-***-1199", status: "ACTIVE" },
  { id: 3, alias: "월급 통장",     number: "110-***-9054", status: "EDD_PENDING", disabled: true },
];

const TAX_RATE = 0.154;     // 14% 소득세 + 1.4% 지방소득세

// 백엔드 KYC stub 통과 + 도메인 검증 통과 fixture
const CDD_FIXTURE = {
  customerName: "김개발",
  birthDate: "1990-01-01",
  idType: "RESIDENT_CARD" as const,
  idNumber: "900101-1234567",
  idIssueDate: "2020-01-01",
  occupation: "EMPLOYEE" as const,
  workplace: "xbank",
  transactionPurpose: "SAVINGS" as const,
  fundSource: "EARNED_INCOME" as const,
  expectedMonthlyTx: "_1M_TO_5M" as const,
};

const TERMS_CONSENTS = [
  { type: "DEPOSIT_BASIC", version: "v1.0" },
  { type: "PII_USE", version: "v1.0" },
  { type: "CREDIT_INFO", version: "v1.0" },
  { type: "TIME_DEPOSIT_BASIC", version: "v1.0" },
  { type: "TIME_DEPOSIT_INTEREST", version: "v1.0" },
];

type LiveResult = {
  timeDepositId: number;
  productCode: string;
  termMonths: number;
  principal: number;
  rate: number;
  maturityDate: string;
  accountNumber: string;
};

export function TimeDepositSimulator() {
  const [productId, setProductId] = useState<string>(PRODUCTS[0].id);
  const [amount, setAmount] = useState(10_000_000);
  const [periodMonths, setPeriodMonths] = useState(12);
  const [settlementId, setSettlementId] = useState<number>(1);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [liveResult, setLiveResult] = useState<LiveResult | null>(null);
  const [liveError, setLiveError] = useState<{ code: string; status: number } | null>(null);

  const product = PRODUCTS.find((p) => p.id === productId)!;
  const allowedPeriods = PERIODS_BY_ID[productId];
  const effectivePeriod = allowedPeriods.includes(periodMonths) ? periodMonths : allowedPeriods[0];
  const rate = product.baseRate + product.preferred;

  const calc = useMemo(() => {
    const interest = Math.round(amount * (rate / 100) * (effectivePeriod / 12));
    const tax = Math.round(interest * TAX_RATE);
    const net = interest - tax;
    return { interest, tax, net, total: amount + net };
  }, [amount, rate, effectivePeriod]);

  async function submit() {
    if (!agreed || amount <= 0 || submitting) return;
    setSubmitting(true);
    setLiveError(null);
    try {
      // 1. 정기예금 약정 (PENDING)
      type OpenResp = {
        id: number;
        productCode: string;
        accountNumber: string;
        termMonths: number;
        principalAmount: number;
        contractRatePerAnnum: number | string;
        maturityDate: string;
      };
      const opened = await api.post<OpenResp>(`/api/v1/time-deposits`, {
        customerId: 1,
        productCode: product.backendCode,
        term: `MONTHS_${effectivePeriod}`,
        principalAmount: amount,
        autoRenewal: false,
        settlementAccountId: settlementId,
        cdd: CDD_FIXTURE,
        termsConsents: TERMS_CONSENTS,
      });

      // 2. 자금 입금 → ACTIVE 전이
      await api.post(`/api/v1/time-deposits/${opened.id}/deposit`, {
        amount,
      });

      setLiveResult({
        timeDepositId: opened.id,
        productCode: opened.productCode,
        termMonths: opened.termMonths,
        principal: opened.principalAmount,
        rate: typeof opened.contractRatePerAnnum === "string"
          ? parseFloat(opened.contractRatePerAnnum)
          : opened.contractRatePerAnnum,
        maturityDate: opened.maturityDate,
        accountNumber: opened.accountNumber,
      });
    } catch (e) {
      if (e instanceof ApiError) setLiveError({ code: e.code, status: e.status });
      else setLiveError({ code: "NETWORK_ERROR", status: 0 });
    } finally {
      setSubmitting(false);
    }
  }

  if (liveResult) {
    const settlement = SETTLEMENT_DDAS.find((s) => s.id === settlementId)!;
    return <LiveDone result={liveResult} settlement={settlement} calc={calc} />;
  }

  return (
    <>
      <ProductPicker
        products={PRODUCTS}
        active={productId}
        onChange={(c) => {
          setProductId(c);
          setPeriodMonths(PERIODS_BY_ID[c][0]);
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

      {liveError && (
        <div className="border-l-2 bg-paper p-3 mb-4" style={{ borderColor: "var(--st-suspended)" }}>
          <div className="font-mono text-[10px] uppercase tracking-[0.04em]" style={{ color: "var(--st-suspended)" }}>
            ✕ {liveError.status} {liveError.code}
          </div>
          <div className="text-xs text-ink-2 mt-1">
            {liveError.code === "TIME_DEPOSIT_AMOUNT_OUT_OF_RANGE"
              ? "가입 금액이 허용 범위(1M~500M)를 벗어났습니다."
              : liveError.code === "INVALID_SETTLEMENT_ACCOUNT"
                ? "결제 DDA 가 ACTIVE 상태가 아닙니다."
                : "백엔드가 가입을 거부했습니다."}
          </div>
        </div>
      )}

      <button
        onClick={submit}
        disabled={!agreed || amount <= 0 || submitting}
        className="w-full bg-ink text-paper py-4 font-serif text-base disabled:bg-ink-3"
      >
        {submitting ? "가입 중… (KYC + 자금 입금 2단계)" : "가입하기 (LIVE)"}
      </button>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function ProductPicker({ products, active, onChange }: {
  products: ReadonlyArray<ProductCard>;
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <section className="mb-3">
      <Eyebrow className="mb-2">상품</Eyebrow>
      <div className="grid grid-cols-3 gap-2">
        {products.map((p) => (
          <button
            key={p.id}
            onClick={() => onChange(p.id)}
            className={
              "p-3 text-left border " +
              (active === p.id
                ? "bg-ink text-paper border-ink"
                : "bg-paper text-ink-2 border-rule-strong hover:border-ink hover:text-ink")
            }
          >
            <div className="font-mono text-[10px] tracking-[0.04em] uppercase mb-1 opacity-70">{p.backendCode} · {p.id}</div>
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
function LiveDone({ result, settlement, calc }: {
  result: LiveResult;
  settlement: typeof SETTLEMENT_DDAS[number];
  calc: { net: number; total: number };
}) {
  return (
    <div className="border border-rule-strong bg-paper p-6">
      <div className="font-mono text-[11px] tracking-[0.06em] uppercase mb-3" style={{ color: "var(--tx-deposit)" }}>
        201 CREATED · LIVE · 정기예금 가입 완료
      </div>
      <div className="font-serif text-[28px] mb-1 leading-tight">
        {result.termMonths}개월 정기예금이 개설되었습니다
      </div>
      <div className="font-mono text-[11px] text-ink-3 mb-1">
        #{result.timeDepositId} · {result.productCode} · 연 {result.rate.toFixed(2)}% · 만기 {result.maturityDate}
      </div>
      <div className="font-mono text-[11px] text-ink-3 mb-5 tnum">계좌번호 {result.accountNumber}</div>

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
          <span>= 원금 {result.principal.toLocaleString("ko-KR")}</span>
          <span>+ 실수령 이자 {calc.net.toLocaleString("ko-KR")}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Link href={"/customer/home" as Route} className="border border-ink py-3 text-center font-serif text-sm hover:bg-paper-2">
          홈에서 카드 확인
        </Link>
        <Link href={"/customer/receipt" as Route} className="bg-ink text-paper py-3 text-center font-serif text-sm">
          만기 영수증 미리보기
        </Link>
      </div>
    </div>
  );
}
