// 화면 3 — 이체 (FDS 거부 모달 + Idempotency UX).
//
// IA 매핑 (docs/ux/screen-ia.md §화면 3):
//   3 단계: 입력 → 확인 → 완료
//   분기: SAME_ACCOUNT_TRANSFER / FRAUD_DETECTION_REJECTED / IDEMPOTENCY_KEY_REUSED / 200 OK

import { PageEyebrow } from "@/components/chrome/PageEyebrow";
import { TransferScreen } from "./TransferScreen";

export const dynamic = "force-dynamic";

type SearchParams = { scenario?: string };

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="bg-paper-2 min-h-[calc(100vh-58px)]">
      <div className="mx-auto max-w-[640px] p-6 pb-16">
        <PageEyebrow screenId="transfer" />
        <h1 className="font-serif text-[40px] leading-[1.1] font-medium tracking-[-0.025em] mb-2">
          이체
        </h1>
        <p className="font-serif text-sm text-ink-2 max-w-[480px] mb-6 leading-relaxed">
          입력 → 확인 → 완료 3 단계. FDS 거부 / Idempotency 재시도 / 자기이체 거부 등의
          UX 분기 시연.
        </p>

        <TransferScreen initialScenario={searchParams.scenario ?? "none"} />
      </div>
    </div>
  );
}
