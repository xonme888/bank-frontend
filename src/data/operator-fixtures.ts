// 백오피스 화면 fixture — 7/8/9 공통 데이터.
// 백엔드는 OPERATOR 검색·EDD 큐·감사로그 검색 endpoint 가 별도 미구현 (D-T 직원 콘솔 도메인 후속).

import type { AccountState } from "@/lib/tokens";

export type CustomerProfile = {
  id: number;
  nameMasked: string;
  phoneMasked: string;
  emailMasked: string;
  registeredAt: string;
  grade: "BASIC" | "VIP" | "VVIP";
  channelHint: string;          // 고객이 자주 쓰는 채널
};

export type AccountTreeNode = {
  kind: "DDA" | "TIME_DEPOSIT";
  productCode: string;
  alias: string;
  accountNumber: string;
  status: AccountState;
  balance: number;
};

export type AuditEvent = {
  ts: string;
  actorType: "CUSTOMER" | "OPERATOR" | "SYSTEM";
  actorId: string;
  channel: "WEB" | "MOBILE" | "BRANCH" | "CALL_CENTER" | "ATM" | "BATCH" | "API";
  summary: string;
  traceId: string;
  errorCode?: string;
};

export const CUSTOMER_360: CustomerProfile = {
  id: 1,
  nameMasked: "홍**",
  phoneMasked: "010-****-1234",
  emailMasked: "h***@example.com",
  registeredAt: "2024-08-12",
  grade: "VIP",
  channelHint: "MOBILE 88% · WEB 10% · BRANCH 2%",
};

export const CUSTOMER_ACCOUNT_TREE: AccountTreeNode[] = [
  { kind: "DDA",          productCode: "DDA-CHECK",   alias: "주거래 통장",        accountNumber: "110-***-7890", status: "ACTIVE",      balance: 2_450_000 },
  { kind: "DDA",          productCode: "DDA-SAVINGS", alias: "비상금 통장",        accountNumber: "110-***-2381", status: "ACTIVE",      balance: 4_320_000 },
  { kind: "DDA",          productCode: "DDA-PENDING", alias: "월급 통장",          accountNumber: "110-***-9054", status: "EDD_PENDING", balance: 0 },
  { kind: "TIME_DEPOSIT", productCode: "TDA-12M",     alias: "12개월 정기예금",   accountNumber: "TD-***-0011", status: "ACTIVE",      balance: 10_287_500 },
];

export const CUSTOMER_AUDIT_TIMELINE: AuditEvent[] = [
  { ts: "2026-04-27T19:32:11+09:00", actorType: "SYSTEM",   actorId: "batch-maturity",   channel: "BATCH",  summary: "TDA-12M 만기 자동 처리 → MATURITY_PAYOUT",                       traceId: "trace-A91F" },
  { ts: "2026-04-26T19:20:04+09:00", actorType: "CUSTOMER", actorId: "1",                channel: "MOBILE", summary: "이체 입금 250,000원 (신한 100-***-1199 → 110-***-7890)",       traceId: "trace-B891" },
  { ts: "2026-04-25T21:13:44+09:00", actorType: "CUSTOMER", actorId: "1",                channel: "ATM",    summary: "출금 80,000원",                                                  traceId: "trace-C440" },
  { ts: "2026-04-24T14:11:01+09:00", actorType: "OPERATOR", actorId: "OP-2103",          channel: "BRANCH", summary: "월급 통장 EDD 심사 시작 — 위험점수 0.62",                       traceId: "trace-D102", errorCode: undefined },
  { ts: "2026-04-22T10:00:00+09:00", actorType: "CUSTOMER", actorId: "1",                channel: "BRANCH", summary: "DEPOSIT 3,000,000원 (창구 입금)",                                 traceId: "trace-E908" },
  { ts: "2026-04-19T11:42:18+09:00", actorType: "OPERATOR", actorId: "OP-2103",          channel: "BRANCH", summary: "출금 시도 거부 — DAILY_TRANSFER_LIMIT_EXCEEDED",                  traceId: "trace-F377", errorCode: "DAILY_TRANSFER_LIMIT_EXCEEDED" },
];

// EDD 큐 ─────────────────────────────────────────────────────────────────────
export type EddQueueItem = {
  id: string;
  receivedAt: string;
  customerNameMasked: string;
  productCode: string;
  riskScore: number;        // 0~1
  waitMinutes: number;
  reasons: string[];        // KYC/약관/거래 이력 신호
  kycResult: "PASSED" | "WARN" | "FAILED";
  termsConsented: boolean;
};

export const EDD_QUEUE: EddQueueItem[] = [
  { id: "EDD-2026-04-27-001", receivedAt: "2026-04-27T09:12:33+09:00", customerNameMasked: "김**", productCode: "DDA-CHECK",   riskScore: 0.78, waitMinutes:  62, reasons: ["해외 송금 빈도 높음", "신규 디바이스 접속"],                kycResult: "WARN",   termsConsented: true  },
  { id: "EDD-2026-04-27-002", receivedAt: "2026-04-27T09:34:01+09:00", customerNameMasked: "이**", productCode: "DDA-SAVINGS", riskScore: 0.42, waitMinutes:  40, reasons: ["1년 내 명의 도용 신고 1건"],                                  kycResult: "PASSED", termsConsented: true  },
  { id: "EDD-2026-04-27-003", receivedAt: "2026-04-27T10:01:55+09:00", customerNameMasked: "박**", productCode: "DDA-CHECK",   riskScore: 0.91, waitMinutes:  13, reasons: ["대량 입출금 패턴", "VPN 의심 IP", "전화번호 1주 내 변경"], kycResult: "WARN",   termsConsented: false },
  { id: "EDD-2026-04-26-022", receivedAt: "2026-04-26T17:50:18+09:00", customerNameMasked: "최**", productCode: "DDA-PENDING", riskScore: 0.55, waitMinutes: 905, reasons: ["주민등록 정보 검증 보류"],                                    kycResult: "FAILED", termsConsented: true  },
];

// 감사로그 diff ───────────────────────────────────────────────────────────────
export type AuditDiff = {
  traceId: string;
  occurredAt: string;
  actorType: "CUSTOMER" | "OPERATOR" | "SYSTEM";
  actorId: string;
  channel: "WEB" | "MOBILE" | "BRANCH" | "CALL_CENTER" | "ATM" | "BATCH" | "API";
  ip: string;
  method: string;
  path: string;
  statusCode: number;
  errorCode?: string;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  chain: Array<{ ts: string; summary: string; traceId: string }>;
};

export const SAMPLE_AUDIT_DIFF: AuditDiff = {
  traceId: "trace-D102",
  occurredAt: "2026-04-24T14:11:01+09:00",
  actorType: "OPERATOR",
  actorId: "OP-2103",
  channel: "BRANCH",
  ip: "10.27.4.181",
  method: "POST",
  path: "/api/v1/accounts/302/approve-edd",
  statusCode: 200,
  before: {
    accountId: 302,
    accountNumber: "110-***-9054",
    status: "EDD_PENDING",
    suspendedAt: null,
    suspensionReason: null,
    eddRiskScore: 0.62,
    eddDecidedAt: null,
    eddDecidedBy: null,
  },
  after: {
    accountId: 302,
    accountNumber: "110-***-9054",
    status: "ACTIVE",
    suspendedAt: null,
    suspensionReason: null,
    eddRiskScore: 0.62,
    eddDecidedAt: "2026-04-24T14:11:01+09:00",
    eddDecidedBy: "OP-2103",
  },
  chain: [
    { ts: "2026-04-24T14:10:58+09:00", summary: "OPERATOR 가 EDD 큐 에서 항목 선택",     traceId: "trace-D102" },
    { ts: "2026-04-24T14:11:01+09:00", summary: "POST /accounts/302/approve-edd 200 OK", traceId: "trace-D102" },
    { ts: "2026-04-24T14:11:02+09:00", summary: "AccountStatus EDD_PENDING → ACTIVE",    traceId: "trace-D102" },
    { ts: "2026-04-24T14:11:02+09:00", summary: "tb_account_audit_log INSERT (append-only)", traceId: "trace-D102" },
  ],
};
