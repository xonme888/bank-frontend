import type { Config } from "tailwindcss";

// 색은 모두 :root CSS 변수에 둠. tailwind 는 그 변수를 클래스로 노출만.
// 다크모드 / 테마 전환 시 globals.css 만 바꾸면 끝.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        "paper-2": "var(--paper-2)",
        ink: {
          DEFAULT: "var(--ink)",
          2: "var(--ink-2)",
          3: "var(--ink-3)",
        },
        rule: {
          DEFAULT: "var(--rule)",
          strong: "var(--rule-strong)",
        },
        accent: "var(--accent)",
        // tx-type 6 — 백엔드 TransactionType 정합
        "tx-deposit": "var(--tx-deposit)",
        "tx-withdraw": "var(--tx-withdraw)",
        "tx-transfer-out": "var(--tx-transfer-out)",
        "tx-transfer-in": "var(--tx-transfer-in)",
        "tx-maturity-payout": "var(--tx-maturity-payout)",
        "tx-early-termination-payout": "var(--tx-early-termination-payout)",
        // account-state 6 — DDA 4 + 정기예금 2
        "st-active": "var(--st-active)",
        "st-edd-pending": "var(--st-edd-pending)",
        "st-suspended": "var(--st-suspended)",
        "st-matured": "var(--st-matured)",
        "st-early-terminated": "var(--st-early-terminated)",
        "st-closed": "var(--st-closed)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ['"Source Serif 4"', "Georgia", "serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      letterSpacing: {
        eyebrow: "0.08em",
      },
    },
  },
  plugins: [],
};

export default config;
