// 화면 1 — 계좌 대시보드 (Home).
//
// IA 매핑 (docs/ux/screen-ia.md §화면 1):
//   ① 헤더 인사말  ② 자산 요약 + Δ  ③ 비율 도넛  ④ 빠른 액션 4-버튼
//   ⑤ DDA 카드 리스트  ⑥ 정기예금 카드 리스트  ⑦ 알림 영역
//
// 데이터 소스:
//   - 계좌 1건은 GET /api/v1/accounts/1 + /balance 실제 호출 (REAL 배지)
//   - 추가 DDA / 정기예금 / 알림은 fixture (DEMO 배지) — 백엔드에 "내 계좌 목록" endpoint 없음

import Link from "next/link";
import type { Route } from "next";
import { api, ApiError } from "@/api/client";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { StatusBadge } from "@/components/primitives/StatusBadge";
import { Donut } from "@/components/primitives/Donut";
import {
  FIXTURE_DDA_CARDS,
  FIXTURE_TIME_DEPOSITS,
  FIXTURE_NOTIFICATIONS,
  ASSET_DELTA_FIXTURE,
  type DashboardCard,
  type TimeDepositCard,
  type Notification,
} from "@/data/dashboard-fixtures";
import type { AccountState } from "@/lib/tokens";

const DEMO_ACCOUNT_ID = 1;

type AccountResponse = {
  id: number;
  accountNumber: string;
  productCode: string;
  status: AccountState;
  dailyTransferLimit: number;
  dailyAtmWithdrawLimit: number;
};

type BalanceResponse = {
  accountId: number;
  accountNumber: string;
  balance: number;        // 본인 self-service — 평문 long
  lastTransactionAt: string | null;
};

type RealCard = DashboardCard & { isFixture?: false };

async function loadRealCard(): Promise<{ card: RealCard | null; reason?: string; lastTx: string | null }> {
  try {
    const [account, balance] = await Promise.all([
      api.get<AccountResponse>(`/api/v1/accounts/${DEMO_ACCOUNT_ID}`),
      api.get<BalanceResponse>(`/api/v1/accounts/${DEMO_ACCOUNT_ID}/balance`),
    ]);
    return {
      card: {
        productCode: account.productCode,
        alias: "주거래 통장",
        accountNumber: account.accountNumber,
        status: account.status,
        balance: balance.balance,        // 평문 long
      },
      lastTx: balance.lastTransactionAt,
    };
  } catch (e) {
    const reason = e instanceof ApiError ? `${e.code} (HTTP ${e.status})`
      : e instanceof Error ? e.message : "백엔드 연결 실패";
    return { card: null, reason, lastTx: null };
  }
}

export default async function Page() {
  const real = await loadRealCard();
  const ddaCards: DashboardCard[] = real.card ? [real.card, ...FIXTURE_DDA_CARDS] : FIXTURE_DDA_CARDS;
  const tdCards = FIXTURE_TIME_DEPOSITS;

  const ddaSum = ddaCards.filter((c) => c.status === "ACTIVE").reduce((s, c) => s + c.balance, 0);
  const tdSum = tdCards.reduce((s, c) => s + c.principal + c.accruedInterest, 0);
  const total = ddaSum + tdSum;

  const isEmpty = ddaCards.length === 0 && tdCards.length === 0;

  return (
    <div className="bg-paper-2 min-h-[calc(100vh-58px)]">
      <div className="mx-auto max-w-[640px] p-6 pb-16">
        <Link href="/" className="font-mono text-[11px] text-ink-3 hover:text-ink">← all screens</Link>

        <Eyebrow className="mt-6 mb-3">SCREEN 01 · CUSTOMER · MOBILE</Eyebrow>
        <h1 className="font-serif text-[40px] leading-[1.1] font-medium tracking-[-0.025em] mb-6">
          홍**님, 안녕하세요
        </h1>

        {real.reason && <BackendBanner reason={real.reason} />}

        {isEmpty ? (
          <EmptyState />
        ) : (
          <>
            <AssetSummary total={total} ddaSum={ddaSum} tdSum={tdSum} />
            <QuickActions />
            <DdaList cards={ddaCards} lastTx={real.lastTx} />
            <TimeDepositList cards={tdCards} />
            <Notifications items={FIXTURE_NOTIFICATIONS} />
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 자산 요약 + 비율 도넛
function AssetSummary({ total, ddaSum, tdSum }: { total: number; ddaSum: number; tdSum: number }) {
  return (
    <section className="border border-rule-strong bg-paper p-6 mb-3 flex items-center gap-6">
      <Donut
        parts={[
          { value: ddaSum, color: "var(--tx-deposit)", label: "DDA" },
          { value: tdSum,  color: "var(--tx-maturity-payout)", label: "정기예금" },
        ]}
      />
      <div className="flex-1">
        <Eyebrow className="mb-1">총 자산</Eyebrow>
        <div className="font-sans tnum font-medium text-[34px] tracking-[-0.02em] leading-none">
          {total.toLocaleString("ko-KR")}<span className="text-ink-3 font-normal text-base ml-1">원</span>
        </div>
        <div className="font-mono text-[11px] tnum mt-2 flex items-center gap-1.5">
          <span style={{ color: "var(--tx-deposit)" }}>
            {ASSET_DELTA_FIXTURE.trend === "up" ? "▲" : "▼"} {ASSET_DELTA_FIXTURE.amount.toLocaleString("ko-KR")}원
          </span>
          <span className="text-ink-3">· 어제 대비 {ASSET_DELTA_FIXTURE.pct}%</span>
        </div>
        <div className="mt-3 flex gap-3 text-[11px] font-mono">
          <Legend color="var(--tx-deposit)" label="DDA" value={ddaSum} />
          <Legend color="var(--tx-maturity-payout)" label="정기예금" value={tdSum} />
        </div>
      </div>
    </section>
  );
}

function Legend({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-2 h-2" style={{ background: color }} />
      <span className="text-ink-3">{label}</span>
      <span className="tnum">{value.toLocaleString("ko-KR")}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 빠른 액션 4-버튼
function QuickActions() {
  const actions: ReadonlyArray<{ label: string; href: Route; icon: string }> = [
    { label: "입금",    href: "/customer/deposit",  icon: "+" },
    { label: "출금",    href: "/customer/withdraw", icon: "−" },
    { label: "이체",    href: "/customer/transfer", icon: "→" },
    { label: "정기예금", href: "/customer/td-sim",   icon: "%" },
  ];
  return (
    <section className="grid grid-cols-4 gap-2 mb-6">
      {actions.map((a) => (
        <Link
          key={a.href}
          href={a.href}
          className="border border-rule-strong bg-paper py-4 text-center font-serif hover:bg-paper-2"
        >
          <div className="font-mono text-base mb-0.5">{a.icon}</div>
          <div className="text-xs">{a.label}</div>
        </Link>
      ))}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DDA 카드 리스트
function DdaList({ cards, lastTx }: { cards: DashboardCard[]; lastTx: string | null }) {
  return (
    <section className="mb-6">
      <Eyebrow className="mb-2">입출금 통장 · {cards.length}</Eyebrow>
      <ul className="space-y-2">
        {cards.map((c, i) => (
          <li key={i} className="border border-rule-strong bg-paper p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-serif text-sm font-medium">{c.alias}</div>
                <div className="font-mono text-[11px] text-ink-3 tnum mt-0.5">
                  {c.accountNumber} · {c.productCode}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <SourceBadge isFixture={c.isFixture} />
                <StatusBadge state={c.status} />
              </div>
            </div>
            <div className="font-sans tnum font-medium text-2xl">
              {c.balance.toLocaleString("ko-KR")}
              <span className="text-ink-3 font-normal text-sm ml-1">원</span>
            </div>
            {!c.isFixture && lastTx && (
              <div className="mt-2 font-mono text-[10px] text-ink-3">
                최근 거래: {new Date(lastTx).toLocaleString("ko-KR")}
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 정기예금 카드 리스트
function TimeDepositList({ cards }: { cards: TimeDepositCard[] }) {
  if (cards.length === 0) return null;
  return (
    <section className="mb-6">
      <Eyebrow className="mb-2">정기예금 · {cards.length}</Eyebrow>
      <ul className="space-y-2">
        {cards.map((c, i) => {
          const dDay = daysUntil(c.maturesAt);
          const total = c.principal + c.accruedInterest;
          const progress = c.accruedInterest / (c.principal * c.rate / 100);
          return (
            <li key={i} className="border border-rule-strong bg-paper p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-serif text-sm font-medium">{c.alias}</div>
                  <div className="font-mono text-[11px] text-ink-3 mt-0.5">
                    {c.productCode} · 연 {c.rate.toFixed(2)}% · 만기 D-{dDay}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <SourceBadge isFixture={c.isFixture} />
                  <StatusBadge state={c.status} />
                </div>
              </div>
              <div className="font-sans tnum font-medium text-2xl">
                {total.toLocaleString("ko-KR")}<span className="text-ink-3 font-normal text-sm ml-1">원</span>
              </div>
              <div className="mt-3">
                <div className="flex justify-between font-mono text-[10px] text-ink-3 mb-1">
                  <span>이자 누적</span>
                  <span className="tnum">+{c.accruedInterest.toLocaleString("ko-KR")}원</span>
                </div>
                <div className="h-1.5 bg-rule">
                  <div
                    className="h-full"
                    style={{
                      width: `${Math.min(100, progress * 100)}%`,
                      background: "var(--tx-maturity-payout)",
                    }}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function daysUntil(iso: string): number {
  const target = new Date(iso).getTime();
  const now = Date.now();
  return Math.max(0, Math.ceil((target - now) / 86_400_000));
}

// ─────────────────────────────────────────────────────────────────────────────
// 알림 영역
function Notifications({ items }: { items: Notification[] }) {
  if (items.length === 0) return null;
  return (
    <section>
      <Eyebrow className="mb-2">알림 · {items.length}</Eyebrow>
      <ul className="space-y-2">
        {items.map((n, i) => (
          <li key={i} className="border-l-2 border-st-edd-pending bg-paper p-3 pr-4">
            <div className="font-serif text-sm font-medium mb-0.5">{n.title}</div>
            <div className="text-xs text-ink-2 leading-relaxed">{n.body}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 헬퍼
function SourceBadge({ isFixture }: { isFixture?: boolean }) {
  return (
    <span
      className="font-mono text-[9px] tracking-[0.06em] uppercase px-1 py-px border"
      style={{
        color: isFixture ? "var(--ink-3)" : "var(--accent)",
        borderColor: isFixture ? "var(--ink-3)" : "var(--accent)",
      }}
    >
      {isFixture ? "demo" : "real"}
    </span>
  );
}

function BackendBanner({ reason }: { reason: string }) {
  return (
    <div className="border-l-2 border-st-suspended bg-paper p-3 mb-4">
      <div className="font-mono text-[11px] tracking-[0.04em] text-ink-3 uppercase mb-1">백엔드 연결 안 됨</div>
      <div className="text-xs text-ink-2">실 계좌 카드는 표시되지 않습니다 — fixture 만 노출.</div>
      <pre className="mt-2 font-mono text-[10px] text-ink-3">{reason}</pre>
    </div>
  );
}

function EmptyState() {
  return (
    <section className="border border-rule-strong bg-paper p-10 text-center">
      <div className="font-serif text-lg mb-2">아직 계좌가 없어요</div>
      <p className="text-sm text-ink-2 mb-4">첫 입출금 통장을 만들어 자산 관리를 시작하세요.</p>
      <Link
        href={"/customer/signup" as Route}
        className="inline-block border border-ink bg-ink text-paper px-5 py-2 font-serif text-sm"
      >
        DDA 개설하기
      </Link>
    </section>
  );
}
