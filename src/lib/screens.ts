// 16화면 카탈로그 — 라우팅 + 허브 카드 메타데이터의 단일 소스.
export type ScreenGroup = "CUSTOMER" | "OPERATOR" | "Ops" | "DESIGN_SYSTEM";

export type Screen = {
  id: string;
  n: string;          // "01", "02", … "16"
  title: string;
  desc: string;
  tags: string[];
  group: ScreenGroup;
  route: string;      // App Router path
};

export const GROUP_INFO: Record<ScreenGroup, { letter: string; label: string }> = {
  CUSTOMER:       { letter: "A.", label: "고객 채널 — 모바일" },
  OPERATOR:       { letter: "B.", label: "오퍼레이터 백오피스" },
  Ops:            { letter: "C.", label: "Ops · Compliance" },
  DESIGN_SYSTEM:  { letter: "D.", label: "Design system" },
};

export const SCREENS: Screen[] = [
  // CUSTOMER
  { id: "home",     n: "01", title: "홈 — 계좌 대시보드",        desc: "한도 게이지, 채널별 사용량, 최근 거래.",     tags: ["MOBILE","actor:CUSTOMER"], group: "CUSTOMER", route: "/customer/home" },
  { id: "withdraw", n: "02", title: "출금 — 한도/FDS 가드",       desc: "8가지 거부 시나리오 토글.",                  tags: ["MOBILE","FDS"],            group: "CUSTOMER", route: "/customer/withdraw" },
  { id: "transfer", n: "03", title: "이체 — Idempotency Key",     desc: "더블 탭 시 동일 키 재사용.",                 tags: ["MOBILE","IDEM"],           group: "CUSTOMER", route: "/customer/transfer" },
  { id: "history",  n: "04", title: "거래 내역 — 6-type 필터",    desc: "예금/출금/이체/수수료/이자/외화.",            tags: ["MOBILE"],                  group: "CUSTOMER", route: "/customer/history" },
  { id: "td-sim",   n: "05", title: "정기예금 시뮬레이터",         desc: "실시간 만기수령액 계산.",                    tags: ["MOBILE"],                  group: "CUSTOMER", route: "/customer/td-sim" },
  { id: "receipt",  n: "06", title: "만기 영수증",                 desc: "원금·이자·세금 분해, 회계장부 행 매핑.",       tags: ["MOBILE","ACCT"],           group: "CUSTOMER", route: "/customer/receipt" },
  { id: "signup",   n: "15", title: "가입 다단계 폼",              desc: "DUPLICATE_EMAIL 인라인 에러.",               tags: ["MOBILE","ERR"],            group: "CUSTOMER", route: "/customer/signup" },
  { id: "deposit",  n: "16", title: "입금 — 키패드",                desc: "잔액 미리보기 · 한도 가드 (입금 면제).",        tags: ["MOBILE"],                  group: "CUSTOMER", route: "/customer/deposit" },

  // OPERATOR
  { id: "customer-360", n: "07", title: "고객 360° 뷰",       desc: "모바일 + 데스크탑 동시 노출 비교.",          tags: ["DESKTOP","actor:OPERATOR"], group: "OPERATOR", route: "/operator/customer-360" },
  { id: "edd",          n: "08", title: "EDD 승인 큐",        desc: "위험점수 게이지 + 결정 패널.",               tags: ["DESKTOP","KYC"],            group: "OPERATOR", route: "/operator/edd" },
  { id: "audit-diff",   n: "09", title: "감사로그 diff",      desc: "before / after JSON + chain timeline.",       tags: ["DESKTOP","AUDIT"],          group: "OPERATOR", route: "/operator/audit-diff" },

  // Ops
  { id: "monitor", n: "10", title: "실시간 거래 모니터",  desc: "KPI · 60-bucket 라인 · 채널 도넛.",       tags: ["DESKTOP","RT"],   group: "Ops", route: "/ops/monitor" },
  { id: "fds",     n: "11", title: "FDS 패턴 보드",      desc: "24×7 heatmap + reasonCode ranking.",     tags: ["DESKTOP","FDS"],  group: "Ops", route: "/ops/fds" },
  { id: "report",  n: "12", title: "감사 리포트",         desc: "actor × channel × 도메인 집계.",          tags: ["DESKTOP","AUDIT"],group: "Ops", route: "/ops/report" },

  // DESIGN_SYSTEM
  { id: "errors", n: "13", title: "ErrorCode 카탈로그",   desc: "51 코드, 카테고리/검색 필터.",             tags: ["DS","ERR"],     group: "DESIGN_SYSTEM", route: "/system/errors" },
  { id: "gauge",  n: "14", title: "한도 게이지 컴포넌트", desc: "variants · usage · props.",                tags: ["DS","CMP"],     group: "DESIGN_SYSTEM", route: "/system/gauge" },
];
