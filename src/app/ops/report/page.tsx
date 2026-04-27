// 화면 12 — 감사 리포트.
//
// IA 매핑 (docs/ux/screen-ia.md §화면 12):
//   ① 헤더 (기간 + 리포트 타입) ② 요약 카드 ③ actor × channel × 도메인 교차 표 ④ 다운로드

import { DeskShell } from "@/components/shells/DeskShell";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { PageEyebrow } from "@/components/chrome/PageEyebrow";
import { REPORT_SUMMARY, REPORT_TABLE } from "@/data/ops-fixtures";

const NAV = [
  { key: "monitor", label: "실시간 모니터" },
  { key: "fds",     label: "FDS 패턴" },
  { key: "limit",   label: "한도 임박" },
  { key: "report",  label: "감사 리포트", active: true },
  { key: "batch",   label: "배치 잡" },
];

export default function Page() {
  return (
    <>
      <div className="px-10 pt-6 pb-2 max-w-[1280px]">
        <PageEyebrow screenId="report" variant="deskshell" />
      </div>
      <DeskShell route="GET /ops/reports/audit" traceId="trace-OPS-RPT" nav={NAV}>
        <div className="p-6 max-w-[1280px]">
          <Header />
          <SummaryRow />
          <CrossTable />
        </div>
      </DeskShell>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function Header() {
  return (
    <header className="flex items-center justify-between gap-6 mb-3 flex-wrap">
      <div>
        <h1 className="font-serif text-[28px] font-medium tracking-[-0.02em] leading-tight">감사 리포트</h1>
        <div className="font-mono text-[11px] text-ink-3 tnum mt-1">{REPORT_SUMMARY.period}</div>
      </div>
      <div className="flex gap-1">
        {[
          { id: "day",   label: "일간" },
          { id: "week",  label: "주간", active: true },
          { id: "month", label: "월간" },
        ].map((t) => (
          <button
            key={t.id}
            className={
              "font-mono text-[11px] tracking-[0.04em] px-3 py-1.5 border " +
              (t.active
                ? "bg-ink text-paper border-ink"
                : "bg-paper text-ink-2 border-rule-strong hover:border-ink hover:text-ink")
            }
          >
            {t.label}
          </button>
        ))}
        <button className="font-mono text-[11px] tracking-[0.04em] px-3 py-1.5 border border-ink bg-paper hover:bg-ink hover:text-paper">
          CSV ↓
        </button>
        <button className="font-mono text-[11px] tracking-[0.04em] px-3 py-1.5 border border-ink bg-paper hover:bg-ink hover:text-paper">
          PDF ↓
        </button>
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function SummaryRow() {
  const s = REPORT_SUMMARY;
  return (
    <section className="grid grid-cols-4 gap-3 mb-3">
      <Card label="총 변경 건수" value={s.totalChanges.toLocaleString("ko-KR")} accent />
      <DistributionCard
        label="actor type"
        rows={Object.entries(s.byActor).map(([k, v]) => ({ key: k, value: v as number }))}
      />
      <DistributionCard
        label="channel"
        rows={Object.entries(s.byChannel).map(([k, v]) => ({ key: k, value: v as number }))}
      />
      <Card
        label="append-only health"
        value={
          <span className="font-mono text-base font-medium" style={{ color: "var(--tx-deposit)" }}>
            ✓ {s.appendOnlyHealth.rowsBlockedByTrigger} blocked · {s.appendOnlyHealth.fkViolations} FK
          </span>
        }
      />
    </section>
  );
}

function Card({ label, value, accent = false }: { label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <div
      className={"border bg-paper p-4 " + (accent ? "border-ink border-2" : "border-rule-strong")}
    >
      <div className="font-mono text-[10px] text-ink-3 uppercase tracking-[0.06em] mb-1">{label}</div>
      <div className="font-sans tnum font-medium text-[28px] tracking-[-0.02em] leading-none">{value}</div>
    </div>
  );
}

function DistributionCard({ label, rows }: { label: string; rows: Array<{ key: string; value: number }> }) {
  const total = rows.reduce((s, r) => s + r.value, 0) || 1;
  return (
    <div className="border border-rule-strong bg-paper p-4">
      <div className="font-mono text-[10px] text-ink-3 uppercase tracking-[0.06em] mb-2">{label}</div>
      <ul className="space-y-1.5">
        {rows.map((r) => {
          const pct = (r.value / total) * 100;
          return (
            <li key={r.key}>
              <div className="flex items-baseline justify-between font-mono text-[11px]">
                <span className="text-ink-2">{r.key}</span>
                <span className="tnum">{r.value.toLocaleString("ko-KR")} <span className="text-ink-3">({pct.toFixed(0)}%)</span></span>
              </div>
              <div className="h-1 bg-rule mt-0.5">
                <div className="h-full" style={{ width: `${pct}%`, background: "var(--accent)" }} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function CrossTable() {
  const channels = Array.from(new Set(REPORT_TABLE.map((r) => r.channel)));
  const domains = Array.from(new Set(REPORT_TABLE.map((r) => r.domain)));
  const actors: Array<"CUSTOMER" | "OPERATOR" | "SYSTEM"> = ["CUSTOMER", "OPERATOR", "SYSTEM"];

  // (actor, channel, domain) -> count
  const lookup = new Map<string, number>();
  REPORT_TABLE.forEach((r) => lookup.set(`${r.actor}|${r.channel}|${r.domain}`, r.count));

  return (
    <section className="border border-rule-strong bg-paper">
      <div className="px-4 py-3 border-b border-rule flex items-center justify-between">
        <Eyebrow>actor × channel × 도메인 교차 집계</Eyebrow>
        <span className="font-mono text-[10px] text-ink-3">결측 셀은 0</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full font-mono text-[10px] min-w-[860px]">
          <thead>
            <tr className="border-b border-rule">
              <th className="text-left px-3 py-2 font-normal text-ink-3 uppercase tracking-[0.04em]">actor</th>
              <th className="text-left px-3 py-2 font-normal text-ink-3 uppercase tracking-[0.04em]">channel</th>
              {domains.map((d) => (
                <th key={d} className="text-right px-3 py-2 font-normal text-ink-3 uppercase tracking-[0.04em]">{d}</th>
              ))}
              <th className="text-right px-3 py-2 font-normal text-ink-3 uppercase tracking-[0.04em] bg-paper-2">합계</th>
            </tr>
          </thead>
          <tbody>
            {actors.flatMap((a) =>
              channels.map((c) => {
                const counts = domains.map((d) => lookup.get(`${a}|${c}|${d}`) ?? 0);
                const sum = counts.reduce((s, n) => s + n, 0);
                if (sum === 0) return null;
                return (
                  <tr key={`${a}-${c}`} className="border-b border-rule last:border-b-0">
                    <td className="px-3 py-2"><ActorBadge actor={a} /></td>
                    <td className="px-3 py-2 text-ink-2">{c}</td>
                    {counts.map((n, i) => (
                      <td key={i} className="px-3 py-2 tnum text-right" style={{ color: n === 0 ? "var(--ink-3)" : undefined }}>
                        {n === 0 ? "·" : n.toLocaleString("ko-KR")}
                      </td>
                    ))}
                    <td className="px-3 py-2 tnum text-right font-medium bg-paper-2">{sum.toLocaleString("ko-KR")}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ActorBadge({ actor }: { actor: "CUSTOMER" | "OPERATOR" | "SYSTEM" }) {
  const color =
    actor === "CUSTOMER" ? "var(--tx-transfer-in)"
    : actor === "OPERATOR" ? "var(--tx-transfer-out)"
    : "var(--ink-3)";
  return (
    <span
      className="font-mono text-[10px] uppercase px-1.5 py-px border tnum"
      style={{ color, borderColor: color }}
    >
      {actor}
    </span>
  );
}
