// 화면 5 — 정기예금 시뮬레이터.
//
// IA 매핑 (docs/ux/screen-ia.md §화면 5):
//   상품 선택 → 금액·기간·금리 슬라이더 → 실시간 만기수령액 → 결제 DDA 1회 등록 → 약관 → CTA

import Link from "next/link";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { TimeDepositSimulator } from "./TimeDepositSimulator";

export default function Page() {
  return (
    <div className="bg-paper-2 min-h-[calc(100vh-58px)]">
      <div className="mx-auto max-w-[640px] p-6 pb-16">
        <Link href="/" className="font-mono text-[11px] text-ink-3 hover:text-ink">← all screens</Link>

        <Eyebrow className="mt-6 mb-3">SCREEN 05 · CUSTOMER · MOBILE</Eyebrow>
        <h1 className="font-serif text-[40px] leading-[1.1] font-medium tracking-[-0.025em] mb-2">
          정기예금 시뮬레이터
        </h1>
        <p className="font-serif text-sm text-ink-2 max-w-[480px] mb-6 leading-relaxed">
          기간·금액·금리 변경 시 만기 수령액이 실시간 계산.
          결제 DDA 는 1회 등록 후 변경 불가 — 만기/해지 시 자동 입금 계좌.
        </p>

        <TimeDepositSimulator />
      </div>
    </div>
  );
}
