// 16 화면 + 허브 페이지 visual 회귀 baseline.
// 각 라우트 진입 → 네트워크 idle + 한 번의 추가 raf 대기 후 풀페이지 스냅샷.
//
// baseline 갱신: `npx playwright test screens --update-snapshots`
// 검증 실행:    `npx playwright test screens`

import { test, expect } from "@playwright/test";

const SCREENS: ReadonlyArray<{ id: string; route: string }> = [
  { id: "hub",                  route: "/" },
  // CUSTOMER
  { id: "customer-home",        route: "/customer/home" },
  { id: "customer-deposit",     route: "/customer/deposit" },
  { id: "customer-withdraw",    route: "/customer/withdraw" },
  { id: "customer-transfer",    route: "/customer/transfer" },
  { id: "customer-history",     route: "/customer/history" },
  { id: "customer-td-sim",      route: "/customer/td-sim" },
  { id: "customer-receipt",     route: "/customer/receipt" },
  { id: "customer-signup",      route: "/customer/signup" },
  // OPERATOR
  { id: "operator-customer-360", route: "/operator/customer-360" },
  { id: "operator-edd",          route: "/operator/edd" },
  { id: "operator-audit-diff",   route: "/operator/audit-diff" },
  // OPS
  { id: "ops-monitor",          route: "/ops/monitor" },
  { id: "ops-fds",              route: "/ops/fds" },
  { id: "ops-report",           route: "/ops/report" },
  // DESIGN SYSTEM
  { id: "system-errors",        route: "/system/errors" },
  { id: "system-gauge",         route: "/system/gauge" },
];

for (const s of SCREENS) {
  test(`${s.id} 풀페이지 스냅샷`, async ({ page }) => {
    await page.goto(s.route, { waitUntil: "networkidle" });
    // 폰트·이미지·레이아웃 안정화 대기 (1 raf 충분치 않은 경우 대비)
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(150);

    await expect(page).toHaveScreenshot(`${s.id}.png`, {
      fullPage: true,
      animations: "disabled",
    });
  });
}
