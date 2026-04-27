// 화면 10 — 실시간 거래 모니터.
//
// IA 매핑 (docs/ux/screen-ia.md §화면 10):
//   ① KPI 4개 ② 분당 거래량 60-bucket 라인 ③ 채널 분포 도넛 ④ 도메인별 표

import { DeskShell } from "@/components/shells/DeskShell";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { PageEyebrow } from "@/components/chrome/PageEyebrow";
import { Donut } from "@/components/primitives/Donut";
import {
  KPIS,
  TXN_PER_MINUTE,
  CHANNEL_DISTRIBUTION,
  DOMAIN_HEALTH,
  type Kpi,
} from "@/data/ops-fixtures";

const NAV = [
  { key: "monitor", label: "실시간 모니터", active: true },
  { key: "fds",     label: "FDS 패턴" },
  { key: "limit",   label: "한도 임박" },
  { key: "report",  label: "감사 리포트" },
  { key: "batch",   label: "배치 잡" },
];

export default function Page() {
  return (
    <>
      <div className="px-10 pt-6 pb-2 max-w-[1280px]">
        <PageEyebrow screenId="monitor" variant="deskshell" />
      </div>
      <DeskShell route="GET /ops/dashboard" traceId="trace-OPS-MON" nav={NAV}>
        <div className="p-6 max-w-[1280px]">
          <KpiRow kpis={KPIS} />

          <div className="grid grid-cols-[1fr_300px] gap-3 mt-3">
            <ThroughputChart series={TXN_PER_MINUTE} />
            <ChannelDonut />
          </div>

          <DomainTable />
        </div>
      </DeskShell>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function KpiRow({ kpis }: { kpis: Kpi[] }) {
  return (
    <section className="grid grid-cols-4 gap-3">
      {kpis.map((k) => <KpiCard key={k.id} kpi={k} />)}
    </section>
  );
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  const trendColor =
    kpi.trend === "up"   ? "var(--tx-deposit)"
    : kpi.trend === "down" ? "var(--st-suspended)"
    : "var(--ink-3)";
  const arrow = kpi.trend === "up" ? "▲" : kpi.trend === "down" ? "▼" : "─";
  return (
    <div className="border border-rule-strong bg-paper p-4">
      <div className="font-mono text-[10px] text-ink-3 uppercase tracking-[0.06em] mb-1">{kpi.label}</div>
      <div className="font-sans tnum font-medium text-[32px] tracking-[-0.02em] leading-none mb-2">{kpi.value}</div>
      <div className="font-mono text-[11px] tnum" style={{ color: trendColor }}>
        {arrow} {Math.abs(kpi.deltaPct).toFixed(1)}% <span className="text-ink-3">전 시간 대비</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function ThroughputChart({ series }: { series: number[] }) {
  const max = Math.max(...series);
  const min = Math.min(...series);
  const W = 720, H = 220, P = 24;
  const xStep = (W - P * 2) / (series.length - 1);

  const points = series.map((v, i) => {
    const x = P + i * xStep;
    const y = P + (1 - (v - min) / (max - min || 1)) * (H - P * 2);
    return [x, y];
  });

  const path = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${path} L${points[points.length - 1][0].toFixed(1)},${H - P} L${points[0][0].toFixed(1)},${H - P} Z`;

  return (
    <section className="border border-rule-strong bg-paper p-4">
      <div className="flex items-baseline justify-between mb-2">
        <Eyebrow>분당 거래량 · 60 분</Eyebrow>
        <div className="font-mono text-[10px] text-ink-3 tnum">min {min} · max {max}</div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" aria-label="분당 거래량 라인 차트">
        {[0.25, 0.5, 0.75].map((p) => {
          const y = P + p * (H - P * 2);
          return <line key={p} x1={P} x2={W - P} y1={y} y2={y} stroke="var(--rule)" strokeWidth={0.5} />;
        })}
        <path d={area} fill="var(--accent)" opacity={0.08} />
        <path d={path} fill="none" stroke="var(--accent)" strokeWidth={1.5} />
        {points.filter((_, i) => i % 10 === 0).map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={2.5} fill="var(--paper)" stroke="var(--accent)" strokeWidth={1.5} />
        ))}
      </svg>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function ChannelDonut() {
  return (
    <section className="border border-rule-strong bg-paper p-4">
      <Eyebrow className="mb-3">채널 분포</Eyebrow>
      <div className="flex items-center gap-4">
        <Donut
          parts={CHANNEL_DISTRIBUTION.map((c) => ({ value: c.pct, color: c.color, label: c.channel }))}
          size={120}
          thickness={16}
        />
        <ul className="flex-1 space-y-1.5 font-mono text-[11px]">
          {CHANNEL_DISTRIBUTION.map((c) => (
            <li key={c.channel} className="flex items-center gap-2">
              <span className="w-2 h-2 shrink-0" style={{ background: c.color }} />
              <span className="text-ink-2 flex-1">{c.channel}</span>
              <span className="tnum text-ink">{c.pct}%</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function DomainTable() {
  return (
    <section className="border border-rule-strong bg-paper mt-3">
      <div className="px-4 py-3 border-b border-rule">
        <Eyebrow>도메인별 성공/실패 (최근 1시간)</Eyebrow>
      </div>
      <table className="w-full font-mono text-[11px]">
        <thead>
          <tr className="border-b border-rule">
            {["도메인", "성공", "실패", "성공률", "top error"].map((h) => (
              <th key={h} className="text-left px-4 py-2 font-normal text-ink-3 uppercase tracking-[0.04em]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DOMAIN_HEALTH.map((d) => {
            const total = d.ok + d.err;
            const pct = total > 0 ? (d.ok / total) * 100 : 0;
            return (
              <tr key={d.domain} className="border-b border-rule last:border-b-0">
                <td className="px-4 py-2.5 font-serif text-sm">{d.domain}</td>
                <td className="px-4 py-2.5 tnum">{d.ok.toLocaleString("ko-KR")}</td>
                <td className="px-4 py-2.5 tnum" style={{ color: d.err > 0 ? "var(--st-suspended)" : "var(--ink-3)" }}>
                  {d.err.toLocaleString("ko-KR")}
                </td>
                <td className="px-4 py-2.5 tnum" style={{ color: pct >= 99 ? "var(--tx-deposit)" : "var(--st-edd-pending)" }}>
                  {pct.toFixed(2)}%
                </td>
                <td className="px-4 py-2.5 text-ink-2">{d.topError ?? "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
