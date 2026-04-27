// 화면 4 — 거래 내역 (6-type 필터).
//
// IA 매핑 (docs/ux/screen-ia.md §화면 4):
//   잔액 위젯 · 기간 chip · 6 유형 chip · 거래 행 · 빈 상태

import Link from "next/link";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { HistoryView } from "./HistoryView";
import { FIXTURE_TRANSACTIONS } from "@/data/transactions-fixture";

export const dynamic = "force-dynamic";

type SearchParams = { type?: string; range?: string };

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="bg-paper-2 min-h-[calc(100vh-58px)]">
      <div className="mx-auto max-w-[640px] p-6 pb-16">
        <Link href="/" className="font-mono text-[11px] text-ink-3 hover:text-ink">← all screens</Link>

        <Eyebrow className="mt-6 mb-3">SCREEN 04 · CUSTOMER · MOBILE</Eyebrow>
        <h1 className="font-serif text-[40px] leading-[1.1] font-medium tracking-[-0.025em] mb-2">
          거래 내역
        </h1>
        <p className="font-serif text-sm text-ink-2 mb-6 leading-relaxed">
          백엔드 6-value TransactionType 그대로 — 입금·출금·이체출금·이체입금·만기 지급·중도해지 지급.
        </p>

        <HistoryView
          rows={FIXTURE_TRANSACTIONS}
          initialType={searchParams.type ?? "ALL"}
          initialRange={searchParams.range ?? "30D"}
        />
      </div>
    </div>
  );
}
