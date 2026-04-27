// 화면 전반의 ko-KR 표시 포맷 단일 공급원.
// 같은 산식이 여러 곳에 흩어진 상태를 통합 — 정의 변경 시 한 곳만 수정.

export function formatMoney(num: number): string {
  return num.toLocaleString("ko-KR");
}

export function formatDateTime(iso: string, opts?: Intl.DateTimeFormatOptions): string {
  return new Date(iso).toLocaleString("ko-KR", opts);
}

// 만기일까지 남은 일수 (음수는 0으로). 자정 경계 기준 ceil.
export function daysUntil(iso: string): number {
  const target = new Date(iso).getTime();
  return Math.max(0, Math.ceil((target - Date.now()) / 86_400_000));
}

// 발생 시각으로부터 경과 분 (1분 미만은 1로 보정 — UI 표기용).
export function minutesSince(iso: string): number {
  return Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
}
