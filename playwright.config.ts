import { defineConfig, devices } from "@playwright/test";

// xbank-next 16 화면 visual 회귀 + 시나리오 토글 회귀 + 데모 영상 자동 녹화.
//
// 명령:
//   npm run test:e2e             — 회귀 (32 baseline, project: desktop)
//   npm run test:e2e:update      — baseline 갱신
//   npm run demo:record          — 데모 영상 녹화 (project: demo, .webm 산출)
//   npm run demo:gif             — .webm → .gif 변환 (gifski / ffmpeg)
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
    // 회귀 (baseline 비교) — 기본
    {
      name: "desktop",
      testMatch: /.*\.(spec)\.ts$/,
      testIgnore: /demo-.*\.ts$/,
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    // 데모 영상 녹화 — 별도 project. test 파일은 demo-* 만.
    {
      name: "demo",
      testMatch: /demo-.*\.ts$/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
        // 모든 동작에 0.2 초 지연 — 녹화에서 이동이 너무 빠르면 시청 어려움.
        launchOptions: { slowMo: 200 },
        video: {
          mode: "on",
          size: { width: 1280, height: 800 },
        },
      },
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
