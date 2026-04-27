// 화면 7 — 고객 360°.
//
// IA 매핑 (docs/ux/screen-ia.md §화면 7):
//   상단: 고객명 마스킹 토글 + 본인확인 + 응대 사유
//   3-컬럼: 좌(프로필) · 중(계좌 트리) · 우(활동 timeline)
//   하단 CTA: 입금처리·출금처리·이체처리·정지·EDD승인·해지

import Link from "next/link";
import { DeskShell } from "@/components/shells/DeskShell";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { StatusBadge } from "@/components/primitives/StatusBadge";
import {
  CUSTOMER_360,
  CUSTOMER_ACCOUNT_TREE,
  CUSTOMER_AUDIT_TIMELINE,
  type AccountTreeNode,
  type AuditEvent,
} from "@/data/operator-fixtures";
import { CustomerHeader, ActionsBar } from "./Interactive";

const NAV = [
  { key: "search",       label: "고객 검색",   active: true },
  { key: "accounts-ops", label: "계좌 운영"  },
  { key: "edd",          label: "EDD 큐",     badge: 4 },
  { key: "audit",        label: "감사로그"   },
  { key: "reports",      label: "리포트"     },
];

export default function Page() {
  return (
    <>
      <div className="px-10 pt-6 pb-2 max-w-[1100px]">
        <Link href="/" className="font-mono text-[11px] text-ink-3 hover:text-ink">← all screens</Link>
        <Eyebrow className="mt-3 mb-1">SCREEN 07 · OPERATOR · DESKTOP</Eyebrow>
      </div>
      <DeskShell route="GET /operators/customers/1" traceId="trace-360-A12" nav={NAV}>
        <div className="p-8 max-w-[1100px]">
          <CustomerHeader />

          <div className="grid grid-cols-[280px_320px_1fr] gap-3 mb-4">
            <ProfileColumn />
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
function ProfileColumn() {
  const totalDda = CUSTOMER_ACCOUNT_TREE
    .filter((n) => n.kind === "DDA" && n.status === "ACTIVE")
    .reduce((s, n) => s + n.balance, 0);
  const totalTd = CUSTOMER_ACCOUNT_TREE
    .filter((n) => n.kind === "TIME_DEPOSIT")
    .reduce((s, n) => s + n.balance, 0);

  return (
    <section className="border border-rule-strong bg-paper p-4">
      <Eyebrow className="mb-3">프로필</Eyebrow>
      <Field label="이름" value={CUSTOMER_360.nameMasked} />
      <Field label="전화" value={CUSTOMER_360.phoneMasked} mono />
      <Field label="이메일" value={CUSTOMER_360.emailMasked} mono />
      <Field label="가입일" value={CUSTOMER_360.registeredAt} mono />
      <Field
        label="등급"
        value={
          <span
            className="font-mono text-[10px] px-1.5 py-px border tnum"
            style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
          >
            {CUSTOMER_360.grade}
          </span>
        }
      />

      <div className="border-t border-dashed border-rule mt-3 pt-3">
        <Eyebrow className="mb-2">자산 합계</Eyebrow>
        <div className="font-sans tnum font-medium text-2xl">
          {(totalDda + totalTd).toLocaleString("ko-KR")}<span className="text-ink-3 font-normal text-xs ml-1">원</span>
        </div>
        <div className="font-mono text-[10px] text-ink-3 tnum mt-2 leading-relaxed">
          DDA {totalDda.toLocaleString("ko-KR")} · TD {totalTd.toLocaleString("ko-KR")}
        </div>
      </div>

      <div className="border-t border-dashed border-rule mt-3 pt-3">
        <Eyebrow className="mb-1">채널 분포</Eyebrow>
        <div className="font-mono text-[10px] text-ink-2 tnum">{CUSTOMER_360.channelHint}</div>
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
