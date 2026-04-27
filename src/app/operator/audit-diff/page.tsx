// 화면 9 — 감사로그 diff 뷰어.
//
// IA 매핑 (docs/ux/screen-ia.md §화면 9):
//   헤더 (trace_id · 시각 · actor) + 메타 박스 + 2-패널 diff + PII 토글 + chain timeline
//   + append-only 배지

import Link from "next/link";
import { DeskShell } from "@/components/shells/DeskShell";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { SAMPLE_AUDIT_DIFF } from "@/data/operator-fixtures";
import { DiffViewer } from "./DiffViewer";

const NAV = [
  { key: "search",       label: "고객 검색" },
  { key: "accounts-ops", label: "계좌 운영" },
  { key: "edd",          label: "EDD 큐", badge: 4 },
  { key: "audit",        label: "감사로그", active: true },
  { key: "reports",      label: "리포트" },
];

export default function Page() {
  const d = SAMPLE_AUDIT_DIFF;
  return (
    <>
      <div className="px-10 pt-6 pb-2 max-w-[1280px]">
        <Link href="/" className="font-mono text-[11px] text-ink-3 hover:text-ink">← all screens</Link>
        <Eyebrow className="mt-3 mb-1">SCREEN 09 · OPERATOR · DESKTOP</Eyebrow>
      </div>
      <DeskShell route={`GET /operators/audit-logs/${d.traceId}`} traceId={d.traceId} nav={NAV}>
        <div className="p-6 max-w-[1280px]">
          <Header diff={d} />
          <Meta diff={d} />
          <DiffViewer before={d.before} after={d.after} />
          <Chain chain={d.chain} traceId={d.traceId} />
        </div>
      </DeskShell>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function Header({ diff }: { diff: typeof SAMPLE_AUDIT_DIFF }) {
  return (
    <header className="flex items-start justify-between gap-6 border border-rule-strong bg-paper p-5 mb-3">
      <div>
        <Eyebrow className="mb-1">감사 이벤트 · {diff.traceId}</Eyebrow>
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
      <div className="font-mono text-[9px] tracking-[0.08em] uppercase text-ink-3">tb_*_audit_log</div>
      <div className="font-mono text-[12px] uppercase tracking-[0.06em] font-medium" style={{ color: "var(--accent)" }}>
        ✦ APPEND-ONLY
      </div>
      <div className="font-mono text-[9px] text-ink-3 mt-0.5">변조 불가 · 보존 중</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function Meta({ diff }: { diff: typeof SAMPLE_AUDIT_DIFF }) {
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
function Chain({ chain, traceId }: { chain: typeof SAMPLE_AUDIT_DIFF["chain"]; traceId: string }) {
  return (
    <section className="border border-rule-strong bg-paper p-5 mt-3">
      <div className="flex items-center justify-between mb-3">
        <Eyebrow>chain · 같은 traceId</Eyebrow>
        <span className="font-mono text-[10px] text-ink-3 tnum">traceId: {traceId}</span>
      </div>
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
    </section>
  );
}
