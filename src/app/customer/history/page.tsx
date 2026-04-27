// 화면 4 — 거래 내역. GET /api/v1/accounts/1/transactions 실호출.
//
// 백엔드 endpoint 가 from/to (LocalDate, ISO) 필수 — 기간 파라미터 변환 후 전달.
// 응답 TransactionsResponse 의 amount/balanceBefore/balanceAfter 는 PiiMasker 마스킹 string.

import { PageEyebrow } from "@/components/chrome/PageEyebrow";
import { BackendBanner } from "@/components/chrome/BackendBanner";
import { HistoryView } from "./HistoryView";
import { api, ApiError } from "@/api/client";
import type { TxRow } from "@/data/transactions-fixture";
import type { TxType } from "@/lib/tokens";

export const dynamic = "force-dynamic";

type SearchParams = { type?: string; range?: string };

const ACCOUNT_ID = 1;

type LiveTransaction = {
  id: number;
  accountId: number;
  type: TxType;
  amount: string;
  balanceBefore: string;
  balanceAfter: string;
  actorChannel: "WEB" | "MOBILE" | "BRANCH" | "CALL_CENTER" | "ATM" | "BATCH" | "API";
  description: string | null;
  createdAt: string;
  traceId: string | null;
};

type LiveResponse = {
  transactions: LiveTransaction[];
  page: number;
  size: number;
  totalElements: number;
};

async function loadTransactions(): Promise<{ rows: TxRow[] | null; reason?: string }> {
  // 백엔드 endpoint 가 from/to 필수. 최근 90일.
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 90);
  const fromStr = from.toISOString().slice(0, 10);
  const toStr = to.toISOString().slice(0, 10);
  try {
    const resp = await api.get<LiveResponse>(
      `/api/v1/accounts/${ACCOUNT_ID}/transactions?from=${fromStr}&to=${toStr}&size=50`,
    );
    return { rows: resp.transactions.map(toRow) };
  } catch (e) {
    const reason = e instanceof ApiError ? `${e.code} (HTTP ${e.status})` : "백엔드 연결 실패";
    return { rows: null, reason };
  }
}

function toRow(t: LiveTransaction): TxRow {
  // PiiMasker 마스킹 string ("12,345,***") 에서 마지막 *** 를 000 으로 가정해 number 화.
  // 거래 영수증 컨텍스트라 마스킹은 정책상 유지 — 합산은 근사치.
  const amount = parseMasked(t.amount);
  const balanceAfter = parseMasked(t.balanceAfter);
  const signed: 1 | -1 = ["DEPOSIT", "TRANSFER_IN", "MATURITY_PAYOUT", "EARLY_TERMINATION_PAYOUT"]
    .includes(t.type) ? 1 : -1;
  return {
    id: `TX-${t.id}`,
    type: t.type,
    amount,
    signed,
    memo: t.description ?? "",
    occurredAt: t.createdAt,
    balanceAfter,
    channel: t.actorChannel === "API" || t.actorChannel === "CALL_CENTER" ? "WEB" : t.actorChannel,
  };
}

function parseMasked(raw: string): number {
  const normalized = raw.replace(/\*+/g, "000").replace(/[^\d]/g, "");
  return normalized ? Number(normalized) : 0;
}

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const { rows, reason } = await loadTransactions();
  const usingFixture = rows == null;

  return (
    <div className="bg-paper-2 min-h-[calc(100vh-58px)]">
      <div className="mx-auto max-w-[640px] p-6 pb-16">
        <PageEyebrow screenId="history" />
        <h1 className="font-serif text-[40px] leading-[1.1] font-medium tracking-[-0.025em] mb-2">
          거래 내역
        </h1>
        <p className="font-serif text-sm text-ink-2 mb-6 leading-relaxed">
          백엔드 6-value TransactionType 그대로 — 입금·출금·이체출금·이체입금·만기 지급·중도해지 지급.
        </p>

        {usingFixture && reason && <BackendBanner reason={reason} className="mb-4" />}

        <HistoryView
          rows={rows ?? (await fixtureFallback())}
          initialType={searchParams.type ?? "ALL"}
          initialRange={searchParams.range ?? "30D"}
        />
      </div>
    </div>
  );
}

async function fixtureFallback(): Promise<TxRow[]> {
  const m = await import("@/data/transactions-fixture");
  return m.FIXTURE_TRANSACTIONS;
}
