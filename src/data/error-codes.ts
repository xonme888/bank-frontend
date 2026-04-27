// 백엔드 ErrorCode.java 와 1:1 정합 — 51개 코드 단일 진실의 원천.
// 백엔드 출처: src/main/java/com/example/xbank/api/common/ErrorCode.java
// 변경 시 백엔드 enum 과 동기화 필수 (이름 변경/삭제는 호환성 깨짐).

export type ErrorCategory =
  | "CUSTOMER"
  | "ACCOUNT"
  | "TIME_DEPOSIT"
  | "TRANSACTION"
  | "COMMON"
  | "IDEMPOTENCY";

export type ErrorEntry = {
  code: string;            // 백엔드 enum name() — API 응답 body 의 code 필드
  category: ErrorCategory;
  status: number;          // GlobalExceptionHandler 매핑 HTTP status
  label: string;           // 한국어 안내문 (사용자 노출용)
  retry?: string;          // 재시도 가이드 (없으면 재시도 불가)
  domain?: string;         // 한국어 도메인 라벨
};

export const ERROR_CATEGORY_LABEL: Record<ErrorCategory, string> = {
  CUSTOMER:     "Customer",
  ACCOUNT:      "Account (DDA)",
  TIME_DEPOSIT: "TimeDeposit",
  TRANSACTION:  "Transaction",
  COMMON:       "공통",
  IDEMPOTENCY:  "Idempotency",
};

export const ERROR_CODES: ErrorEntry[] = [
  // ============== Customer 도메인 (4) ==============
  { code: "DUPLICATE_EMAIL",                              category: "CUSTOMER", status: 409, label: "이미 사용 중인 이메일입니다 (탈퇴 계정 포함)", retry: "다른 이메일로 다시 시도" },
  { code: "CUSTOMER_NOT_FOUND",                           category: "CUSTOMER", status: 404, label: "고객을 찾을 수 없습니다" },
  { code: "CUSTOMER_ALREADY_CLOSED",                      category: "CUSTOMER", status: 409, label: "이미 탈퇴한 고객입니다" },
  { code: "UNAUTHORIZED_CUSTOMER_ACCESS",                 category: "CUSTOMER", status: 403, label: "고객 정보 접근 권한이 없습니다" },

  // ============== Account 도메인 - DDA (15) ==============
  { code: "ACCOUNT_NOT_FOUND",                            category: "ACCOUNT", status: 404, label: "계좌를 찾을 수 없습니다" },
  { code: "ACCOUNT_ALREADY_CLOSED",                       category: "ACCOUNT", status: 409, label: "이미 해지된 계좌입니다" },
  { code: "INVALID_STATE_TRANSITION",                     category: "ACCOUNT", status: 409, label: "허용되지 않은 상태 전이입니다" },
  { code: "KYC_VERIFICATION_FAILED",                      category: "ACCOUNT", status: 422, label: "본인확인(KYC)에 실패했습니다", retry: "본인확인 절차를 다시 진행" },
  { code: "REQUIRED_TERMS_NOT_CONSENTED",                 category: "ACCOUNT", status: 422, label: "필수 약관 동의가 누락되었습니다", retry: "약관 동의 후 재시도" },
  { code: "TERMS_VERSION_MISMATCH",                       category: "ACCOUNT", status: 422, label: "약관 버전이 변경되었습니다", retry: "최신 약관 동의 후 재시도" },
  { code: "TERMS_NOT_EFFECTIVE",                          category: "ACCOUNT", status: 422, label: "약관이 아직 발효되지 않았습니다" },
  { code: "EDD_APPROVAL_NOT_ALLOWED",                     category: "ACCOUNT", status: 409, label: "EDD 승인이 허용되지 않는 상태입니다" },
  { code: "EDD_NOT_REQUIRED",                             category: "ACCOUNT", status: 409, label: "EDD 심사 대상이 아닙니다" },
  { code: "SUSPEND_NOT_ALLOWED",                          category: "ACCOUNT", status: 409, label: "정지가 허용되지 않는 상태입니다" },
  { code: "UNSUSPEND_NOT_ALLOWED",                        category: "ACCOUNT", status: 409, label: "정지 해제가 허용되지 않는 상태입니다" },
  { code: "UNAUTHORIZED_ACCOUNT_OPEN",                    category: "ACCOUNT", status: 403, label: "계좌 개설 권한이 없습니다" },
  { code: "UNAUTHORIZED_ACCOUNT_ACCESS",                  category: "ACCOUNT", status: 403, label: "계좌 접근 권한이 없습니다" },
  { code: "CUSTOMER_CLOSE_ON_SUSPENDED_NOT_ALLOWED",      category: "ACCOUNT", status: 409, label: "정지된 계좌는 고객이 직접 해지할 수 없습니다" },
  { code: "CUSTOMER_CANCEL_ON_PENDING_EDD_NOT_ALLOWED",   category: "ACCOUNT", status: 409, label: "EDD 심사 중인 계좌는 취소할 수 없습니다" },

  // ============== TimeDeposit 도메인 (9) ==============
  { code: "TIME_DEPOSIT_AMOUNT_OUT_OF_RANGE",             category: "TIME_DEPOSIT", status: 422, label: "정기예금 가입 금액이 허용 범위를 벗어났습니다", retry: "금액 조정 후 재시도" },
  { code: "TIME_DEPOSIT_AMOUNT_MISMATCH",                 category: "TIME_DEPOSIT", status: 422, label: "가입 금액과 입금 금액이 일치하지 않습니다" },
  { code: "TIME_DEPOSIT_RATE_UNAVAILABLE",                category: "TIME_DEPOSIT", status: 503, label: "금리 조회를 일시적으로 사용할 수 없습니다", retry: "잠시 후 재시도" },
  { code: "MATURITY_TRIGGER_NOT_ALLOWED",                 category: "TIME_DEPOSIT", status: 409, label: "만기 처리가 허용되지 않습니다" },
  { code: "MATURITY_RECEIPT_NOT_AVAILABLE",               category: "TIME_DEPOSIT", status: 404, label: "만기 영수증이 아직 발급되지 않았습니다" },
  { code: "MATURITY_ALREADY_REACHED",                     category: "TIME_DEPOSIT", status: 409, label: "이미 만기 처리가 완료되었습니다" },
  { code: "EARLY_TERMINATION_NOT_ALLOWED",                category: "TIME_DEPOSIT", status: 409, label: "중도 해지가 허용되지 않습니다" },
  { code: "EARLY_TERMINATION_CALCULATION_MISMATCH",       category: "TIME_DEPOSIT", status: 422, label: "중도해지 금액 계산이 일치하지 않습니다", retry: "최신 미리보기로 다시 시도" },
  { code: "INTEREST_ACCRUAL_MISMATCH",                    category: "TIME_DEPOSIT", status: 422, label: "이자 계산 결과가 일치하지 않습니다" },

  // ============== Transaction 도메인 (13) ==============
  { code: "INSUFFICIENT_BALANCE",                         category: "TRANSACTION", status: 422, label: "잔액이 부족합니다" },
  { code: "INVALID_TRANSACTION_AMOUNT",                   category: "TRANSACTION", status: 422, label: "거래 금액이 올바르지 않습니다 (1원 ~ 10억원)" },
  { code: "ACCOUNT_PENDING_TRANSACTION_BLOCKED",          category: "TRANSACTION", status: 409, label: "EDD 심사 중인 계좌는 거래할 수 없습니다" },
  { code: "ACCOUNT_SUSPENDED_TRANSACTION_BLOCKED",        category: "TRANSACTION", status: 409, label: "정지된 계좌는 거래할 수 없습니다 — 영업창구 문의" },
  { code: "ACCOUNT_CLOSED_TRANSACTION_BLOCKED",           category: "TRANSACTION", status: 409, label: "해지된 계좌는 거래할 수 없습니다" },
  { code: "TRANSACTION_NOT_ALLOWED_ON_TIME_DEPOSIT",      category: "TRANSACTION", status: 409, label: "정기예금에서는 직접 출금/이체할 수 없습니다" },
  { code: "TRANSACTION_NOT_FOUND",                        category: "TRANSACTION", status: 404, label: "거래를 찾을 수 없습니다" },
  { code: "SAME_ACCOUNT_TRANSFER",                        category: "TRANSACTION", status: 422, label: "동일 계좌로는 이체할 수 없습니다" },
  { code: "INVALID_SETTLEMENT_ACCOUNT",                   category: "TRANSACTION", status: 422, label: "결제 DDA 가 올바르지 않습니다" },
  { code: "SETTLEMENT_ACCOUNT_NOT_AVAILABLE",             category: "TRANSACTION", status: 422, label: "결제 DDA 를 사용할 수 없는 상태입니다" },
  { code: "DAILY_TRANSFER_LIMIT_EXCEEDED",                category: "TRANSACTION", status: 422, label: "비대면 일일 한도를 초과했습니다 — 영업창구 이용 시 면제", retry: "내일 한도 갱신 후 / 또는 영업창구" },
  { code: "DAILY_ATM_WITHDRAW_LIMIT_EXCEEDED",            category: "TRANSACTION", status: 422, label: "ATM 일일 한도를 초과했습니다", retry: "내일 한도 갱신 후 / 또는 영업창구" },
  { code: "FRAUD_DETECTION_REJECTED",                     category: "TRANSACTION", status: 422, label: "FDS 평가에서 거부되었습니다", retry: "고객센터 / 영업창구 문의" },

  // ============== 공통 (6) ==============
  { code: "OPTIMISTIC_LOCK_FAILED",                       category: "COMMON", status: 409, label: "다른 요청과 충돌했습니다", retry: "잠시 후 재시도" },
  { code: "VALIDATION_ERROR",                             category: "COMMON", status: 400, label: "입력값 검증에 실패했습니다", retry: "값 확인 후 재시도" },
  { code: "INVALID_ARGUMENT",                             category: "COMMON", status: 400, label: "올바르지 않은 요청입니다" },
  { code: "DATA_INTEGRITY_VIOLATION",                     category: "COMMON", status: 409, label: "데이터 무결성 제약을 위반했습니다" },
  { code: "INTERNAL_STATE_ERROR",                         category: "COMMON", status: 500, label: "내부 상태 오류가 발생했습니다", retry: "잠시 후 재시도" },
  { code: "SERVICE_UNAVAILABLE",                          category: "COMMON", status: 503, label: "서비스를 일시적으로 사용할 수 없습니다", retry: "잠시 후 재시도" },

  // ============== Idempotency (4) ==============
  { code: "IDEMPOTENCY_KEY_REQUIRED",                     category: "IDEMPOTENCY", status: 400, label: "Idempotency-Key 헤더가 필요합니다" },
  { code: "IDEMPOTENCY_KEY_TOO_LONG",                     category: "IDEMPOTENCY", status: 400, label: "Idempotency-Key 가 너무 깁니다" },
  { code: "IDEMPOTENCY_KEY_REUSED",                       category: "IDEMPOTENCY", status: 422, label: "이미 다른 요청에 사용된 Idempotency-Key 입니다", retry: "새 키로 다시 시도" },
  { code: "IDEMPOTENCY_IN_PROGRESS",                      category: "IDEMPOTENCY", status: 409, label: "동일 키의 요청이 처리 중입니다", retry: "잠시 후 재시도" },
];

// 카테고리별 그룹핑 — 카탈로그 화면 13 의 탭 렌더링 용도.
export function groupByCategory(): Record<ErrorCategory, ErrorEntry[]> {
  const buckets: Record<ErrorCategory, ErrorEntry[]> = {
    CUSTOMER: [], ACCOUNT: [], TIME_DEPOSIT: [], TRANSACTION: [], COMMON: [], IDEMPOTENCY: [],
  };
  for (const e of ERROR_CODES) buckets[e.category].push(e);
  return buckets;
}

// 백엔드와의 정합 검증용 — 51 이어야 함.
export const ERROR_CODE_TOTAL = ERROR_CODES.length;
