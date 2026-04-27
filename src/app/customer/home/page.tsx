// 화면 1 — 계좌 대시보드 (Home).
// API 연결 검증용 RSC: GET /api/v1/accounts/{id} + /balance 두 endpoint 호출.
// 백엔드가 응답하면 마스킹 계좌번호·잔액·상태 배지를, 그렇지 않으면 안내를 표시.

import Link from "next/link";
import { api, ApiError } from "@/api/client";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { StatusBadge } from "@/components/primitives/StatusBadge";
import type { AccountState } from "@/lib/tokens";

// 데모 계좌 ID — DemoSeeder 로 시드된 1번 계좌. 실 인증 도입 전까지 단일.
const DEMO_ACCOUNT_ID = 1;

// 백엔드 AccountResponse 와 BalanceResponse 의 필요 필드 (schema.d.ts 미생성 시 fallback shape).
// `npm run openapi:gen` 후 src/api/types.ts 의 components["schemas"] 로 대체 권장.
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
  balance: string;             // 마스킹된 string (PiiMasker.maskAmount)
  lastTransactionAt: string | null;
};

type LoadResult =
  | { ok: true; account: AccountResponse; balance: BalanceResponse }
  | { ok: false; reason: string };

async function loadDashboard(): Promise<LoadResult> {
  try {
    const [account, balance] = await Promise.all([
      api.get<AccountResponse>(`/api/v1/accounts/${DEMO_ACCOUNT_ID}`),
      api.get<BalanceResponse>(`/api/v1/accounts/${DEMO_ACCOUNT_ID}/balance`),
    ]);
    return { ok: true, account, balance };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, reason: `${e.code} (HTTP ${e.status})` };
    return { ok: false, reason: e instanceof Error ? e.message : "백엔드 연결 실패" };
  }
}

export default async function Page() {
  const result = await loadDashboard();

  return (
    <div className="bg-paper-2 min-h-[calc(100vh-58px)] p-10">
      <div className="mx-auto max-w-[640px]">
        <Link href="/" className="font-mono text-[11px] text-ink-3 hover:text-ink">← all screens</Link>

        <Eyebrow className="mt-6 mb-3">SCREEN 01 · CUSTOMER · MOBILE</Eyebrow>
        <h1 className="font-serif text-[40px] leading-[1.1] font-medium tracking-[-0.025em] mb-2">
          홍**님, 안녕하세요
        </h1>

        {result.ok ? <Connected account={result.account} balance={result.balance} /> : <Disconnected reason={result.reason} />}

        <QuickActions />
      </div>
    </div>
  );
}

function Connected({ account, balance }: { account: AccountResponse; balance: BalanceResponse }) {
  return (
    <section className="mt-8 border border-rule-strong bg-paper p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <Eyebrow className="mb-1">DDA · {account.productCode}</Eyebrow>
          <div className="font-mono text-sm text-ink-2 tnum">{account.accountNumber}</div>
        </div>
        <StatusBadge state={account.status} />
      </div>

      <div className="mb-6">
        <Eyebrow className="mb-1">잔액</Eyebrow>
        <div className="font-sans tnum font-medium text-[40px] tracking-[-0.02em]">
          {balance.balance}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <LimitRow label="비대면 한도" value={account.dailyTransferLimit} />
        <LimitRow label="ATM 한도" value={account.dailyAtmWithdrawLimit} />
      </div>

      {balance.lastTransactionAt && (
        <div className="mt-5 pt-4 border-t border-rule font-mono text-[10px] text-ink-3">
          최근 거래: {new Date(balance.lastTransactionAt).toLocaleString("ko-KR")}
        </div>
      )}
    </section>
  );
}

function LimitRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between border-t border-rule pt-2">
      <span className="text-ink-3">{label}</span>
      <span className="font-mono tnum">{value.toLocaleString("ko-KR")}원</span>
    </div>
  );
}

function Disconnected({ reason }: { reason: string }) {
  return (
    <section className="mt-8 border border-rule-strong bg-paper p-8">
      <Eyebrow className="mb-3">백엔드 연결 실패</Eyebrow>
      <p className="font-serif text-base text-ink-2 leading-relaxed mb-4">
        xbank 백엔드(<code className="font-mono text-sm">localhost:8080</code>)에 연결할 수 없습니다.
      </p>
      <pre className="font-mono text-[11px] text-ink-3 bg-paper-2 p-3 border border-rule overflow-x-auto">{reason}</pre>
      <ul className="mt-5 font-mono text-[11px] text-ink-3 space-y-1.5">
        <li>1. 백엔드 기동: <code className="text-ink">./gradlew bootRun</code></li>
        <li>2. OpenAPI 명세: <code className="text-ink">curl localhost:8080/v3/api-docs</code></li>
        <li>3. 타입 재생성: <code className="text-ink">npm run openapi:gen</code></li>
      </ul>
    </section>
  );
}

function QuickActions() {
  const actions = [
    { label: "입금",    href: "/customer/deposit" },
    { label: "출금",    href: "/customer/withdraw" },
    { label: "이체",    href: "/customer/transfer" },
    { label: "정기예금", href: "/customer/td-sim" },
  ];
  return (
    <section className="mt-8 grid grid-cols-4 gap-2">
      {actions.map((a) => (
        <Link
          key={a.href}
          href={a.href}
          className="border border-rule-strong bg-paper py-4 text-center font-serif text-sm hover:bg-paper-2"
        >
          {a.label}
        </Link>
      ))}
    </section>
  );
}
