// 화면 6 — 만기 영수증.
//
// IA 매핑 (docs/ux/screen-ia.md §화면 6):
//   상단 일러스트(영수증 페이퍼) · 상품 정보 · 금액 분해(원금+이자-세금=실수령) ·
//   결제 DDA 안내 · 거래 링크(MATURITY_PAYOUT) · PDF 다운로드 · 다시 가입 CTA

import Link from "next/link";
import type { Route } from "next";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { PageEyebrow } from "@/components/chrome/PageEyebrow";

const RECEIPT = {
  productCode: "TDA-12M",
  productName: "12개월 정기예금",
  startedAt: "2025-04-27",
  maturedAt: "2026-04-27",
  rate: 3.50,
  principal: 10_000_000,
  interestGross: 350_000,
  tax: 53_900,
  interestNet: 296_100,
  settlement: { alias: "주거래 통장", number: "110-***-7890" },
  txnId: "TX-MAT-2026-04-27-A91F",
  groupId: undefined,
  channel: "BATCH",
  actor: "SYSTEM",
};

export default function Page() {
  const total = RECEIPT.principal + RECEIPT.interestNet;
  return (
    <div className="bg-paper-2 min-h-[calc(100vh-58px)]">
      <div className="mx-auto max-w-[640px] p-6 pb-16">
        <PageEyebrow screenId="receipt" />
        <h1 className="font-serif text-[40px] leading-[1.1] font-medium tracking-[-0.025em] mb-2">
          만기 영수증
        </h1>
        <p className="font-serif text-sm text-ink-2 max-w-[480px] mb-6 leading-relaxed">
          만기 도래 시 시스템(SYSTEM/BATCH)이 결제 DDA로 자동 입금. 거래 유형은
          <code className="font-mono text-xs bg-paper px-1.5 mx-1">MATURITY_PAYOUT</code>으로 기록.
        </p>

        <ReceiptHero total={total} />
        <ProductInfo />
        <AmountBreakdown />
        <SettlementInfo />
        <ActionsBar />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function ReceiptHero({ total }: { total: number }) {
  return (
    <section className="border-2 border-ink bg-paper p-6 mb-3 relative overflow-hidden">
      <Punches />
      <div className="font-mono text-[11px] tracking-[0.06em] text-ink-3 uppercase mb-3">실수령액</div>
      <div className="font-sans tnum font-medium text-[48px] tracking-[-0.025em] leading-none mb-2">
        {total.toLocaleString("ko-KR")}<span className="text-ink-3 font-normal text-base ml-1">원</span>
      </div>
      <div className="font-mono text-[11px] text-ink-3">
        만기 {RECEIPT.maturedAt} · 결제 DDA로 자동 입금 완료
      </div>
    </section>
  );
}

function Punches() {
  // 영수증 페이퍼 모티프 — 좌우 톱니
  return (
    <>
      <div className="absolute -left-2 top-6 bottom-6 w-3 flex flex-col justify-around opacity-50">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="w-3 h-3 rounded-full bg-paper-2 border border-ink" />
        ))}
      </div>
      <div className="absolute -right-2 top-6 bottom-6 w-3 flex flex-col justify-around opacity-50">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="w-3 h-3 rounded-full bg-paper-2 border border-ink" />
        ))}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function ProductInfo() {
  return (
    <section className="border border-rule-strong bg-paper p-4 mb-3">
      <Eyebrow className="mb-2">상품 정보</Eyebrow>
      <Row label="상품" value={`${RECEIPT.productName} (${RECEIPT.productCode})`} />
      <Row label="가입일" value={RECEIPT.startedAt} mono />
      <Row label="만기일" value={RECEIPT.maturedAt} mono />
      <Row label="금리" value={`연 ${RECEIPT.rate.toFixed(2)}%`} mono />
      <Row label="채널" value={`${RECEIPT.channel} · ${RECEIPT.actor} actor (자동 처리)`} mono last />
    </section>
  );
}

function Row({ label, value, mono = false, last = false }: { label: string; value: string; mono?: boolean; last?: boolean }) {
  return (
    <div className={"flex justify-between items-baseline py-1.5 " + (last ? "" : "border-b border-rule")}>
      <span className="font-mono text-[11px] text-ink-3 uppercase tracking-[0.04em]">{label}</span>
      <span className={(mono ? "font-mono tnum" : "font-serif") + " text-sm"}>{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function AmountBreakdown() {
  return (
    <section className="border border-rule-strong bg-paper p-4 mb-3">
      <Eyebrow className="mb-3">금액 분해</Eyebrow>
      <table className="w-full font-mono text-[12px] tnum">
        <tbody>
          <tr className="border-b border-rule">
            <td className="py-2 text-ink-3">원금</td>
            <td className="py-2 text-right">{RECEIPT.principal.toLocaleString("ko-KR")}원</td>
          </tr>
          <tr className="border-b border-rule" style={{ color: "var(--tx-deposit)" }}>
            <td className="py-2">세전 이자</td>
            <td className="py-2 text-right">+{RECEIPT.interestGross.toLocaleString("ko-KR")}원</td>
          </tr>
          <tr className="border-b border-rule" style={{ color: "var(--st-suspended)" }}>
            <td className="py-2">세금 (15.4%)</td>
            <td className="py-2 text-right">−{RECEIPT.tax.toLocaleString("ko-KR")}원</td>
          </tr>
          <tr className="border-b border-ink font-medium" style={{ color: "var(--tx-deposit)" }}>
            <td className="py-2">실수령 이자</td>
            <td className="py-2 text-right">+{RECEIPT.interestNet.toLocaleString("ko-KR")}원</td>
          </tr>
          <tr className="font-medium text-base">
            <td className="py-3">합계</td>
            <td className="py-3 text-right">
              {(RECEIPT.principal + RECEIPT.interestNet).toLocaleString("ko-KR")}원
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function SettlementInfo() {
  return (
    <section className="border-l-2 bg-paper p-4 mb-3" style={{ borderColor: "var(--tx-maturity-payout)" }}>
      <Eyebrow className="mb-2">결제 DDA · 자동 입금 완료</Eyebrow>
      <div className="font-serif text-sm font-medium">{RECEIPT.settlement.alias}</div>
      <div className="font-mono text-[11px] text-ink-3 tnum mb-2">{RECEIPT.settlement.number}</div>
      <div className="border-t border-dashed border-rule pt-2">
        <div className="font-mono text-[10px] text-ink-3 mb-0.5">거래 식별자</div>
        <div className="font-mono text-[10px] tnum break-all">{RECEIPT.txnId}</div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function ActionsBar() {
  return (
    <div className="grid grid-cols-2 gap-2 mt-5">
      <Link
        href={"/customer/history?type=MATURITY_PAYOUT" as Route}
        className="border border-ink py-3 text-center font-serif text-sm hover:bg-paper"
      >
        거래내역에서 보기
      </Link>
      <button className="border border-ink py-3 font-serif text-sm">PDF 다운로드</button>
      <Link
        href={"/customer/td-sim" as Route}
        className="col-span-2 bg-ink text-paper py-3 text-center font-serif text-sm"
      >
        다시 정기예금 가입
      </Link>
    </div>
  );
}
