// 화면 8 — EDD 승인 큐.
//
// IA 매핑 (docs/ux/screen-ia.md §화면 8):
//   큐 리스트 + 우측 슬라이드 상세 패널 + 결정 영역 (승인/반려).

import Link from "next/link";
import { DeskShell } from "@/components/shells/DeskShell";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { EDD_QUEUE } from "@/data/operator-fixtures";
import { EddQueueView } from "./EddQueueView";

const NAV = [
  { key: "search",       label: "고객 검색" },
  { key: "accounts-ops", label: "계좌 운영" },
  { key: "edd",          label: "EDD 큐", active: true, badge: EDD_QUEUE.length },
  { key: "audit",        label: "감사로그" },
  { key: "reports",      label: "리포트" },
];

export default function Page() {
  return (
    <>
      <div className="px-10 pt-6 pb-2 max-w-[1280px]">
        <Link href="/" className="font-mono text-[11px] text-ink-3 hover:text-ink">← all screens</Link>
        <Eyebrow className="mt-3 mb-1">SCREEN 08 · OPERATOR · DESKTOP</Eyebrow>
      </div>
      <DeskShell route="GET /operators/edd-queue" traceId="trace-EDD-Q01" nav={NAV}>
        <EddQueueView items={EDD_QUEUE} />
      </DeskShell>
    </>
  );
}
