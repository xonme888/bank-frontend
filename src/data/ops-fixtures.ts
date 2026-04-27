// Ops 화면 (10/11/12) fixture.
// 실 백엔드 micrometer + actuator endpoint 가 추후 연결됨 (현재는 시연용 정적값).

// ─────────────────────────────────────────────────────────────────────────────
// 화면 10 — 실시간 거래 모니터
export type Kpi = { id: string; label: string; value: string; deltaPct: number; trend: "up" | "down" | "flat" };

export const KPIS: Kpi[] = [
  { id: "tps",     label: "분당 거래량",      value: "412",   deltaPct:  6.2, trend: "up"   },
  { id: "success", label: "성공률",            value: "99.4%", deltaPct: -0.1, trend: "down" },
  { id: "p95",     label: "P95 응답시간",      value: "118ms", deltaPct: -3.0, trend: "down" },
  { id: "fds",     label: "FDS 거부율",        value: "0.42%", deltaPct:  0.8, trend: "up"   },
];

// 분당 거래량 — 60-bucket (지난 1시간)
export const TXN_PER_MINUTE: number[] = [
  340, 355, 360, 372, 388, 401, 393, 410, 422, 415, 418, 425, 410, 408, 416, 420,
  428, 419, 405, 401, 408, 412, 410, 405, 398, 402, 410, 415, 422, 430, 435, 432,
  428, 420, 419, 415, 411, 410, 414, 418, 422, 425, 419, 410, 408, 412, 416, 419,
  420, 424, 422, 418, 414, 411, 414, 416, 418, 419, 415, 412,
];

export const CHANNEL_DISTRIBUTION: ReadonlyArray<{ channel: string; pct: number; color: string }> = [
  { channel: "MOBILE",      pct: 62, color: "var(--tx-deposit)" },
  { channel: "WEB",         pct: 18, color: "var(--tx-transfer-in)" },
  { channel: "ATM",         pct: 12, color: "var(--tx-maturity-payout)" },
  { channel: "BRANCH",      pct:  6, color: "var(--tx-transfer-out)" },
  { channel: "CALL_CENTER", pct:  2, color: "var(--ink-3)" },
];

export const DOMAIN_HEALTH: ReadonlyArray<{
  domain: string;
  ok: number;
  err: number;
  topError?: string;
}> = [
  { domain: "Customer",    ok: 1240, err:  3 },
  { domain: "Account",     ok: 4218, err: 12, topError: "EDD_APPROVAL_NOT_ALLOWED" },
  { domain: "TimeDeposit", ok:  392, err:  2 },
  { domain: "Transaction", ok:18024, err: 87, topError: "DAILY_TRANSFER_LIMIT_EXCEEDED" },
  { domain: "Transfer",    ok: 6471, err: 41, topError: "FRAUD_DETECTION_REJECTED" },
];

// ─────────────────────────────────────────────────────────────────────────────
// 화면 11 — FDS 패턴 보드
// 24h × 7days heatmap (행=요일 0~6, 열=시간 0~23). 값 = 거부 건수.
export const FDS_HEATMAP: number[][] = (() => {
  const rows: number[][] = [];
  for (let d = 0; d < 7; d++) {
    const row: number[] = [];
    for (let h = 0; h < 24; h++) {
      const wave = Math.sin((h / 24) * Math.PI * 2 + d * 0.7) + 1;
      const noise = ((h * 13 + d * 7) % 5) / 5;
      row.push(Math.round((wave * 18 + noise * 6 + (h >= 22 || h <= 2 ? 12 : 0))));
    }
    rows.push(row);
  }
  return rows;
})();

export const FDS_REASON_RANKING: ReadonlyArray<{ code: string; count: number; deltaPct: number }> = [
  { code: "VELOCITY_SHORT_WINDOW",   count: 142, deltaPct:  18.3 },
  { code: "NEW_DEVICE_LARGE_AMOUNT", count:  89, deltaPct:   2.1 },
  { code: "FOREIGN_IP_SUSPICIOUS",   count:  61, deltaPct: -12.0 },
  { code: "RECIPIENT_SHARED_PATTERN",count:  47, deltaPct:   5.6 },
  { code: "ROUND_NUMBER_HEURISTIC",  count:  31, deltaPct:  -1.2 },
];

export const FDS_CHANNEL_REJECT_RATE: ReadonlyArray<{ channel: string; rate: number }> = [
  { channel: "MOBILE",      rate: 0.78 },
  { channel: "WEB",         rate: 0.42 },
  { channel: "ATM",         rate: 0.05 },
  { channel: "BRANCH",      rate: 0.00 },
  { channel: "CALL_CENTER", rate: 0.00 },
];

export type FdsRejectionRow = {
  ts: string;
  accountMasked: string;
  amountMasked: string;
  reason: string;
  channel: string;
  score: number;
};

export const FDS_REJECTIONS: FdsRejectionRow[] = [
  { ts: "2026-04-27T14:32:11+09:00", accountMasked: "110-***-4427", amountMasked: "1,***,000원",  reason: "VELOCITY_SHORT_WINDOW",   channel: "MOBILE", score: 0.91 },
  { ts: "2026-04-27T14:18:02+09:00", accountMasked: "110-***-2210", amountMasked: "***,000원",    reason: "NEW_DEVICE_LARGE_AMOUNT", channel: "MOBILE", score: 0.84 },
  { ts: "2026-04-27T13:55:34+09:00", accountMasked: "110-***-9012", amountMasked: "***,000원",    reason: "FOREIGN_IP_SUSPICIOUS",   channel: "WEB",    score: 0.77 },
  { ts: "2026-04-27T13:11:08+09:00", accountMasked: "110-***-5566", amountMasked: "5,***,000원",  reason: "VELOCITY_SHORT_WINDOW",   channel: "MOBILE", score: 0.93 },
  { ts: "2026-04-27T12:42:50+09:00", accountMasked: "110-***-7741", amountMasked: "**,000원",     reason: "ROUND_NUMBER_HEURISTIC",  channel: "ATM",    score: 0.69 },
  { ts: "2026-04-27T11:30:41+09:00", accountMasked: "110-***-1180", amountMasked: "***,000원",    reason: "RECIPIENT_SHARED_PATTERN",channel: "WEB",    score: 0.71 },
];

// ─────────────────────────────────────────────────────────────────────────────
// 화면 12 — 감사 리포트
export const REPORT_SUMMARY = {
  period: "2026-04-21 ~ 2026-04-27 (7일)",
  totalChanges: 28_341,
  byActor: { CUSTOMER: 24_812, OPERATOR: 3_180, SYSTEM: 349 },
  byChannel: { MOBILE: 18_402, WEB: 6_120, BRANCH: 2_100, ATM: 1_240, CALL_CENTER: 380, BATCH: 99 },
  appendOnlyHealth: { rowsBlockedByTrigger: 0, fkViolations: 0 },
};

export type ReportCell = { actor: "CUSTOMER" | "OPERATOR" | "SYSTEM"; channel: string; domain: string; count: number };

export const REPORT_TABLE: ReportCell[] = [
  { actor: "CUSTOMER", channel: "MOBILE", domain: "Customer",    count:  1230 },
  { actor: "CUSTOMER", channel: "MOBILE", domain: "Account",     count:  3811 },
  { actor: "CUSTOMER", channel: "MOBILE", domain: "Transaction", count: 11220 },
  { actor: "CUSTOMER", channel: "MOBILE", domain: "Transfer",    count:  2110 },
  { actor: "CUSTOMER", channel: "WEB",    domain: "Account",     count:   980 },
  { actor: "CUSTOMER", channel: "WEB",    domain: "Transaction", count:  4221 },
  { actor: "CUSTOMER", channel: "WEB",    domain: "Transfer",    count:   780 },
  { actor: "OPERATOR", channel: "BRANCH", domain: "Customer",    count:    98 },
  { actor: "OPERATOR", channel: "BRANCH", domain: "Account",     count:  1210 },
  { actor: "OPERATOR", channel: "BRANCH", domain: "Transaction", count:   470 },
  { actor: "OPERATOR", channel: "CALL_CENTER", domain: "Account", count:  220 },
  { actor: "SYSTEM",   channel: "BATCH", domain: "TimeDeposit",  count:   349 },
];
