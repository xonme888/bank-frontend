// OpenAPI 자동 생성 타입의 단일 진입점.
//
// 빌드 단계에서 백엔드를 띄우고 다음을 실행:
//   npm run openapi:gen
// 그러면 src/api/schema.d.ts 가 갱신되며 본 모듈의 paths/components 가 즉시 type-safe.
//
// schema.d.ts 가 아직 생성되지 않은 상태에서도 본 모듈이 컴파일 되도록 fallback 처리.

// @ts-ignore — schema.d.ts 가 미생성일 수 있음. openapi:gen 실행 후 정상 해결됨.
export type * from "./schema";

// 자주 쓰는 응답 타입 단축 alias — 화면 코드에서 정상 type-safe 사용을 위해 명시.
// 실제 타입은 schema.d.ts 의 components["schemas"]["..."] 와 매칭.
//
// 예시 (schema.d.ts 생성 후 활성):
// import type { components } from "./schema";
// export type AccountResponse  = components["schemas"]["AccountResponse"];
// export type BalanceResponse  = components["schemas"]["BalanceResponse"];
// export type TransactionsResponse = components["schemas"]["TransactionsResponse"];
