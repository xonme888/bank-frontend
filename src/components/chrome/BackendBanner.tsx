// 백엔드 미연결 / 데이터 없음 시의 fixture fallback 안내 배너.
// LIVE 화면 5개의 동일한 "border-l-2 + uppercase 사유 + reason pre" 패턴을 통합.

export function BackendBanner({
  reason,
  message = "백엔드 미연결 · fixture 표시",
  className = "mb-3",
}: {
  reason: string;
  message?: string;
  className?: string;
}) {
  return (
    <div className={"border-l-2 border-st-suspended bg-paper p-3 " + className}>
      <div className="font-mono text-[10px] text-ink-3 uppercase tracking-[0.04em] mb-0.5">
        {message}
      </div>
      <pre className="font-mono text-[10px] text-ink-3">{reason}</pre>
    </div>
  );
}
