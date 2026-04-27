// 화면 16 — 입금.
//
// IA 매핑 (docs/ux/screen-ia.md §화면 16):
//   계좌 카드 → 금액 입력 → 메모 → 거래 후 잔액 미리보기 → CTA → 영수증
//   입금은 한도 가드 면제 (BR-TX-90 — 출금성 거래만 산정).

import Link from "next/link";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { DepositForm } from "./DepositForm";

export default function Page() {
  return (
    <div className="bg-paper-2 min-h-[calc(100vh-58px)]">
      <div className="mx-auto max-w-[640px] p-6 pb-16">
        <Link href="/" className="font-mono text-[11px] text-ink-3 hover:text-ink">← all screens</Link>

        <Eyebrow className="mt-6 mb-3">SCREEN 16 · CUSTOMER · MOBILE</Eyebrow>
        <h1 className="font-serif text-[40px] leading-[1.1] font-medium tracking-[-0.025em] mb-2">
          입금
        </h1>
        <p className="font-serif text-sm text-ink-2 mb-6 leading-relaxed">
          입금은 출금성 거래가 아니므로 한도 가드 면제 (BR-TX-90).
          INVALID_TRANSACTION_AMOUNT (1원~10억원 범위) 만 검증.
        </p>

        <DepositForm />
      </div>
    </div>
  );
}
