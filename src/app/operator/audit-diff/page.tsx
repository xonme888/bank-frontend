// 화면 9 — 감사로그 diff 뷰어. LIVE.
//
// 데이터: GET /api/v1/audit-logs/customer/recent?limit=20 (가장 최근 1건 표시)
//        + GET /api/v1/audit-logs/customer/by-trace/{traceId} (chain)
// fixture fallback: 백엔드 미연결 시 SAMPLE_AUDIT_DIFF 사용.

import { DeskShell } from "@/components/shells/DeskShell";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { PageEyebrow } from "@/components/chrome/PageEyebrow";
import { SAMPLE_AUDIT_DIFF, type AuditDiff } from "@/data/operator-fixtures";
import { DiffViewer } from "./DiffViewer";
import { api, ApiError } from "@/api/client";
import { DEMO_OPERATOR_ACTOR } from "@/api/actor";

export const dynamic = "force-dynamic";

const NAV = [
  { key: "search",       label: "고객 검색" },
  { key: "accounts-ops", label: "계좌 운영" },
  { key: "edd",          label: "EDD 큐", badge: 4 },
  { key: "audit",        label: "감사로그", active: true },
  { key: "reports",      label: "리포트" },
];

type LiveAuditEntry = {
  id: number;
  domain: string;
  resourceId: number;
  action: string;
  actorType: "CUSTOMER" | "OPERATOR" | "SYSTEM";
  actorId: string;
  actorIp: string | null;
  actorChannel: "WEB" | "MOBILE" | "BRANCH" | "CALL_CENTER" | "ATM" | "BATCH" | "API" | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  traceId: string | null;
  createdAt: string;
};

async function loadDiff(): Promise<{ diff: AuditDiff; live: boolean; reason?: string }> {
  try {
    const recent = await api.get<LiveAuditEntry[]>(
      `/api/v1/audit-logs/customer/recent?limit=20`,
      { actor: DEMO_OPERATOR_ACTOR },
    );
    if (recent.length === 0) {
      return { diff: SAMPLE_AUDIT_DIFF, live: false, reason: "Customer 감사 이벤트가 아직 없음 — DemoSeeder 가 update 호출 시점에 생성됨" };
    }
    const first = recent[0];
    const chainRaw = first.traceId
      ? await api.get<LiveAuditEntry[]>(
          `/api/v1/audit-logs/customer/by-trace/${encodeURIComponent(first.traceId)}`,
          { actor: DEMO_OPERATOR_ACTOR },
        )
      : [];
    return {
      live: true,
      diff: {
        traceId: first.traceId ?? "(no-trace)",
        occurredAt: first.createdAt,
        actorType: first.actorType,
        actorId: first.actorId,
        channel: first.actorChannel ?? "API",
        ip: first.actorIp ?? "—",
        method: methodFor(first.action),
        path: pathFor(first.domain, first.action, first.resourceId),
        statusCode: 200,
        errorCode: undefined,
        before: (first.before ?? {}) as Record<string, unknown>,
        after: (first.after ?? {}) as Record<string, unknown>,
        chain: chainRaw.map((c) => ({
          ts: c.createdAt,
          summary: `${c.actorType} · ${c.action} · ${c.domain}#${c.resourceId}`,
          traceId: c.traceId ?? "(no-trace)",
        })),
      },
    };
  } catch (e) {
    const reason = e instanceof ApiError ? `${e.code} (HTTP ${e.status})` : "백엔드 연결 실패";
    return { diff: SAMPLE_AUDIT_DIFF, live: false, reason };
  }
}

function methodFor(action: string): string {
  switch (action) {
    case "CREATE": return "POST";
    case "UPDATE": return "PATCH";
    case "CLOSE":  return "POST";
    default:       return "POST";
  }
}

function pathFor(domain: string, action: string, resourceId: number): string {
  if (domain === "CUSTOMER") {
    if (action === "CREATE") return "/api/v1/customers";
    if (action === "CLOSE")  return `/api/v1/customers/${resourceId}/close`;
    return `/api/v1/customers/${resourceId}`;
  }
  return `/api/v1/${domain.toLowerCase()}s/${resourceId}`;
}

export default async function Page() {
  const { diff, live, reason } = await loadDiff();
  return (
    <>
      <div className="px-10 pt-6 pb-2 max-w-[1280px]">
        <PageEyebrow screenId="audit-diff" variant="deskshell" />
      </div>
      <DeskShell route={`GET /api/v1/audit-logs/customer/recent`} traceId={diff.traceId} nav={NAV}>
        <div className="p-6 max-w-[1280px]">
          {!live && reason && (
            <div className="border-l-2 border-st-suspended bg-paper p-3 mb-3">
              <div className="font-mono text-[10px] text-ink-3 uppercase tracking-[0.04em] mb-0.5">
                백엔드 미연결 또는 데이터 없음 · fixture 사용
              </div>
              <pre className="font-mono text-[10px] text-ink-3">{reason}</pre>
            </div>
          )}

          <Header diff={diff} live={live} />
          <Meta diff={diff} />
          <DiffViewer before={diff.before} after={diff.after} />
          <Chain chain={diff.chain} traceId={diff.traceId} />
        </div>
      </DeskShell>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function Header({ diff, live }: { diff: AuditDiff; live: boolean }) {
  return (
    <header className="flex items-start justify-between gap-6 border border-rule-strong bg-paper p-5 mb-3">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Eyebrow>감사 이벤트 · {diff.traceId.slice(0, 16)}{diff.traceId.length > 16 ? "…" : ""}</Eyebrow>
          <span
            className="font-mono text-[9px] tracking-[0.06em] uppercase px-1 py-px border"
            style={{
              color: live ? "var(--accent)" : "var(--ink-3)",
              borderColor: live ? "var(--accent)" : "var(--ink-3)",
            }}
          >
            {live ? "real" : "demo"}
          </span>
        </div>
        <div className="font-serif text-2xl font-medium leading-tight">
          {diff.method} <code className="font-mono text-xl ml-1">{diff.path}</code>
        </div>
        <div className="font-mono text-[11px] text-ink-3 tnum mt-2">
          {new Date(diff.occurredAt).toLocaleString("ko-KR")}
          {" · "}
          <span style={{ color: diff.statusCode === 200 ? "var(--tx-deposit)" : "var(--st-suspended)" }}>
            {diff.statusCode}
          </span>
        </div>
      </div>
      <AppendOnlyBadge />
    </header>
  );
}

function AppendOnlyBadge() {
  return (
    <div
      className="border-2 px-3 py-2 text-right shrink-0"
      style={{ borderColor: "var(--accent)" }}
    >
      <div className="font-mono text-[9px] tracking-[0.08em] uppercase text-ink-3">tb_customer_audit_log</div>
      <div className="font-mono text-[12px] uppercase tracking-[0.06em] font-medium" style={{ color: "var(--accent)" }}>
        ✦ APPEND-ONLY
      </div>
      <div className="font-mono text-[9px] text-ink-3 mt-0.5">DB 트리거 + JPA hook 이중 방어</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function Meta({ diff }: { diff: AuditDiff }) {
  return (
    <section className="border border-rule-strong bg-paper p-4 mb-3">
      <div className="grid grid-cols-5 gap-4">
        <Field label="actor type" value={diff.actorType} />
        <Field label="actor id"   value={diff.actorId} />
        <Field label="channel"    value={diff.channel} />
        <Field label="ip"         value={diff.ip} />
        <Field label="errorCode"  value={diff.errorCode ?? "—"}
               color={diff.errorCode ? "var(--st-suspended)" : undefined} />
      </div>
    </section>
  );
}

function Field({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] text-ink-3 uppercase tracking-[0.04em] mb-0.5">{label}</div>
      <div className="font-mono text-sm tnum" style={color ? { color } : undefined}>{value}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function Chain({ chain, traceId }: { chain: AuditDiff["chain"]; traceId: string }) {
  return (
    <section className="border border-rule-strong bg-paper p-5 mt-3">
      <div className="flex items-center justify-between mb-3">
        <Eyebrow>chain · 같은 traceId · {chain.length}건</Eyebrow>
        <span className="font-mono text-[10px] text-ink-3 tnum break-all">{traceId}</span>
      </div>
      {chain.length === 0 ? (
        <div className="font-mono text-[11px] text-ink-3">동일 traceId 의 감사 이벤트 없음</div>
      ) : (
        <ol className="space-y-2">
          {chain.map((c, i) => (
            <li key={i} className="flex gap-3">
              <span className="font-mono text-[10px] text-ink-3 tnum w-32 shrink-0">
                {new Date(c.ts).toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "medium" })}
              </span>
              <span className="font-mono text-[10px] text-ink-3 w-2">→</span>
              <span className="text-sm text-ink-2">{c.summary}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
