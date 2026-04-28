// 16-화면 인덱스 허브
import Link from "next/link";
import type { Route } from "next";
import { SCREENS, GROUP_INFO, type ScreenGroup } from "@/lib/screens";

const GROUPS: ScreenGroup[] = ["CUSTOMER", "OPERATOR", "Ops", "DESIGN_SYSTEM"];

export default function HubPage() {
  return (
    <>
      <section className="border-b border-rule">
        <div className="mx-auto max-w-[1440px] px-10 pt-[60px] pb-10">
          <div className="font-mono text-[11px] tracking-eyebrow uppercase text-ink-3">
            Case Study · 2026 · Banking System
          </div>
          <h1 className="font-serif text-[48px] leading-[1.05] font-medium tracking-[-0.025em] mt-1.5 mb-3.5 max-w-[900px]">
            xbank — 계좌·정기예금 뱅킹 시스템의 16 화면.
          </h1>
          <p className="font-serif text-base text-ink-3 max-w-[720px] leading-relaxed m-0">
            actor·channel·Idempotency, FDS·한도 가드, 51개 ErrorCode, append-only audit log.
            백엔드가 다루는 도메인 규칙을 UI로 직접 만져볼 수 있는 인터랙티브 케이스 스터디입니다.
            <span className="text-tx-withdraw">백엔드 코드는 보안 정책상 비공개이며, 데모는 프론트엔드만 배포되어 일부 인터랙션은 끝까지 동작하지 않습니다.</span>
          </p>
          <div className="flex gap-10 mt-8 flex-wrap">
            {([["16","화면"],["5","도메인"],["3","actor"],["7","channel"],["51","에러 코드"]] as const).map(([v, l]) => (
              <div key={l}>
                <div className="font-sans text-[26px] font-medium tracking-[-0.02em]">{v}</div>
                <div className="font-mono text-[10px] tracking-[0.06em] text-ink-3 uppercase mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-10 py-10">
        <div className="grid grid-cols-4 border-t border-ink border-l border-rule">
          {GROUPS.map((g) => {
            const items = SCREENS.filter((s) => s.group === g);
            const info = GROUP_INFO[g];
            return (
              <FragmentGroup key={g} letter={info.letter} label={info.label} count={items.length}>
                {items.map((s) => (
                  <Link
                    key={s.id}
                    href={s.route as Route}
                    className="relative flex flex-col gap-2 min-h-[180px] px-[22px] pt-6 pb-[18px] border-r border-b border-rule bg-paper hover:bg-paper-2 transition-colors"
                  >
                    <div className="font-mono text-[11px] tracking-[0.06em] text-ink-3">SCREEN {s.n}</div>
                    <div className="font-serif text-lg font-medium tracking-[-0.01em] leading-tight">{s.title}</div>
                    <div className="text-xs text-ink-3 leading-relaxed flex-1">{s.desc}</div>
                    <div className="font-mono text-[10px] tracking-[0.04em] uppercase flex gap-2 text-ink-3">
                      {s.tags.map((t) => (
                        <span key={t} className="px-1.5 py-0.5 border border-rule-strong">{t}</span>
                      ))}
                    </div>
                    <span className="absolute top-[22px] right-[22px] font-mono text-ink-3">→</span>
                  </Link>
                ))}
              </FragmentGroup>
            );
          })}
        </div>
      </section>
    </>
  );
}

function FragmentGroup({ letter, label, count, children }: { letter: string; label: string; count: number; children: React.ReactNode }) {
  return (
    <>
      <div className="col-span-full bg-paper-2 px-[22px] py-3.5 border-r border-rule border-b border-ink flex items-baseline gap-3.5">
        <span className="font-mono text-[11px] tracking-[0.08em] text-ink-3">{letter}</span>
        <span className="font-serif text-base font-medium">{label}</span>
        <span className="font-mono text-[11px] text-ink-3">· {count}화면</span>
      </div>
      {children}
    </>
  );
}
