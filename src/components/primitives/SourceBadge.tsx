// 데이터 출처 배지 — LIVE 백엔드 호출(REAL) vs 데모 fixture(DEMO).
// font-mono 9px uppercase 사각 테두리. accent vs ink-3 색 분기.

export function SourceBadge({ live }: { live: boolean }) {
  return (
    <span
      className="font-mono text-[9px] tracking-[0.06em] uppercase px-1 py-px border"
      style={{
        color: live ? "var(--accent)" : "var(--ink-3)",
        borderColor: live ? "var(--accent)" : "var(--ink-3)",
      }}
    >
      {live ? "real" : "demo"}
    </span>
  );
}
