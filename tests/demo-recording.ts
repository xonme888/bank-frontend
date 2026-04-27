// 데모 영상 5개 — 각 차별 포인트별 분리.
//
// 각 test() 는 별도 video.webm 산출 (Playwright 기본 동작).
// scripts/demo-to-gif.sh 가 test 디렉토리명 → docs/<name>.gif 매핑.
//
// 출력 파일명 매핑 (Playwright 의 test 디렉토리는 test 제목에서 자동 생성):
//   "fds-rejection" 출금 한도 + FDS 거부      → docs/demo-fds-rejection.gif
//   "transfer-pair" 이체 양변 timeline         → docs/demo-transfer-pair.gif
//   "append-only-audit" 감사로그 diff + chain  → docs/demo-append-only-audit.gif
//   "edd-flow" EDD 큐 → 승인 → audit            → docs/demo-edd-flow.gif
//   "time-deposit" 정기예금 가입 LIVE 2단계      → docs/demo-time-deposit.gif

import { test, expect } from "@playwright/test";

const DWELL_FAST = 800;
const DWELL = 1500;
const DWELL_LONG = 2500;

// ─── 1. FDS 거부 + 한도 게이지 ─────────────────────────────────────────────
test("fds-rejection", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/customer/withdraw?scenario=fds", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(DWELL);
  // 시나리오 토글 chip 들 보여주기
  await page.getByRole("button", { name: "잔액 부족" }).click();
  await page.waitForTimeout(DWELL_FAST);
  await page.getByRole("button", { name: "비대면 한도 초과" }).click();
  await page.waitForTimeout(DWELL_FAST);
  await page.getByRole("button", { name: "FDS 거부" }).click();
  await page.waitForTimeout(DWELL);
  // 거부 결과 시연
  await page.getByRole("button", { name: "출금하기" }).click();
  await page.waitForTimeout(DWELL_LONG);
  await expect(page).toHaveURL(/withdraw/);
});

// ─── 2. 이체 양변 timeline + Idempotency ──────────────────────────────────
test("transfer-pair", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/customer/transfer?scenario=none", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(DWELL);
  await page.getByRole("button", { name: "다음" }).click();
  await page.waitForTimeout(DWELL);
  await page.getByRole("button", { name: /이체하기/ }).click();
  await page.waitForTimeout(DWELL_LONG);
  // 완료 화면 — 양변 timeline 시청 시간
  await page.waitForTimeout(DWELL_LONG);
  await expect(page).toHaveURL(/transfer/);
});

// ─── 3. append-only 감사로그 diff + chain + PII 토글 ──────────────────────
test("append-only-audit", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/operator/audit-diff", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(DWELL_LONG);
  // PII 토글 시연
  const piiToggle = page.getByRole("button", { name: /PII/ }).first();
  if (await piiToggle.isVisible()) {
    await piiToggle.click();
    await page.waitForTimeout(DWELL);
    await piiToggle.click();
    await page.waitForTimeout(DWELL);
  }
  // chain timeline 시청
  await page.waitForTimeout(DWELL);
  await expect(page).toHaveURL(/audit-diff/);
});

// ─── 4. EDD 큐 → 승인 → audit 자동 생성 ───────────────────────────────────
test("edd-flow", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/operator/edd", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(DWELL_LONG);
  // 결정 — 승인
  const approveBtn = page.getByRole("button", { name: "승인" }).first();
  if (await approveBtn.isVisible()) {
    await approveBtn.click();
    await page.waitForTimeout(DWELL);
  }
  // 결정 확정
  const commitBtn = page.getByRole("button", { name: /결정 확정/ });
  if (await commitBtn.isVisible() && await commitBtn.isEnabled()) {
    await commitBtn.click();
    await page.waitForTimeout(DWELL_LONG);
  }
  await expect(page).toHaveURL(/edd/);
});

// ─── 5. 정기예금 가입 LIVE 2단계 ──────────────────────────────────────────
test("time-deposit", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/customer/td-sim", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(DWELL);
  // 24M 상품 카드 클릭 시연
  const product24 = page.getByRole("button", { name: /24개월 정기예금/ });
  if (await product24.isVisible()) {
    await product24.click();
    await page.waitForTimeout(DWELL_FAST);
  }
  // 약관 동의
  await page.locator('input[type="checkbox"]').first().check();
  await page.waitForTimeout(DWELL_FAST);
  // 가입 LIVE
  await page.getByRole("button", { name: /가입하기/ }).click();
  // 2단계 호출 (open + deposit) 대기
  await page.waitForTimeout(DWELL_LONG + DWELL_LONG);
  await expect(page).toHaveURL(/td-sim/);
});
