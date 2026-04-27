// 거래 내역 fixture — 6 TxType 모두 포함.
// 백엔드 GET /api/v1/accounts/{id}/transactions 가 서비스 가능하면 fetch 로 대체.

import type { TxType } from "@/lib/tokens";

export type TxRow = {
  id: string;
  type: TxType;
  amount: number;          // 절대값
  signed: 1 | -1;          // 가산 / 차감
  memo: string;
  counterpartyMasked?: string;
  occurredAt: string;       // ISO
  balanceAfter: number;
  channel: "WEB" | "MOBILE" | "BRANCH" | "ATM" | "BATCH";
};

const Y = 2026, MO = (n: number) => String(n).padStart(2, "0");
const at = (mo: number, d: number, h: number, m: number) =>
  `${Y}-${MO(mo)}-${MO(d)}T${MO(h)}:${MO(m)}:00+09:00`;

export const FIXTURE_TRANSACTIONS: TxRow[] = [
  { id: "TX-2026-04-27-A012", type: "MATURITY_PAYOUT",          amount: 10_296_100, signed:  1, memo: "12개월 정기예금 만기",         occurredAt: at(4, 27, 10, 5),  balanceAfter: 12_746_100, channel: "BATCH" },
  { id: "TX-2026-04-26-B891", type: "TRANSFER_IN",              amount: 250_000,    signed:  1, memo: "용돈",                          counterpartyMasked: "100-***-1199 김**", occurredAt: at(4, 26, 19, 20), balanceAfter: 2_450_000, channel: "MOBILE" },
  { id: "TX-2026-04-25-C440", type: "WITHDRAW",                 amount: 80_000,     signed: -1, memo: "현금 인출",                    occurredAt: at(4, 25, 21, 13), balanceAfter: 2_200_000, channel: "ATM" },
  { id: "TX-2026-04-24-D773", type: "TRANSFER_OUT",             amount: 150_000,    signed: -1, memo: "월세",                          counterpartyMasked: "신한은행 100-***-5544", occurredAt: at(4, 24, 9, 0),   balanceAfter: 2_280_000, channel: "MOBILE" },
  { id: "TX-2026-04-22-E908", type: "DEPOSIT",                  amount: 3_000_000,  signed:  1, memo: "월급",                          occurredAt: at(4, 22, 10, 0),  balanceAfter: 2_430_000, channel: "BRANCH" },
  { id: "TX-2026-04-20-F221", type: "WITHDRAW",                 amount: 38_000,     signed: -1, memo: "마트",                          occurredAt: at(4, 20, 18, 47), balanceAfter: -570_000,  channel: "MOBILE" },
  { id: "TX-2026-04-18-G556", type: "EARLY_TERMINATION_PAYOUT", amount: 4_980_000,  signed:  1, memo: "24개월 정기예금 중도해지",     occurredAt: at(4, 18, 14, 22), balanceAfter: -532_000,  channel: "MOBILE" },
  { id: "TX-2026-04-16-H101", type: "TRANSFER_IN",              amount: 120_000,    signed:  1, memo: "정산",                          counterpartyMasked: "100-***-2727 이**", occurredAt: at(4, 16, 11, 11), balanceAfter: -5_512_000, channel: "MOBILE" },
  { id: "TX-2026-04-15-I377", type: "TRANSFER_OUT",             amount: 320_000,    signed: -1, memo: "관리비",                        counterpartyMasked: "관리사무소 100-***-9090", occurredAt: at(4, 15, 9, 1),   balanceAfter: -5_632_000, channel: "WEB" },
  { id: "TX-2026-04-14-J624", type: "DEPOSIT",                  amount: 500_000,    signed:  1, memo: "환급",                          occurredAt: at(4, 14, 16, 50), balanceAfter: -5_312_000, channel: "WEB" },
];
