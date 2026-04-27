// 화면 2 — 출금 (한도 게이지 + 8 거부 시나리오).
//
// IA 매핑 (docs/ux/screen-ia.md §화면 2):
//   ① 계좌 카드 ② 금액 입력 ③ 채널별 한도 게이지 ④ 메모 ⑤ 출금 후 잔액 미리보기 ⑥ CTA
//   상태 변형: INSUFFICIENT_BALANCE / DAILY_TRANSFER_LIMIT_EXCEEDED / DAILY_ATM_WITHDRAW_LIMIT_EXCEEDED
//             / FRAUD_DETECTION_REJECTED / ACCOUNT_SUSPENDED / TRANSACTION_NOT_ALLOWED_ON_TIME_DEPOSIT
//             / INVALID_TRANSACTION_AMOUNT / OK
//
// URL search param ?scenario= 으로 거부 시나리오 시연 (포트폴리오 토글).

import Link from "next/link";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { WithdrawScreen } from "./WithdrawScreen";

export const dynamic = "force-dynamic";

type SearchParams = { scenario?: string };

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="bg-paper-2 min-h-[calc(100vh-58px)]">
      <div className="mx-auto max-w-[640px] p-6 pb-16">
        <Link href="/" className="font-mono text-[11px] text-ink-3 hover:text-ink">← all screens</Link>

        <Eyebrow className="mt-6 mb-3">SCREEN 02 · CUSTOMER · MOBILE</Eyebrow>
        <h1 className="font-serif text-[40px] leading-[1.1] font-medium tracking-[-0.025em] mb-2">
          출금
        </h1>
        <p className="font-serif text-sm text-ink-2 max-w-[480px] mb-6 leading-relaxed">
          백엔드 한도 가드(BR-TX-90~93) + FDS 평가의 8 거부 케이스를 화면 분기로.
          상단의 시나리오 토글로 거부 케이스 시연.
        </p>

        <WithdrawScreen initialScenario={searchParams.scenario ?? "none"} />
      </div>
    </div>
  );
}
