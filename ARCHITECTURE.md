# ARCHITECTURE — xbank-next

## 폴더

```
src/
├── app/                      Next.js App Router
│   ├── layout.tsx            루트 레이아웃 + top bar
│   ├── page.tsx              16화면 인덱스 허브
│   ├── customer/<id>/        모바일 (8 routes)
│   ├── operator/<id>/        백오피스 (3 routes)
│   ├── ops/<id>/             모니터링 (3 routes)
│   └── system/<id>/          디자인 시스템 (2 routes)
├── components/
│   ├── chrome/               Device, DesktopFrame, ScreenStage
│   ├── shells/DeskShell      backoffice/ops 사이드바+헤더
│   └── primitives/           Eyebrow, StatusBadge, GaugeRow, Money
├── lib/
│   ├── screens.ts            16화면 카탈로그 + route 매핑
│   └── tokens.ts             AccountState/TxType/Channel/Actor 토큰
└── styles/globals.css        :root CSS 변수 + tailwind base
```

## 변환 매핑 (HTML → Next)

| 원본 | Next |
|---|---|
| `<script type="text/babel" src="screens.jsx">` | `src/components/screens/<name>.tsx` (Server Component 우선) |
| `Object.assign(window, {...})` | ES module `export` |
| hash 라우터 `#/withdraw` | App Router `/customer/withdraw/page.tsx` |
| `:root { --accent }` | `globals.css` 그대로 + tailwind theme.colors 매핑 |
| inline `<style>` block | tailwind utility |
| `useState` 키패드/슬라이더 | `"use client"` 컴포넌트 |
| 정적 카드/리스트 | RSC (no `"use client"`) |
| Tweaks 패널 (postMessage) | URL search param `?scenario=fds` |

## 디자인 토큰

색은 **모두 CSS 변수에 둠**. tailwind 는 그 변수를 색 클래스로 노출만 함.
다크모드/테마 전환 시 `globals.css` 의 `:root` 한 곳만 바꾸면 끝.

## API · 데이터 레이어

- **타입 client**: `openapi-typescript` 가 `/v3/api-docs` 에서 자동 생성 → `src/api/schema.d.ts` (gitignore)
- **fetch wrapper**: `src/api/client.ts` 가 `X-Actor` 헤더 + `Idempotency-Key` 자동 주입, `ApiError` 로 ErrorCode 정합
- **fixture**: 백엔드 endpoint 미구현 영역만 `src/data/*.ts` 로 분리 (의도된 mock)

## 시각 회귀

Playwright 1.59 + Chromium headless. 16 화면 + 16 시나리오 토글 = 32 baseline.
스냅샷은 `tests/*-snapshots/` 에 git 추적 — 디자인 변경 시 명시적 갱신 강제 (`npm run test:e2e:update`).
