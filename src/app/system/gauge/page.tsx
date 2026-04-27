// 화면 14 — 한도 게이지 컴포넌트 데모.
//
// IA 매핑 (docs/ux/screen-ia.md §화면 14):
//   ① 컴포넌트 데모 ② 변형 갤러리 ③ 사용 가이드 ④ Props 표

import { Eyebrow } from "@/components/primitives/Eyebrow";
import { PageEyebrow } from "@/components/chrome/PageEyebrow";
import { GaugeRow } from "@/components/primitives/GaugeRow";

export default function Page() {
  return (
    <div className="bg-paper-2 min-h-[calc(100vh-58px)]">
      <div className="mx-auto max-w-[1200px] p-10 pb-20">
        <PageEyebrow screenId="gauge" />
        <h1 className="font-serif text-[40px] leading-[1.1] font-medium tracking-[-0.025em] mb-2">
          Limit gauge
        </h1>
        <p className="font-serif text-base text-ink-2 max-w-[640px] leading-relaxed mb-10">
          채널별 일일 한도(BR-TX-90~93) 사용량을 표시하는 단일 막대.
          ChannelGroup 단위로 분리해 한 화면에 다중 노출 가능.
        </p>

        <div className="grid grid-cols-[1fr_280px] gap-10">
          <main>
            <Variants />
            <UsageRules />
          </main>
          <aside>
            <PropsTable />
          </aside>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function Variants() {
  const cases: ReadonlyArray<{ pct: number; label: string; note: string; exempt?: boolean }> = [
    { pct: 0,   label: "비대면 (모바일·웹)", note: "0% — 미사용 · accent 색" },
    { pct: 50,  label: "비대면 (모바일·웹)", note: "50% — 정상 진행 · accent" },
    { pct: 80,  label: "ATM",                  note: "80% — 임계(threshold) · 노랑 경고" },
    { pct: 95,  label: "ATM",                  note: "95% — 임박 · 같은 경고색 유지" },
    { pct: 100, label: "비대면 (모바일·웹)", note: "100% — 초과 · 적색" },
    { pct: 0,   label: "영업창구",              note: "면제 채널 — 줄무늬 hatch", exempt: true },
  ];

  return (
    <section className="mb-10">
      <Eyebrow className="mb-3">변형 갤러리</Eyebrow>
      <div className="border border-rule-strong bg-paper p-6">
        {cases.map((c, i) => (
          <div key={i} className="mb-4 last:mb-0 pb-4 last:pb-0 border-b last:border-b-0 border-rule">
            <div className="font-mono text-[10px] text-ink-3 uppercase tracking-[0.04em] mb-2">
              {c.note}
            </div>
            <GaugeRow pct={c.pct} label={c.label} exempt={c.exempt} />
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function UsageRules() {
  const items: ReadonlyArray<{ kind: "do" | "dont"; text: string }> = [
    { kind: "do",   text: "ChannelGroup 단위로 분리 — 비대면(WEB/MOBILE/API) · ATM · 대면·BATCH 면제 4그룹" },
    { kind: "do",   text: "출금 거래 발행 직전 가드(잠금 후) 와 동일한 산식으로 표시 — 사용자가 거부 사유를 미리 인지" },
    { kind: "do",   text: "면제 채널은 hatch 패턴으로 비활성 시각화 — 진행률 0% 와 구분" },
    { kind: "dont", text: "임계 색을 임의로 바꾸지 말 것 — withdraw/transfer 양쪽 일관성" },
    { kind: "dont", text: "입금/이체입금/만기 지급에 사용하지 말 것 — 출금성 거래만 한도 산정 (BR-TX-90)" },
    { kind: "dont", text: "단일 게이지로 다중 채널 합산 표시 금지 — 면제 그룹이 섞이면 의미 왜곡" },
  ];
  return (
    <section>
      <Eyebrow className="mb-3">사용 가이드</Eyebrow>
      <ul className="border border-rule-strong bg-paper divide-y divide-rule">
        {items.map((it, i) => (
          <li key={i} className="px-4 py-3 flex items-start gap-3">
            <span
              className="font-mono text-[10px] tracking-[0.06em] uppercase shrink-0 w-10 text-center pt-0.5"
              style={{
                color: it.kind === "do" ? "var(--tx-deposit)" : "var(--st-suspended)",
              }}
            >
              {it.kind === "do" ? "Do" : "Don't"}
            </span>
            <span className="text-sm leading-relaxed text-ink-2">{it.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function PropsTable() {
  const props: ReadonlyArray<{ name: string; type: string; note: string; required?: boolean }> = [
    { name: "pct",       type: "number",  note: "0~100, 100 초과 시 적색 고정", required: true },
    { name: "label",     type: "string",  note: "채널 이름 (예: '비대면 (모바일·웹)')", required: true },
    { name: "exempt",    type: "boolean", note: "true 면 hatch + '— 면제' 표시" },
    { name: "threshold", type: "number",  note: "경고색 전환점 (default 80)" },
  ];
  return (
    <section className="sticky top-6">
      <Eyebrow className="mb-3">Props · GaugeRow</Eyebrow>
      <div className="border border-rule-strong bg-paper">
        <table className="w-full font-mono text-[10px]">
          <thead>
            <tr className="border-b border-rule">
              <th className="text-left px-3 py-2 font-normal text-ink-3 uppercase tracking-[0.06em]">name</th>
              <th className="text-left px-3 py-2 font-normal text-ink-3 uppercase tracking-[0.06em]">type</th>
            </tr>
          </thead>
          <tbody>
            {props.map((p) => (
              <tr key={p.name} className="border-b border-rule last:border-b-0 align-top">
                <td className="px-3 py-2">
                  <div className="font-medium">
                    {p.name}{p.required && <span className="text-st-suspended">*</span>}
                  </div>
                  <div className="text-ink-3 mt-1 leading-relaxed">{p.note}</div>
                </td>
                <td className="px-3 py-2 text-ink-2 whitespace-nowrap">{p.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 border border-rule-strong bg-paper p-3 font-mono text-[10px] leading-relaxed text-ink-2 whitespace-pre">
{`<GaugeRow
  pct={60}
  label="비대면 (모바일·웹)"
  threshold={80}
/>`}
      </div>
    </section>
  );
}
