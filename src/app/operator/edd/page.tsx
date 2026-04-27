// 화면 8 — EDD 승인 큐. LIVE.
//
// 데이터: GET /api/v1/accounts?status=PENDING_EDD_APPROVAL&limit=20 (DEMO_OPERATOR_ACTOR)
// 백엔드 응답을 EddQueueItem 으로 매핑. 위험점수·KYC 결과 등 운영 메타는 fixture 보정
// (백엔드에 별도 컬럼/검색 endpoint 미구현).

import Link from "next/link";
import { DeskShell } from "@/components/shells/DeskShell";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { EDD_QUEUE, type EddQueueItem } from "@/data/operator-fixtures";
import { EddQueueView } from "./EddQueueView";
import { api, ApiError } from "@/api/client";
import { DEMO_OPERATOR_ACTOR } from "@/api/actor";

export const dynamic = "force-dynamic";

type LiveAccount = {
  id: number;
  accountNumber: string;
  productCode: string;
  status: "PENDING_EDD_APPROVAL";
  openedAt: string;
};

async function loadQueue(): Promise<{ items: EddQueueItem[]; live: boolean; reason?: string }> {
  try {
    const accounts = await api.get<LiveAccount[]>(
      `/api/v1/accounts?status=PENDING_EDD_APPROVAL&limit=20`,
      { actor: DEMO_OPERATOR_ACTOR },
    );
    if (accounts.length === 0) {
      return { items: EDD_QUEUE, live: false, reason: "큐가 비어있음 — DemoSeeder 가 PENDING_EDD_APPROVAL 시드 안 했거나 모두 승인됨" };
    }
    return {
      live: true,
      items: accounts.map((a, i) => ({
        id: `EDD-${a.id}`,
        receivedAt: a.openedAt,
        customerNameMasked: "고객 #" + a.id,
        productCode: a.productCode,
        riskScore: 0.55 + (i * 0.13) % 0.4,    // fixture 위험점수 (백엔드 컬럼 미구현)
        waitMinutes: minutesSince(a.openedAt),
        reasons: ["LIVE 시드 — 위험점수·신호는 fixture (백엔드 enrichment 미구현)"],
        kycResult: "WARN" as const,
        termsConsented: true,
      })),
    };
  } catch (e) {
    const reason = e instanceof ApiError ? `${e.code} (HTTP ${e.status})` : "백엔드 연결 실패";
    return { items: EDD_QUEUE, live: false, reason };
  }
}

function minutesSince(iso: string): number {
  return Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
}

export default async function Page() {
  const { items, live, reason } = await loadQueue();
  const NAV = [
    { key: "search",       label: "고객 검색" },
    { key: "accounts-ops", label: "계좌 운영" },
    { key: "edd",          label: "EDD 큐", active: true, badge: items.length },
    { key: "audit",        label: "감사로그" },
    { key: "reports",      label: "리포트" },
  ];
  return (
    <>
      <div className="px-10 pt-6 pb-2 max-w-[1280px]">
        <Link href="/" className="font-mono text-[11px] text-ink-3 hover:text-ink">← all screens</Link>
        <Eyebrow className="mt-3 mb-1">SCREEN 08 · OPERATOR · DESKTOP</Eyebrow>
      </div>
      <DeskShell route="GET /api/v1/accounts?status=PENDING_EDD_APPROVAL" traceId="trace-EDD-Q01" nav={NAV}>
        {!live && reason && (
          <div className="m-6 mb-0 border-l-2 border-st-suspended bg-paper p-3">
            <div className="font-mono text-[10px] text-ink-3 uppercase tracking-[0.04em] mb-0.5">
              {reason.includes("비어있음") ? "백엔드 큐 비어있음 · fixture 표시" : "백엔드 미연결 · fixture 표시"}
            </div>
            <pre className="font-mono text-[10px] text-ink-3">{reason}</pre>
          </div>
        )}
        <EddQueueView items={items} live={live} />
      </DeskShell>
    </>
  );
}
