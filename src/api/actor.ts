// 데모/포트폴리오용 actor 하드코딩.
//
// 백엔드 DemoHeaderAuthenticationFilter 가 X-Actor-* 헤더로 신뢰 호출자를 결정 —
// 본 시스템 이식 시 JWT/OIDC/mTLS 로 교체 (xbank/CLAUDE.md "이식 시 교체할 임시 조치").
//
// 화면 검증 단계에서는 단일 고객 1명을 가정. 추후 더미 로그인 화면을 만들면 여기를 세션값으로 바꿈.
import type { Actor, Channel } from "@/lib/tokens";

export type ActorContext = {
  type: Actor;       // CUSTOMER / OPERATOR / SYSTEM
  id: string;
  channel: Channel;  // WEB / MOBILE / BRANCH / CALL_CENTER / ATM / BATCH / API
};

export const DEMO_ACTOR: ActorContext = {
  type: "CUSTOMER",
  id: "1",
  channel: "MOBILE",
};
