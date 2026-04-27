// 화면 15 — 가입 다단계 폼.
//
// IA 매핑 (docs/ux/screen-ia.md §화면 15):
//   단계 인디케이터(이메일→약관→인증→비밀번호→완료)
//   상태 변형: DUPLICATE_EMAIL (CLOSED 포함 — 사기 방지 정책 안내)

import Link from "next/link";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { SignupForm } from "./SignupForm";

export const dynamic = "force-dynamic";

type SearchParams = { scenario?: string };

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="bg-paper-2 min-h-[calc(100vh-58px)]">
      <div className="mx-auto max-w-[480px] p-6 pb-16">
        <Link href="/" className="font-mono text-[11px] text-ink-3 hover:text-ink">← all screens</Link>

        <Eyebrow className="mt-6 mb-3">SCREEN 15 · CUSTOMER · MOBILE</Eyebrow>
        <h1 className="font-serif text-[40px] leading-[1.1] font-medium tracking-[-0.025em] mb-2">
          가입
        </h1>
        <p className="font-serif text-sm text-ink-2 mb-6 leading-relaxed">
          다단계 폼 + 실시간 이메일 중복 검사. CLOSED 고객 이메일도 재사용 차단 (사기 방지 정책).
        </p>

        <SignupForm initialScenario={searchParams.scenario ?? "none"} />
      </div>
    </div>
  );
}
