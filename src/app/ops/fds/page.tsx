// 화면 11 — FDS 패턴 보드.
//
// IA 매핑 (docs/ux/screen-ia.md §화면 11):
//   ① 헤더 KPI ② 시간대 heatmap (24×7) ③ reasonCode ranking ④ 채널 비교 ⑤ drill-down 표

import Link from "next/link";
import type { Route } from "next";
import { DeskShell } from "@/components/shells/DeskShell";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import {
  FDS_HEATMAP,
  FDS_REASON_RANKING,
  FDS_CHANNEL_REJECT_RATE,
  FDS_REJECTIONS,
} from "@/data/ops-fixtures";

const NAV = [
  { key: "monitor", label: "실시간 모니터" },
  { key: "fds",     label: "FDS 패턴", active: true },
  { key: "limit",   label: "한도 임박" },
  { key: "report",  label: "감사 리포트" },
  { key: "batch",   label: "배치 잡" },
];

export default function Page() {
  const totalToday = FDS_HEATMAP.flat().reduce((s, n) => s + n, 0);
  const yday = Math.round(totalToday * 0.94);
  return (
    <>
      <div className="px-10 pt-6 pb-2 max-w-[1280px]">
        <Link href="/" className="font-mono text-[11px] text-ink-3 hover:text-ink">← all screens</Link>
        <Eyebrow className="mt-3 mb-1">SCREEN 11 · OPS · DESKTOP</Eyebrow>
      </div>
      <DeskShell route="GET /ops/fds" traceId="trace-OPS-FDS" nav={NAV}>
        <div className="p-6 max-w-[1280px]">
          <KpiHeader total={totalToday} yday={yday} />

          <div className="grid grid-cols-[1fr_360px] gap-3 mt-3">
            <Heatmap data={FDS_HEATMAP} />
            <ReasonRanking />
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <ChannelCompare />
            <RecentRejections />
          </div>
        </div>
      </DeskShell>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function KpiHeader({ total, yday }: { total: number; yday: number }) {
  const top = FDS_REASON_RANKING[0];
  const delta = ((total - yday) / yday) * 100;
  return (
    <section className="grid grid-cols-3 gap-3">
      <div className="border border-rule-strong bg-paper p-4">
        <div className="font-mono text-[10px] text-ink-3 uppercase tracking-[0.06em] mb-1">오늘 FDS 거부</div>
        <div className="font-sans tnum font-medium text-[32px] tracking-[-0.02em] leading-none">{total.toLocaleString("ko-KR")}</div>
        <div className="font-mono text-[11px] tnum mt-2" style={{ color: delta > 0 ? "var(--st-suspended)" : "var(--tx-deposit)" }}>
          {delta > 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}% <span className="text-ink-3">전일 대비</span>
        </div>
      </div>
      <div className="border border-rule-strong bg-paper p-4">
        <div className="font-mono text-[10px] text-ink-3 uppercase tracking-[0.06em] mb-1">전일 FDS 거부</div>
        <div className="font-sans tnum font-medium text-[32px] tracking-[-0.02em] leading-none text-ink-2">{yday.toLocaleString("ko-KR")}</div>
        <div className="font-mono text-[11px] text-ink-3 mt-2">기준선</div>
      </div>
      <div className="border border-rule-strong bg-paper p-4">
        <div className="font-mono text-[10px] text-ink-3 uppercase tracking-[0.06em] mb-1">Top reasonCode</div>
        <code className="font-mono text-base font-medium block break-all leading-tight mb-1">{top.code}</code>
        <div className="font-mono text-[11px] tnum text-ink-3">
          {top.count}건 · {top.deltaPct >= 0 ? "▲" : "▼"} {Math.abs(top.deltaPct).toFixed(1)}%
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function Heatmap({ data }: { data: number[][] }) {
  const max = Math.max(...data.flat());
  const days = ["월", "화", "수", "목", "금", "토", "일"];
  return (
    <section className="border border-rule-strong bg-paper p-4">
      <Eyebrow className="mb-3">시간대 heatmap · 24h × 7일</Eyebrow>
      <div className="flex">
        <div className="flex flex-col mr-2 font-mono text-[10px] text-ink-3 tnum">
          <div className="h-4" />
          {days.map((d) => <div key={d} className="h-6 leading-6">{d}</div>)}
        </div>
        <div className="flex-1">
          <div className="flex font-mono text-[9px] text-ink-3 mb-1">
            {Array.from({ length: 24 }).map((_, h) => (
              <div key={h} className="flex-1 text-center tnum">{h % 3 === 0 ? h : ""}</div>
            ))}
          </div>
          {data.map((row, d) => (
            <div key={d} className="flex">
              {row.map((v, h) => {
                const t = max === 0 ? 0 : v / max;
                return (
                  <div
                    key={h}
                    className="flex-1 h-6 border border-paper"
                    title={`${days[d]} ${h}시 · ${v}건`}
                    style={{ background: heatColor(t) }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 mt-3 font-mono text-[10px] text-ink-3 tnum">
        <span>0</span>
        <div className="flex">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-4 h-3" style={{ background: heatColor(i / 5) }} />
          ))}
        </div>
        <span>{max}</span>
      </div>
    </section>
  );
}

function heatColor(t: number): string {
  if (t === 0) return "var(--paper-2)";
  // accent → suspended 그라데이션 보간
  const r = Math.round(45  + (139 - 45)  * t);
  const g = Math.round(74  + ( 69 - 74)  * t);
  const b = Math.round(62  + ( 67 - 62)  * t);
  return `rgb(${r},${g},${b})`;
}

// ─────────────────────────────────────────────────────────────────────────────
function ReasonRanking() {
  const max = Math.max(...FDS_REASON_RANKING.map((r) => r.count));
  return (
    <section className="border border-rule-strong bg-paper p-4">
      <Eyebrow className="mb-3">reasonCode ranking</Eyebrow>
      <ul className="space-y-3">
        {FDS_REASON_RANKING.map((r) => (
          <li key={r.code}>
            <div className="flex items-baseline justify-between font-mono text-[11px] mb-1">
              <code className="font-medium">{r.code}</code>
              <span className="tnum text-ink">{r.count}</span>
            </div>
            <div className="h-1 bg-rule">
              <div
                className="h-full"
                style={{ width: `${(r.count / max) * 100}%`, background: "var(--st-suspended)" }}
              />
            </div>
            <div
              className="font-mono text-[10px] tnum mt-0.5"
              style={{ color: r.deltaPct > 0 ? "var(--st-suspended)" : "var(--tx-deposit)" }}
            >
              {r.deltaPct > 0 ? "▲" : "▼"} {Math.abs(r.deltaPct).toFixed(1)}%
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function ChannelCompare() {
  const max = Math.max(...FDS_CHANNEL_REJECT_RATE.map((c) => c.rate));
  return (
    <section className="border border-rule-strong bg-paper p-4">
      <Eyebrow className="mb-3">채널별 거부율 (%)</Eyebrow>
      <ul className="space-y-2.5">
        {FDS_CHANNEL_REJECT_RATE.map((c) => (
          <li key={c.channel}>
            <div className="flex items-baseline justify-between font-mono text-[11px] mb-1">
              <span>{c.channel}</span>
              <span className="tnum">{c.rate.toFixed(2)}%</span>
            </div>
            <div className="h-2 bg-rule">
              <div
                className="h-full"
                style={{
                  width: max ? `${(c.rate / max) * 100}%` : 0,
                  background: c.rate > 0.5 ? "var(--st-suspended)" : c.rate > 0.1 ? "var(--st-edd-pending)" : "var(--tx-deposit)",
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function RecentRejections() {
  return (
    <section className="border border-rule-strong bg-paper">
      <div className="px-4 py-3 border-b border-rule flex items-center justify-between">
        <Eyebrow>최근 거부 거래 · drill-down</Eyebrow>
        <button className="font-mono text-[10px] text-ink-3 hover:text-ink uppercase tracking-[0.06em]">CSV ↓</button>
      </div>
      <table className="w-full font-mono text-[10px]">
        <thead>
          <tr className="border-b border-rule">
            {["시각", "계좌", "금액", "reason", "채널", "score", ""].map((h) => (
              <th key={h} className="text-left px-3 py-2 font-normal text-ink-3 uppercase tracking-[0.04em]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {FDS_REJECTIONS.map((r, i) => (
            <tr key={i} className="border-b border-rule last:border-b-0 hover:bg-paper-2">
              <td className="px-3 py-2 tnum text-ink-3">
                {new Date(r.ts).toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" })}
              </td>
              <td className="px-3 py-2 tnum">{r.accountMasked}</td>
              <td className="px-3 py-2 tnum">{r.amountMasked}</td>
              <td className="px-3 py-2"><code>{r.reason}</code></td>
              <td className="px-3 py-2 text-ink-2">{r.channel}</td>
              <td className="px-3 py-2 tnum" style={{ color: r.score >= 0.85 ? "var(--st-suspended)" : "var(--st-edd-pending)" }}>
                {r.score.toFixed(2)}
              </td>
              <td className="px-3 py-2 text-right">
                <Link
                  href={"/operator/audit-diff" as Route}
                  className="font-mono text-[10px] text-ink-3 hover:text-ink"
                  title="감사 diff 로 drill-down"
                >
                  audit →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
