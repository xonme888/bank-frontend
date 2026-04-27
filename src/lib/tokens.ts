// account-state 6종 — 동일 luminance, hue 만 회전 (oklch)
export type AccountState = "ACTIVE" | "DORMANT" | "FROZEN" | "EDD_PENDING" | "EDD_REJECTED" | "CLOSED";

export const ACCOUNT_STATE_TOKEN: Record<AccountState, string> = {
  ACTIVE:       "var(--st-active)",
  DORMANT:      "var(--st-dormant)",
  FROZEN:       "var(--st-frozen)",
  EDD_PENDING:  "var(--st-edd-pending)",
  EDD_REJECTED: "var(--st-edd-rejected)",
  CLOSED:       "var(--st-closed)",
};

export const ACCOUNT_STATE_LABEL: Record<AccountState, string> = {
  ACTIVE:       "활성",
  DORMANT:      "휴면",
  FROZEN:       "동결",
  EDD_PENDING:  "EDD 대기",
  EDD_REJECTED: "EDD 거절",
  CLOSED:       "해지",
};

// tx-type 6종
export type TxType = "DEPOSIT" | "WITHDRAW" | "TRANSFER_OUT" | "TRANSFER_IN" | "FEE" | "INTEREST";

export const TX_TYPE_TOKEN: Record<TxType, string> = {
  DEPOSIT:      "var(--tx-deposit)",
  WITHDRAW:     "var(--tx-withdraw)",
  TRANSFER_OUT: "var(--tx-transfer-out)",
  TRANSFER_IN:  "var(--tx-transfer-in)",
  FEE:          "var(--tx-fee)",
  INTEREST:     "var(--tx-interest)",
};

export const TX_TYPE_LABEL: Record<TxType, string> = {
  DEPOSIT:      "예금",
  WITHDRAW:     "출금",
  TRANSFER_OUT: "이체 출금",
  TRANSFER_IN:  "이체 입금",
  FEE:          "수수료",
  INTEREST:     "이자",
};

// channel 7종 — 한도/FDS 정책 단위
export type Channel = "MOBILE_APP" | "WEB" | "ATM_OWN" | "ATM_OTHER" | "TELLER" | "OPEN_BANKING" | "API";

export const CHANNEL_LABEL: Record<Channel, string> = {
  MOBILE_APP:   "모바일 앱",
  WEB:          "웹",
  ATM_OWN:      "자행 ATM",
  ATM_OTHER:    "타행 ATM",
  TELLER:       "창구",
  OPEN_BANKING: "오픈뱅킹",
  API:          "API",
};

// actor 3종
export type Actor = "CUSTOMER" | "OPERATOR" | "SYSTEM";
