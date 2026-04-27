import { defineConfig, devices } from "@playwright/test";

// xbank-next 16 화면 visual 회귀 + 시나리오 토글 회귀.
// webServer 옵션이 dev 서버를 자동 기동·종료 — `npx playwright test` 한 줄로 끝.
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : [["list"], ["html", { open: "never" }]],

  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
  },

  // 시각 회귀 임계 — 폰트 렌더링 미세 차이 허용 (스냅샷 0 px 강제 시 OS 간 깨짐)
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
      threshold: 0.2,
    },
  },

  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
  ],

  webServer: {
    // dev 모드는 HMR 잡음으로 스냅샷 흔들림 — 빌드된 정적 자산을 사용.
    command: "npm run build && npm run start -- --port 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
