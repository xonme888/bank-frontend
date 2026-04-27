// 데모 영상 자동 녹화 — 9 단계 풀 흐름.
//
// 산출:  test-results/<runId>/demo-*-chromium/video.webm
// 후처리: npm run demo:gif (gifski 또는 ffmpeg → docs/demo.gif)
//
// 사전 조건:
//   - 백엔드 백그라운드 (./gradlew bootRun) — LIVE 흐름 호출용
//   - frontend webServer 는 playwright 가 자동 (build → start --port 3100)
//
// timing 조정: page.waitForTimeout 값을 늘리면 시청자에게 더 친절. 60~90 초 목표.

import { test, expect } from "@playwright/test";

test.describe.configure({ mode: "serial" });

const DWELL_FAST = 800;       // 화면 진입 후 잠깐 머무름
const DWELL = 1500;           // 일반 dwell
const DWELL_LONG = 2500;      // 강조하고 싶은 화면
const TYPE_DELAY = 60;        // 타이핑 한 글자당

test("xbank 풀 흐름 60~90s", async ({ page }) => {
  test.setTimeout(180_000);   // 백엔드 호출 포함이라 여유

  // ─── 1. signup (DUPLICATE_EMAIL CLOSED 인라인 시연) ───────────────────────
  await page.goto("/customer/signup?scenario=dup_closed", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(DWELL_FAST);
  await page.getByPlaceholder("you@example.com").fill("closed@example.com", { timeout: 10_000 });
  await page.waitForTimeout(DWELL_LONG);   // CLOSED 인라인 에러 강조

  // ─── 2. home (LIVE — REAL 카드 + 자산 도넛) ───────────────────────────────
  await page.goto("/customer/home", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(DWELL_LONG);

  // ─── 3. deposit (LIVE 입금) ────────────────────────────────────────────────
  await page.goto("/customer/deposit", { waitUntil: "networkidle" });
  await page.waitForTimeout(DWELL_FAST);
  await page.getByRole("button", { name: "+50,000" }).click();
  await page.waitForTimeout(DWELL_FAST);
  await page.getByRole("button", { name: "입금하기" }).click();
  await page.waitForTimeout(DWELL_LONG);

  // ─── 4. withdraw (시나리오 chip 토글 — FDS 거부 모달 시연) ────────────────
  await page.goto("/customer/withdraw?scenario=fds", { waitUntil: "networkidle" });
  await page.waitForTimeout(DWELL);
  await page.getByRole("button", { name: "출금하기" }).click();
  await page.waitForTimeout(DWELL_LONG);   // FDS 거부 화면 강조

  // ─── 5. transfer (LIVE 이체) ───────────────────────────────────────────────
  await page.goto("/customer/transfer?scenario=none", { waitUntil: "networkidle" });
  await page.waitForTimeout(DWELL_FAST);
  await page.getByRole("button", { name: "다음" }).click();
  await page.waitForTimeout(DWELL);
  await page.getByRole("button", { name: /이체하기/ }).click();
  await page.waitForTimeout(DWELL_LONG);

  // ─── 6. history (LIVE 거래 내역 + 6-type 필터) ────────────────────────────
  await page.goto("/customer/history?type=ALL", { waitUntil: "networkidle" });
  await page.waitForTimeout(DWELL);
  // 타입 필터 클릭 시연
  const depositChip = page.getByRole("button", { name: /입금/ }).first();
  if (await depositChip.isVisible()) await depositChip.click();
  await page.waitForTimeout(DWELL);

  // ─── 7. td-sim (LIVE 정기예금 가입 — 2단계 호출) ──────────────────────────
  await page.goto("/customer/td-sim", { waitUntil: "networkidle" });
  await page.waitForTimeout(DWELL_FAST);
  // 약관 동의 체크
  const agree = page.locator('input[type="checkbox"]').first();
  await agree.check();
  await page.waitForTimeout(DWELL_FAST);
  // 가입 LIVE 클릭은 시연만 (실제 호출은 시간 소요 — wait 대신 화면 강조 우선)
  await page.getByRole("button", { name: /가입하기/ }).click();
  await page.waitForTimeout(DWELL_LONG);

  // ─── 8. operator/edd (LIVE 큐 + 승인 시연) ────────────────────────────────
  await page.goto("/operator/edd", { waitUntil: "networkidle" });
  await page.waitForTimeout(DWELL);
  // 큐의 첫 항목 (LIVE 시드) 강조
  await page.waitForTimeout(DWELL);
  // 승인 결정 시연
  const approveBtn = page.getByRole("button", { name: "승인" });
  if (await approveBtn.isVisible()) await approveBtn.click();
  await page.waitForTimeout(DWELL);

  // ─── 9. operator/audit-diff (LIVE append-only diff + chain) ───────────────
  await page.goto("/operator/audit-diff", { waitUntil: "networkidle" });
  await page.waitForTimeout(DWELL_LONG);
  // PII 토글 시연
  const piiToggle = page.getByRole("button", { name: /PII/ }).first();
  if (await piiToggle.isVisible()) {
    await piiToggle.click();
    await page.waitForTimeout(DWELL);
  }

  // 마지막 머무름
  await page.waitForTimeout(DWELL_LONG);

  // 영상 정상 종료 표식 — assertion 한 번
  await expect(page).toHaveURL(/audit-diff/);

  // 실제 사용 안 함 — TYPE_DELAY 변수가 import 되지 않은 듯한 lint 경고 회피용
  void TYPE_DELAY;
});
