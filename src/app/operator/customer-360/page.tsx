// 화면 7 — 고객 360°.
//
// IA 매핑 (docs/ux/screen-ia.md §화면 7):
//   상단: 고객명 마스킹 토글 + 본인확인 + 응대 사유
//   3-컬럼: 좌(프로필 LIVE) · 중(계좌 트리 fixture) · 우(활동 timeline fixture)
//   하단 CTA: 입금처리·출금처리·이체처리·정지·EDD승인·해지
//
// LIVE: GET /api/v1/customers/{id} (DEMO_OPERATOR_ACTOR 헤더로 호출).
// fixture 유지: 백엔드에 "내 계좌 목록" / "감사로그 검색" endpoint 미구현.

import { DeskShell } from "@/components/shells/DeskShell";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { PageEyebrow } from "@/components/chrome/PageEyebrow";
import { BackendBanner } from "@/components/chrome/BackendBanner";
import { StatusBadge } from "@/components/primitives/StatusBadge";
import { SourceBadge } from "@/components/primitives/SourceBadge";
import {
  CUSTOMER_360,
  CUSTOMER_ACCOUNT_TREE,
  CUSTOMER_AUDIT_TIMELINE,
  type AccountTreeNode,
  type AuditEvent,
  type CustomerProfile,
} from "@/data/operator-fixtures";
import { CustomerHeader, ActionsBar } from "./Interactive";
import { api, ApiError } from "@/api/client";
import { DEMO_OPERATOR_ACTOR } from "@/api/actor";

export const dynamic = "force-dynamic";

const TARGET_CUSTOMER_ID = 1;

type LiveCustomer = {
  id: number;
  name: string;
  email: string;          // 백엔드 EmailMaskingSerializer 마스킹 결과
  phoneNumber: string;
  status: "ACTIVE" | "CLOSED";
};

async function loadProfile(): Promise<{ profile: CustomerProfile; live: boolean; reason?: string }> {
  try {
    const c = await api.get<LiveCustomer>(`/api/v1/customers/${TARGET_CUSTOMER_ID}`, {
      actor: DEMO_OPERATOR_ACTOR,
    });
    return {
      live: true,
      profile: {
        id: c.id,
        nameMasked: c.name.length >= 2 ? c.name[0] + "*".repeat(Math.max(1, c.name.length - 1)) : "*",
        phoneMasked: c.phoneNumber,
        emailMasked: c.email,
        registeredAt: CUSTOMER_360.registeredAt,
        grade: CUSTOMER_360.grade,
        channelHint: CUSTOMER_360.channelHint,
      },
    };
  } catch (e) {
    const reason = e instanceof ApiError ? `${e.code} (HTTP ${e.status})` : "백엔드 연결 실패";
    return { live: false, reason, profile: CUSTOMER_360 };
  }
}

const NAV = [
  { key: "search",       label: "고객 검색",   active: true },
  { key: "accounts-ops", label: "계좌 운영"  },
  { key: "edd",          label: "EDD 큐",     badge: 4 },
  { key: "audit",        label: "감사로그"   },
  { key: "reports",      label: "리포트"     },
];

export default async function Page() {
  const { profile, live, reason } = await loadProfile();
  return (
    <>
      <div className="px-10 pt-6 pb-2 max-w-[1100px]">
        <PageEyebrow screenId="customer-360" variant="deskshell" />
      </div>
      <DeskShell route={`GET /api/v1/customers/${TARGET_CUSTOMER_ID}`} traceId="trace-360-A12" nav={NAV}>
        <div className="p-8 max-w-[1100px]">
          <CustomerHeader />

          {!live && reason && (
            <BackendBanner reason={reason} message="백엔드 미연결 · 프로필도 fixture 사용" />
          )}

          <div className="grid grid-cols-[280px_320px_1fr] gap-3 mb-4">
            <ProfileColumn profile={profile} live={live} />
            <AccountTreeColumn nodes={CUSTOMER_ACCOUNT_TREE} />
            <TimelineColumn events={CUSTOMER_AUDIT_TIMELINE} />
          </div>

          <ActionsBar />
        </div>
      </DeskShell>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function ProfileColumn({ profile, live }: { profile: CustomerProfile; live: boolean }) {
  const totalDda = CUSTOMER_ACCOUNT_TREE
    .filter((n) => n.kind === "DDA" && n.status === "ACTIVE")
    .reduce((s, n) => s + n.balance, 0);
  const totalTd = CUSTOMER_ACCOUNT_TREE
    .filter((n) => n.kind === "TIME_DEPOSIT")
    .reduce((s, n) => s + n.balance, 0);

  return (
    <section className="border border-rule-strong bg-paper p-4">
      <div className="flex items-center justify-between mb-3">
        <Eyebrow>프로필 · #{profile.id}</Eyebrow>
        <SourceBadge live={live} />
      </div>
      <Field label="이름" value={profile.nameMasked} />
      <Field label="전화" value={profile.phoneMasked} mono />
      <Field label="이메일" value={profile.emailMasked} mono />
      <Field label="가입일" value={profile.registeredAt} mono />
      <Field
        label="등급"
        value={
          <span
            className="font-mono text-[10px] px-1.5 py-px border tnum"
            style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
          >
            {profile.grade}
          </span>
        }
      />

      <div className="border-t border-dashed border-rule mt-3 pt-3">
        <Eyebrow className="mb-2">자산 합계 (fixture)</Eyebrow>
        <div className="font-sans tnum font-medium text-2xl">
          {(totalDda + totalTd).toLocaleString("ko-KR")}<span className="text-ink-3 font-normal text-xs ml-1">원</span>
        </div>
        <div className="font-mono text-[10px] text-ink-3 tnum mt-2 leading-relaxed">
          DDA {totalDda.toLocaleString("ko-KR")} · TD {totalTd.toLocaleString("ko-KR")}
        </div>
      </div>

      <div className="border-t border-dashed border-rule mt-3 pt-3">
        <Eyebrow className="mb-1">채널 분포 (fixture)</Eyebrow>
        <div className="font-mono text-[10px] text-ink-2 tnum">{profile.channelHint}</div>
      </div>
    </section>
  );
}

function Field({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="mb-2 last:mb-0">
      <div className="font-mono text-[10px] text-ink-3 uppercase tracking-[0.04em]">{label}</div>
      <div className={(mono ? "font-mono tnum" : "font-serif") + " text-sm"}>{value}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function AccountTreeColumn({ nodes }: { nodes: AccountTreeNode[] }) {
  const dda = nodes.filter((n) => n.kind === "DDA");
  const td = nodes.filter((n) => n.kind === "TIME_DEPOSIT");
  return (
    <section className="border border-rule-strong bg-paper p-4">
      <Eyebrow className="mb-3">계좌 트리 · {nodes.length}</Eyebrow>

      <div className="mb-4">
        <div className="font-mono text-[10px] text-ink-3 uppercase tracking-[0.04em] mb-2">DDA · {dda.length}</div>
        <ul className="space-y-1.5">
          {dda.map((n, i) => <AccountNode key={i} node={n} />)}
        </ul>
      </div>

      {td.length > 0 && (
        <div>
          <div className="font-mono text-[10px] text-ink-3 uppercase tracking-[0.04em] mb-2">TIME DEPOSIT · {td.length}</div>
          <ul className="space-y-1.5">
            {td.map((n, i) => <AccountNode key={i} node={n} />)}
          </ul>
        </div>
      )}
    </section>
  );
}

function AccountNode({ node }: { node: AccountTreeNode }) {
  return (
    <li className="border border-rule p-2.5 bg-paper-2 hover:bg-paper">
      <div className="flex items-center justify-between mb-1.5">
        <div className="font-serif text-sm font-medium">{node.alias}</div>
        <StatusBadge state={node.status} />
      </div>
      <div className="font-mono text-[10px] text-ink-3 tnum mb-1">
        {node.accountNumber} · {node.productCode}
      </div>
      <div className="font-sans tnum font-medium text-sm">
        {node.balance.toLocaleString("ko-KR")}<span className="text-ink-3 font-normal text-[10px] ml-1">원</span>
      </div>
    </li>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function TimelineColumn({ events }: { events: AuditEvent[] }) {
  return (
    <section className="border border-rule-strong bg-paper p-4">
      <Eyebrow className="mb-3">활동 timeline · 감사로그</Eyebrow>
      <ol className="space-y-3 relative">
        {events.map((e, i) => <Event key={i} event={e} />)}
      </ol>
    </section>
  );
}

function Event({ event }: { event: AuditEvent }) {
  const actorColor =
    event.actorType === "CUSTOMER" ? "var(--tx-transfer-in)"
    : event.actorType === "OPERATOR" ? "var(--tx-transfer-out)"
    : "var(--ink-3)";
  return (
    <li className="flex gap-3">
      <div className="flex flex-col items-center shrink-0">
        <span
          className="w-3 h-3 rounded-full border-2"
          style={{ borderColor: actorColor, background: "var(--paper)" }}
        />
        <span className="flex-1 w-px bg-rule mt-1" />
      </div>
      <div className="flex-1 pb-1">
        <div className="font-mono text-[10px] text-ink-3 tnum mb-0.5">
          {new Date(event.ts).toLocaleString("ko-KR")}
        </div>
        <div className="flex items-center gap-1.5 mb-1">
          <span
            className="font-mono text-[10px] uppercase px-1 py-px"
            style={{ color: actorColor, borderColor: actorColor, border: "1px solid" }}
          >
            {event.actorType}
          </span>
          <span className="font-mono text-[10px] text-ink-3">· {event.channel} · {event.actorId}</span>
        </div>
        <div className="text-sm text-ink-2 leading-snug">{event.summary}</div>
        <div className="font-mono text-[10px] text-ink-3 mt-0.5 flex items-center gap-2">
          <span>traceId: {event.traceId}</span>
          {event.errorCode && (
            <span
              className="px-1 py-px border"
              style={{ color: "var(--st-suspended)", borderColor: "var(--st-suspended)" }}
            >
              {event.errorCode}
            </span>
          )}
        </div>
      </div>
    </li>
  );
}
