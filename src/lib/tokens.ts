// 백엔드 도메인 enum 과 1:1 정합 — 단일 진실의 원천.
// 백엔드 출처:
//  - AccountState: domain/account/AccountStatus.java + 정기예금 상태(MATURED/EARLY_TERMINATED)
//  - TxType:       domain/transaction/TransactionType.java (6-value)
//  - Channel:      domain/shared/ActorChannel.java (7-value)
//  - Actor:        domain/shared/ActorType.java (3-value)

// ============== AccountState 6 ==============
// DDA 4종 (ACTIVE / EDD_PENDING / SUSPENDED / CLOSED) + 정기예금 2종 (MATURED / EARLY_TERMINATED).
// 화면 1 (Home) 이 두 도메인 카드 리스트에 공통으로 사용.
export type AccountState =
  | "ACTIVE"
  | "EDD_PENDING"
  | "SUSPENDED"
  | "MATURED"
  | "EARLY_TERMINATED"
  | "CLOSED";

export const ACCOUNT_STATE_TOKEN: Record<AccountState, string> = {
  ACTIVE:           "var(--st-active)",
  EDD_PENDING:      "var(--st-edd-pending)",
  SUSPENDED:        "var(--st-suspended)",
  MATURED:          "var(--st-matured)",
  EARLY_TERMINATED: "var(--st-early-terminated)",
  CLOSED:           "var(--st-closed)",
};

export const ACCOUNT_STATE_LABEL: Record<AccountState, string> = {
  ACTIVE:           "활성",
  EDD_PENDING:      "EDD 대기",
  SUSPENDED:        "정지",
  MATURED:          "만기",
  EARLY_TERMINATED: "중도해지",
  CLOSED:           "해지",
};

// ============== TxType 6 ==============
// 백엔드 TransactionType.java 와 동일 — 추가·삭제는 백엔드 enum 변경과 동기화.
export type TxType =
  | "DEPOSIT"
  | "WITHDRAW"
  | "TRANSFER_OUT"
  | "TRANSFER_IN"
  | "MATURITY_PAYOUT"
  | "EARLY_TERMINATION_PAYOUT";

export const TX_TYPE_TOKEN: Record<TxType, string> = {
  DEPOSIT:                  "var(--tx-deposit)",
  WITHDRAW:                 "var(--tx-withdraw)",
  TRANSFER_OUT:             "var(--tx-transfer-out)",
  TRANSFER_IN:              "var(--tx-transfer-in)",
  MATURITY_PAYOUT:          "var(--tx-maturity-payout)",
  EARLY_TERMINATION_PAYOUT: "var(--tx-early-termination-payout)",
};

export const TX_TYPE_LABEL: Record<TxType, string> = {
  DEPOSIT:                  "입금",
  WITHDRAW:                 "출금",
  TRANSFER_OUT:             "이체 출금",
  TRANSFER_IN:              "이체 입금",
  MATURITY_PAYOUT:          "만기 지급",
  EARLY_TERMINATION_PAYOUT: "중도해지 지급",
};

// 출금 성격 거래만 한도 가드 산정 — TransactionLimitGuard 의 isOutgoing() 과 동일.
export const TX_TYPE_OUTGOING: Record<TxType, boolean> = {
  DEPOSIT:                  false,
  WITHDRAW:                 true,
  TRANSFER_OUT:             true,
  TRANSFER_IN:              false,
  MATURITY_PAYOUT:          false,
  EARLY_TERMINATION_PAYOUT: false,
};

// ============== Channel 7 ==============
// 백엔드 ActorChannel.java 와 동일.
export type Channel = "WEB" | "MOBILE" | "BRANCH" | "CALL_CENTER" | "ATM" | "BATCH" | "API";

export const CHANNEL_LABEL: Record<Channel, string> = {
  WEB:         "웹",
  MOBILE:      "모바일",
  BRANCH:      "영업창구",
  CALL_CENTER: "콜센터",
  ATM:         "ATM",
  BATCH:       "배치",
  API:         "API",
};

// 한도 가드 분류 — ChannelGroup.from(channel). 디자인에서 게이지 분리 단위.
export type ChannelGroup = "NON_FACE_TO_FACE" | "ATM" | "FACE_TO_FACE" | "BATCH";

export const CHANNEL_GROUP: Record<Channel, ChannelGroup> = {
  WEB:         "NON_FACE_TO_FACE",
  MOBILE:      "NON_FACE_TO_FACE",
  API:         "NON_FACE_TO_FACE",
  ATM:         "ATM",
  BRANCH:      "FACE_TO_FACE",
  CALL_CENTER: "FACE_TO_FACE",
  BATCH:       "BATCH",
};

export const CHANNEL_GROUP_LABEL: Record<ChannelGroup, string> = {
  NON_FACE_TO_FACE: "비대면",
  ATM:              "ATM",
  FACE_TO_FACE:     "대면 (면제)",
  BATCH:            "배치 (면제)",
};

// ============== Actor 3 ==============
// 백엔드 ActorType.java 와 동일.
export type Actor = "CUSTOMER" | "OPERATOR" | "SYSTEM";

export const ACTOR_LABEL: Record<Actor, string> = {
  CUSTOMER: "고객",
  OPERATOR: "직원",
  SYSTEM:   "시스템",
};
