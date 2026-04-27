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
        // tx-type 6
        "tx-deposit": "var(--tx-deposit)",
        "tx-withdraw": "var(--tx-withdraw)",
        "tx-transfer-out": "var(--tx-transfer-out)",
        "tx-transfer-in": "var(--tx-transfer-in)",
        "tx-fee": "var(--tx-fee)",
        "tx-interest": "var(--tx-interest)",
        // account-state 6
        "st-active": "var(--st-active)",
        "st-dormant": "var(--st-dormant)",
        "st-frozen": "var(--st-frozen)",
        "st-edd-pending": "var(--st-edd-pending)",
        "st-edd-rejected": "var(--st-edd-rejected)",
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
