// customer/home 대시보드의 fixture.
//
// 백엔드는 현재 "고객의 모든 계좌 목록" endpoint 가 없음 (GET /accounts 미구현).
// 단일 계좌 GET /api/v1/accounts/{id} 만 가능 — 화면 시각화를 위해 추가 카드는 fixture 로 보강.
//
// fixture 카드는 isFixture=true 표시로 화면에서 "데모" 배지를 노출 (real API 와 구분).

import type { AccountState } from "@/lib/tokens";

export type DashboardCard = {
  isFixture?: boolean;
  productCode: string;
  alias: string;
  accountNumber: string;
  status: AccountState;
  balance: number;
  /**
   * 백엔드 PiiMasker 가 마지막 3자리만 *** 로 가린 형태 (예: "2,450,***").
   * REAL 카드만 백엔드 응답 그대로 보존. fixture 카드는 number 로 직접 포맷.
   */
  balanceMasked?: string;
};

export type TimeDepositCard = {
  isFixture?: boolean;
  productCode: string;
  alias: string;
  principal: number;
  accruedInterest: number;
  rate: number;          // 연 %
  startedAt: string;
  maturesAt: string;     // ISO date
  status: AccountState;
};

export type Notification = {
  kind: "EDD_PENDING" | "MATURITY_NEAR" | "FDS_ALERT" | "SETTLEMENT_REQUIRED";
  title: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export const FIXTURE_DDA_CARDS: DashboardCard[] = [
  {
    isFixture: true,
    productCode: "DDA-SAVINGS",
    alias: "비상금 통장",
    accountNumber: "110-***-2381",
    status: "ACTIVE",
    balance: 4_320_000,
  },
  {
    isFixture: true,
    productCode: "DDA-PENDING",
    alias: "월급 통장",
    accountNumber: "110-***-9054",
    status: "EDD_PENDING",
    balance: 0,
  },
];

export const FIXTURE_TIME_DEPOSITS: TimeDepositCard[] = [
  {
    isFixture: true,
    productCode: "TDA-12M",
    alias: "12개월 정기예금",
    principal: 10_000_000,
    accruedInterest: 287_500,
    rate: 3.5,
    startedAt: "2025-09-01",
    maturesAt: "2026-09-01",
    status: "ACTIVE",
  },
];

export const FIXTURE_NOTIFICATIONS: Notification[] = [
  {
    kind: "EDD_PENDING",
    title: "EDD 심사 대기 중",
    body: "월급 통장(110-***-9054)이 EDD 심사 단계입니다. 평균 1~2영업일 소요됩니다.",
  },
  {
    kind: "MATURITY_NEAR",
    title: "정기예금 만기까지 D-128",
    body: "12개월 정기예금이 2026-09-01 만기 예정입니다. 결제 DDA로 자동 입금됩니다.",
  },
];

// "어제 대비" 변화량 — 실 백엔드는 일별 잔액 스냅샷 endpoint 없음. fixture.
export const ASSET_DELTA_FIXTURE = {
  amount: 152_300,
  pct: 1.2,
  trend: "up" as const,
};
