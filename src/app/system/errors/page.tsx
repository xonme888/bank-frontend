// 화면 13 — ErrorCode 카탈로그.
//
// IA 매핑 (docs/ux/screen-ia.md §화면 13):
//   ① 헤더 (총 51) ② 카테고리 탭 ③ 카드 그리드 (코드명·status·라벨·재시도) ④ 검색
//
// 데이터: src/data/error-codes.ts (백엔드 ErrorCode.java 와 1:1 정합).
// 검색 필터링은 클라이언트에서 처리 ("use client" 격리는 SearchableCatalog 컴포넌트만).

import Link from "next/link";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { ERROR_CODES, ERROR_CATEGORY_LABEL, type ErrorCategory, type ErrorEntry } from "@/data/error-codes";
import { SearchableCatalog } from "./SearchableCatalog";

const CATEGORY_ORDER: ErrorCategory[] = [
  "CUSTOMER", "ACCOUNT", "TIME_DEPOSIT", "TRANSACTION", "COMMON", "IDEMPOTENCY",
];

export default function Page() {
  const total = ERROR_CODES.length;
  const byCategory = CATEGORY_ORDER.map((c) => ({
    category: c,
    label: ERROR_CATEGORY_LABEL[c],
    items: ERROR_CODES.filter((e) => e.category === c),
  }));

  return (
    <div className="bg-paper-2 min-h-[calc(100vh-58px)]">
      <div className="mx-auto max-w-[1200px] p-10 pb-20">
        <Link href="/" className="font-mono text-[11px] text-ink-3 hover:text-ink">← all screens</Link>

        <Eyebrow className="mt-6 mb-3">SCREEN 13 · DESIGN SYSTEM</Eyebrow>
        <h1 className="font-serif text-[40px] leading-[1.1] font-medium tracking-[-0.025em] mb-2">
          Error code catalog
        </h1>
        <p className="font-serif text-base text-ink-2 max-w-[640px] leading-relaxed mb-8">
          백엔드 <code className="font-mono text-sm bg-paper px-1.5">ErrorCode.java</code> 의
          {" "}{total}개 코드를 카테고리별로 정리. UX 라이팅·HTTP status·재시도 가이드의
          단일 진실의 원천.
        </p>

        <div className="grid grid-cols-[1fr_180px] gap-10 mb-10">
          <Stats total={total} byCategory={byCategory} />
          <DomainKey />
        </div>

        <SearchableCatalog byCategory={byCategory} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function Stats({
  total,
  byCategory,
}: {
  total: number;
  byCategory: Array<{ category: ErrorCategory; label: string; items: ErrorEntry[] }>;
}) {
  return (
    <section>
      <Eyebrow className="mb-2">분포</Eyebrow>
      <div className="border border-rule-strong bg-paper">
        <table className="w-full font-mono text-[11px]">
          <tbody>
            <tr className="border-b border-rule">
              <td className="px-3 py-2 text-ink-2">총합</td>
              <td className="px-3 py-2 tnum text-right font-medium">{total}</td>
              <td className="px-3 py-2 text-ink-3 w-[55%]">백엔드 ErrorCode enum 과 동일</td>
            </tr>
            {byCategory.map(({ category, label, items }) => (
              <tr key={category} className="border-b border-rule last:border-b-0">
                <td className="px-3 py-2 text-ink-2">{label}</td>
                <td className="px-3 py-2 tnum text-right">{items.length}</td>
                <td className="px-3 py-2 text-ink-3">
                  {items.slice(0, 3).map((e) => e.code).join(" · ")}
                  {items.length > 3 && " …"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function DomainKey() {
  const keys: Array<{ status: number; label: string; color: string }> = [
    { status: 400, label: "Validation",   color: "var(--st-edd-pending)" },
    { status: 403, label: "Forbidden",    color: "var(--st-suspended)"   },
    { status: 404, label: "Not found",    color: "var(--ink-3)"          },
    { status: 409, label: "Conflict",     color: "var(--st-edd-pending)" },
    { status: 422, label: "Unprocessable",color: "var(--st-suspended)"   },
    { status: 503, label: "Unavailable",  color: "var(--st-matured)"     },
  ];
  return (
    <section>
      <Eyebrow className="mb-2">HTTP status</Eyebrow>
      <ul className="border border-rule-strong bg-paper p-3 space-y-1.5">
        {keys.map((k) => (
          <li key={k.status} className="flex items-center gap-2 font-mono text-[11px]">
            <span className="w-2 h-2" style={{ background: k.color }} />
            <span className="tnum w-8">{k.status}</span>
            <span className="text-ink-3">{k.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
