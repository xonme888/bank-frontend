"use client";
// 이체 3-단계 화면 — 입력 → 확인 → 완료. 시나리오 토글로 분기 시연.
//
// 분기:
//  - none:     200 OK + transferGroupId 양변 timeline
//  - same:     SAME_ACCOUNT_TRANSFER (입력 단계 인라인)
//  - fds:      FRAUD_DETECTION_REJECTED (확인 단계 모달)
//  - idem:     IDEMPOTENCY_KEY_REUSED (확인 단계 노란 배너)

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Eyebrow } from "@/components/primitives/Eyebrow";

type Scenario = "none" | "same" | "fds" | "idem";
type Step = "input" | "confirm" | "done";

const SCENARIOS: ReadonlyArray<{ id: Scenario; label: string; codeBadge: string }> = [
  { id: "none", label: "정상",           codeBadge: "200 OK" },
  { id: "same", label: "자기 이체",      codeBadge: "SAME_ACCOUNT_TRANSFER" },
  { id: "fds",  label: "FDS 거부",       codeBadge: "FRAUD_DETECTION_REJECTED" },
  { id: "idem", label: "Idempotency 재사용", codeBadge: "IDEMPOTENCY_KEY_REUSED" },
];

const FROM = { alias: "주거래 통장", number: "110-***-7890", balance: 2_450_000 };
const TO_DEFAULT = { name: "김**", bank: "신한은행", number: "100-***-5544" };

export function TransferScreen({ initialScenario }: { initialScenario: string }) {
  const [scenario, setScenario] = useState<Scenario>(toScenario(initialScenario));
  const [step, setStep] = useState<Step>("input");
  const [amount, setAmount] = useState(150_000);
  const [memo, setMemo] = useState("");
  const [recipient, setRecipient] = useState(`${TO_DEFAULT.bank} ${TO_DEFAULT.number}`);

  const def = useMemo(() => SCENARIOS.find((s) => s.id === scenario)!, [scenario]);
  const sameAccount = scenario === "same";
  const groupId = useMemo(() => fakeUuid(), [step, scenario]);

  return (
    <>
      <ScenarioToggle value={scenario} onChange={(s) => { setScenario(s); setStep("input"); }} />
      <StepIndicator step={step} />

      {step === "input" && (
        <InputStep
          amount={amount}
          memo={memo}
          recipient={recipient}
          sameAccount={sameAccount}
          onAmount={setAmount}
          onMemo={setMemo}
          onRecipient={setRecipient}
          onNext={() => !sameAccount && setStep("confirm")}
        />
      )}

      {step === "confirm" && (
        <ConfirmStep
          amount={amount}
          memo={memo}
          scenario={def}
          onBack={() => setStep("input")}
          onSubmit={() => def.id === "none" ? setStep("done") : null}
        />
      )}

      {step === "done" && (
        <DoneStep amount={amount} groupId={groupId} />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function ScenarioToggle({ value, onChange }: { value: Scenario; onChange: (s: Scenario) => void }) {
  return (
    <div className="border border-rule-strong bg-paper p-3 mb-4">
      <Eyebrow className="mb-2">시나리오 토글 · 백엔드 ErrorCode 매핑</Eyebrow>
      <div className="flex flex-wrap gap-1">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => onChange(s.id)}
            className={
              "font-mono text-[10px] tracking-[0.02em] px-2 py-1 border " +
              (value === s.id
                ? "bg-ink text-paper border-ink"
                : "bg-paper text-ink-2 border-rule-strong hover:border-ink hover:text-ink")
            }
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const steps: ReadonlyArray<{ id: Step; label: string }> = [
    { id: "input",   label: "입력" },
    { id: "confirm", label: "확인" },
    { id: "done",    label: "완료" },
  ];
  const idx = steps.findIndex((s) => s.id === step);
  return (
    <div className="flex items-center gap-3 mb-4 font-mono text-[11px] text-ink-3">
      {steps.map((s, i) => (
        <span key={s.id} className="flex items-center gap-3">
          <span className={i <= idx ? "text-ink font-medium" : ""}>
            <span className="tnum">{String(i + 1).padStart(2, "0")}</span> · {s.label}
          </span>
          {i < steps.length - 1 && <span className="text-ink-3">/</span>}
        </span>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function InputStep({
  amount, memo, recipient, sameAccount, onAmount, onMemo, onRecipient, onNext,
}: {
  amount: number; memo: string; recipient: string; sameAccount: boolean;
  onAmount: (n: number) => void; onMemo: (s: string) => void; onRecipient: (s: string) => void; onNext: () => void;
}) {
  return (
    <>
      <section className="border border-rule-strong bg-paper p-4 mb-3">
        <Eyebrow className="mb-1">출금 계좌</Eyebrow>
        <div className="font-serif text-sm font-medium">{FROM.alias}</div>
        <div className="font-mono text-[11px] text-ink-3 tnum">
          {FROM.number} · 잔액 {FROM.balance.toLocaleString("ko-KR")}원
        </div>
      </section>

      <section className="border border-rule-strong bg-paper p-4 mb-3">
        <Eyebrow className="mb-2">받는 분</Eyebrow>
        <input
          type="text"
          value={recipient}
          onChange={(e) => onRecipient(e.target.value)}
          className={
            "w-full bg-transparent border-b font-serif text-sm py-1 focus:outline-none " +
            (sameAccount ? "border-st-suspended text-st-suspended" : "border-rule focus:border-ink")
          }
        />
        {sameAccount && (
          <div className="font-mono text-[10px] text-st-suspended mt-1.5">
            ✕ SAME_ACCOUNT_TRANSFER · 본인 계좌로는 이체할 수 없습니다 (BR-TX-31)
          </div>
        )}
      </section>

      <section className="border border-rule-strong bg-paper p-4 mb-3">
        <Eyebrow className="mb-2">금액</Eyebrow>
        <div className="font-sans tnum font-medium text-[40px] tracking-[-0.025em]">
          <input
            type="text"
            inputMode="numeric"
            value={amount.toLocaleString("ko-KR")}
            onChange={(e) => onAmount(Number(e.target.value.replace(/[^\d]/g, "")) || 0)}
            className="bg-transparent border-b border-rule focus:outline-none focus:border-ink w-full"
          />
          <span className="text-ink-3 font-normal text-base ml-1">원</span>
        </div>
      </section>

      <section className="border border-rule-strong bg-paper p-4 mb-3">
        <Eyebrow className="mb-2">메모</Eyebrow>
        <input
          type="text"
          value={memo}
          onChange={(e) => onMemo(e.target.value.slice(0, 32))}
          placeholder="상대 통장에 표시될 메모 (최대 32자)"
          className="w-full bg-transparent border-b border-rule focus:outline-none focus:border-ink font-serif text-sm py-1"
        />
      </section>

      <button
        onClick={onNext}
        disabled={sameAccount || amount <= 0}
        className="w-full mt-3 bg-ink text-paper py-4 font-serif text-base disabled:bg-ink-3"
      >
        다음
      </button>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function ConfirmStep({
  amount, memo, scenario, onBack, onSubmit,
}: {
  amount: number;
  memo: string;
  scenario: typeof SCENARIOS[number];
  onBack: () => void;
  onSubmit: () => void;
}) {
  const isFds = scenario.id === "fds";
  const isIdem = scenario.id === "idem";

  return (
    <>
      {isIdem && <IdemBanner />}

      <section className="border border-rule-strong bg-paper p-5 mb-3">
        <Eyebrow className="mb-3">출금 측</Eyebrow>
        <Row label="계좌" value={`${FROM.alias} · ${FROM.number}`} />
        <Row label="출금 후 잔액" value={`${(FROM.balance - amount).toLocaleString("ko-KR")}원`} mono />

        <div className="my-4 border-t border-dashed border-rule" />

        <Eyebrow className="mb-3">받는 분</Eyebrow>
        <Row label="이름" value={TO_DEFAULT.name} />
        <Row label="계좌" value={`${TO_DEFAULT.bank} · ${TO_DEFAULT.number}`} mono />

        <div className="my-4 border-t border-dashed border-rule" />

        <div className="flex justify-between items-baseline">
          <Eyebrow>이체 금액</Eyebrow>
          <span className="font-sans tnum font-medium text-[28px] tracking-[-0.02em]">
            {amount.toLocaleString("ko-KR")}<span className="text-ink-3 font-normal text-base ml-1">원</span>
          </span>
        </div>
        {memo && <div className="font-mono text-[11px] text-ink-3 mt-2 tnum">메모: {memo}</div>}
      </section>

      <FdsEvaluation rejected={isFds} />

      <div className="flex gap-2 mt-4">
        <button onClick={onBack} className="flex-1 border border-ink py-3 font-serif text-sm">
          이전
        </button>
        <button
          onClick={onSubmit}
          disabled={isFds || isIdem}
          className="flex-[2] bg-ink text-paper py-3 font-serif text-base disabled:bg-ink-3"
        >
          이체하기
        </button>
      </div>

      {isFds && <FdsModal />}
    </>
  );
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-baseline mb-2">
      <span className="font-mono text-[11px] text-ink-3 uppercase tracking-[0.04em]">{label}</span>
      <span className={mono ? "font-mono text-sm tnum" : "font-serif text-sm"}>{value}</span>
    </div>
  );
}

function IdemBanner() {
  return (
    <div className="border-l-2 border-st-edd-pending bg-paper p-3 mb-3">
      <div className="font-mono text-[11px] text-st-edd-pending uppercase tracking-[0.04em] mb-1">
        IDEMPOTENCY_KEY_REUSED · 422
      </div>
      <div className="text-sm text-ink-2 leading-relaxed">
        같은 Idempotency-Key 가 이미 다른 본문으로 처리되었습니다. 새 키로 다시 시도하거나
        거래 내역에서 결과를 확인하세요.
      </div>
    </div>
  );
}

function FdsEvaluation({ rejected }: { rejected: boolean }) {
  if (rejected) {
    return (
      <section className="border-l-2 border-st-suspended bg-paper p-4 mb-3">
        <div className="font-mono text-[10px] text-st-suspended uppercase tracking-[0.04em] mb-1">
          FDS · 거부
        </div>
        <div className="text-xs text-ink-2 leading-relaxed">
          단기간 다회 송금 패턴이 감지되었습니다. 본인 거래라면 영업창구·고객센터를 통해 처리 가능.
        </div>
      </section>
    );
  }
  return (
    <section className="border-l-2 border-tx-deposit bg-paper p-4 mb-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.04em] mb-1" style={{ color: "var(--tx-deposit)" }}>
        FDS · 정상
      </div>
      <div className="text-xs text-ink-2">패턴 분석 결과 위험 신호 없음. score 0.04.</div>
    </section>
  );
}

function FdsModal() {
  return (
    <div className="fixed inset-0 z-50 bg-ink/40 flex items-center justify-center p-6" role="dialog">
      <div className="bg-paper border border-ink w-full max-w-[420px] p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="font-mono text-[10px] px-1.5 py-px border" style={{ borderColor: "var(--st-suspended)", color: "var(--st-suspended)" }}>422</span>
          <code className="font-mono text-[11px] font-medium">FRAUD_DETECTION_REJECTED</code>
        </div>
        <div className="font-serif text-[24px] leading-tight mb-2">이체가 거부되었습니다</div>
        <p className="font-serif text-sm text-ink-2 leading-relaxed mb-4">
          이상 거래 감지 시스템(FDS)에서 본 거래를 거부했습니다.
        </p>
        <div className="border-l-2 pl-3 mb-5" style={{ borderColor: "var(--st-suspended)" }}>
          <Eyebrow className="mb-1">진단</Eyebrow>
          <div className="font-mono text-[11px] tnum text-ink-2 leading-relaxed">
            reasonCode: VELOCITY_SHORT_WINDOW<br />
            score: 0.87<br />
            summary: 30분 내 동일 수취인 5회 이상 송금
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 bg-ink text-paper py-3 font-serif text-sm">고객센터 연결</button>
          <button className="flex-1 border border-ink py-3 font-serif text-sm">다시 시도</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function DoneStep({ amount, groupId }: { amount: number; groupId: string }) {
  return (
    <div className="border border-rule-strong bg-paper p-6">
      <div className="font-mono text-[11px] tracking-[0.06em] text-ink-3 uppercase mb-3">200 OK · 이체 완료</div>
      <div className="font-serif text-[28px] mb-1 leading-tight">이체되었습니다</div>
      <div className="font-sans tnum font-medium text-[40px] tracking-[-0.025em] mb-1">
        −{amount.toLocaleString("ko-KR")}<span className="text-ink-3 font-normal text-base ml-1">원</span>
      </div>

      <div className="my-5 border-t border-dashed border-rule" />

      <Eyebrow className="mb-3">transferGroupId · 양변 timeline</Eyebrow>
      <ol className="space-y-2 mb-5">
        <li className="flex gap-3">
          <span className="font-mono text-[10px] text-ink-3 w-12 tnum">+0ms</span>
          <span className="text-sm">
            <span className="font-mono text-[10px] mr-1.5 px-1.5 py-px border" style={{ color: "var(--tx-transfer-out)", borderColor: "var(--tx-transfer-out)" }}>
              TRANSFER_OUT
            </span>
            {FROM.alias}에서 출금
          </span>
        </li>
        <li className="flex gap-3">
          <span className="font-mono text-[10px] text-ink-3 w-12 tnum">+12ms</span>
          <span className="text-sm">
            <span className="font-mono text-[10px] mr-1.5 px-1.5 py-px border" style={{ color: "var(--tx-transfer-in)", borderColor: "var(--tx-transfer-in)" }}>
              TRANSFER_IN
            </span>
            {TO_DEFAULT.name}님 통장으로 입금 (한 commit)
          </span>
        </li>
      </ol>
      <div className="font-mono text-[10px] text-ink-3 mb-5 break-all">
        groupId: {groupId}
      </div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <Link href={"/customer/history?type=TRANSFER_OUT" as Route} className="border border-ink py-3 text-center font-serif text-sm hover:bg-paper-2">
          거래 내역
        </Link>
        <Link href={"/customer/home" as Route} className="bg-ink text-paper py-3 text-center font-serif text-sm">
          홈으로
        </Link>
      </div>
      <button className="w-full border border-rule py-2.5 font-serif text-xs text-ink-2">영수증 다운로드</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function toScenario(s: string): Scenario {
  const known: Scenario[] = ["none", "same", "fds", "idem"];
  return (known.includes(s as Scenario) ? s : "none") as Scenario;
}

function fakeUuid(): string {
  // 시연용 — 실제 UUIDv4 는 백엔드에서 발급. crypto.randomUUID 사용.
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}
