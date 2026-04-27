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
│   ├── primitives/           Eyebrow, StatusBadge, GaugeRow, Money
│   └── ScreenPlaceholder     이식 전 임시 페이지
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

## 다음 단계 (Claude Code)

1. **컴포넌트 1개씩 이식** — `customer/home` 부터.
   원본: `xbank/screens.jsx` 의 `Home` 함수 → `src/app/customer/home/page.tsx`.
   인터랙션 있는 부분만 `"use client"`로 격리.
2. **fixture 분리** — 가짜 거래 데이터를 `src/data/transactions.ts` 로.
3. **차트** — FDS heatmap, 실시간 모니터는 `recharts` 또는 `visx` 도입 검토.
4. **API 레이어** — 실제 백엔드 OpenAPI 가 생기면 `src/api/` 에 client 생성.
5. **테스트** — Playwright 로 16화면 visual regression.
