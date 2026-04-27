// 시나리오 토글 회귀 — withdraw 8 / transfer 4 / signup 3.
// withdraw·transfer 는 거부 케이스에서 "출금하기"/"이체하기" 를 눌러야 거부 화면 진입,
// signup 은 이메일 입력으로 DUPLICATE_EMAIL 인라인 트리거.

import { test, expect, type Page } from "@playwright/test";

async function settle(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
}

// ─────────────────────────────────────────────────────────────────────────────
// withdraw
const WITHDRAW_SCENARIOS = [
  "none", "insufficient", "limit_transfer", "limit_atm",
  "fds", "suspended", "td", "invalid",
] as const;

for (const s of WITHDRAW_SCENARIOS) {
  test(`withdraw scenario ${s}`, async ({ page }) => {
    await page.goto(`/customer/withdraw?scenario=${s}`, { waitUntil: "networkidle" });
    await settle(page);
    if (s !== "none") {
      // 거부 케이스는 CTA 클릭 후 결과 화면 캡처 (CTA 가 disabled 인 케이스 invalid 는 직접 입력 우회)
      const cta = page.getByRole("button", { name: "출금하기" });
      if (await cta.isEnabled()) {
        await cta.click();
        await settle(page);
      }
    }
    await expect(page).toHaveScreenshot(`withdraw-${s}.png`, { fullPage: true, animations: "disabled" });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// transfer
const TRANSFER_SCENARIOS_INPUT = ["none", "same"] as const;        // 입력 단계에서 캡처
const TRANSFER_SCENARIOS_CONFIRM = ["fds", "idem"] as const;       // 확인 단계 (다음 클릭)

for (const s of TRANSFER_SCENARIOS_INPUT) {
  test(`transfer scenario ${s} (input step)`, async ({ page }) => {
    await page.goto(`/customer/transfer?scenario=${s}`, { waitUntil: "networkidle" });
    await settle(page);
    await expect(page).toHaveScreenshot(`transfer-${s}.png`, { fullPage: true, animations: "disabled" });
  });
}

for (const s of TRANSFER_SCENARIOS_CONFIRM) {
  test(`transfer scenario ${s} (confirm step)`, async ({ page }) => {
    await page.goto(`/customer/transfer?scenario=${s}`, { waitUntil: "networkidle" });
    await settle(page);
    await page.getByRole("button", { name: "다음" }).click();
    await settle(page);
    await expect(page).toHaveScreenshot(`transfer-${s}.png`, { fullPage: true, animations: "disabled" });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// signup — DUPLICATE_EMAIL 분기는 이메일 입력 상태에서 시각화
const SIGNUP_SCENARIOS = [
  { id: "none",       email: "" },
  { id: "dup",        email: "user@example.com" },
  { id: "dup_closed", email: "closed@example.com" },
] as const;

for (const s of SIGNUP_SCENARIOS) {
  test(`signup scenario ${s.id}`, async ({ page }) => {
    await page.goto(`/customer/signup?scenario=${s.id}`, { waitUntil: "networkidle" });
    await settle(page);
    if (s.email) {
      await page.getByPlaceholder("you@example.com").fill(s.email);
      await settle(page);
    }
    await expect(page).toHaveScreenshot(`signup-${s.id}.png`, { fullPage: true, animations: "disabled" });
  });
}
