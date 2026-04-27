"use client";
// 4 단계 가입 폼 — 이메일 → 약관 → 본인확인 → 비밀번호 → 완료.
//
// 시나리오 토글로 DUPLICATE_EMAIL (CLOSED 포함) / 정상 진행 분기 시연.
// 실제 백엔드 호출은 사용 안 함 (시연 안전).

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Eyebrow } from "@/components/primitives/Eyebrow";

type Step = "email" | "terms" | "verify" | "password" | "done";
type Scenario = "none" | "dup" | "dup_closed";

const STEPS: ReadonlyArray<{ id: Step; label: string }> = [
  { id: "email",    label: "이메일" },
  { id: "terms",    label: "약관" },
  { id: "verify",   label: "본인확인" },
  { id: "password", label: "비밀번호" },
  { id: "done",     label: "완료" },
];

const SCENARIOS: ReadonlyArray<{ id: Scenario; label: string; codeBadge?: string }> = [
  { id: "none",       label: "정상" },
  { id: "dup",        label: "이미 가입된 이메일", codeBadge: "DUPLICATE_EMAIL" },
  { id: "dup_closed", label: "탈퇴 고객 이메일",   codeBadge: "DUPLICATE_EMAIL · CLOSED" },
];

export function SignupForm({ initialScenario }: { initialScenario: string }) {
  const [scenario, setScenario] = useState<Scenario>(toScenario(initialScenario));
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState({ tos: false, privacy: false, marketing: false });
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [pw, setPw] = useState("");

  const dupError = useMemo(() => {
    if (scenario === "none") return null;
    if (email.length < 3) return null;
    return scenario === "dup_closed"
      ? { kind: "closed" as const,   summary: "탈퇴 고객의 이메일입니다. 사기 방지 정책상 재사용이 영구 차단됩니다." }
      : { kind: "active" as const,   summary: "이미 가입된 이메일입니다. 비밀번호를 잊으셨다면 로그인 화면에서 재설정." };
  }, [scenario, email]);

  const idx = STEPS.findIndex((s) => s.id === step);
  const required = agreed.tos && agreed.privacy;

  return (
    <>
      <ScenarioToggle value={scenario} onChange={(s) => { setScenario(s); setStep("email"); }} />
      <StepIndicator current={idx} />

      {step === "email" && (
        <Section title="이메일">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-transparent border-b border-rule focus:outline-none focus:border-ink font-serif text-base py-1"
          />
          {dupError && <DupErrorInline kind={dupError.kind} summary={dupError.summary} />}
          <FooterCta
            onNext={() => !dupError && email.length > 3 && setStep("terms")}
            disabled={!!dupError || email.length < 5}
          />
        </Section>
      )}

      {step === "terms" && (
        <Section title="약관 동의">
          <ul className="space-y-2 mb-4">
            <TermsItem
              label="서비스 이용약관 (필수)"
              checked={agreed.tos}
              onChange={(v) => setAgreed({ ...agreed, tos: v })}
              required
            />
            <TermsItem
              label="개인정보 처리방침 (필수)"
              checked={agreed.privacy}
              onChange={(v) => setAgreed({ ...agreed, privacy: v })}
              required
            />
            <TermsItem
              label="마케팅 정보 수신 (선택)"
              checked={agreed.marketing}
              onChange={(v) => setAgreed({ ...agreed, marketing: v })}
            />
          </ul>
          <FooterCta
            onPrev={() => setStep("email")}
            onNext={() => required && setStep("verify")}
            disabled={!required}
          />
        </Section>
      )}

      {step === "verify" && (
        <Section title="본인확인">
          <Eyebrow className="mb-1.5">전화번호</Eyebrow>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^\d-]/g, "").slice(0, 13))}
            placeholder="010-1234-5678"
            className="w-full bg-transparent border-b border-rule focus:outline-none focus:border-ink font-mono text-base tnum py-1 mb-4"
          />
          <Eyebrow className="mb-1.5">SMS OTP (6자리)</Eyebrow>
          <input
            inputMode="numeric"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/[^\d]/g, "").slice(0, 6))}
            placeholder="000000"
            className="w-full bg-transparent border-b border-rule focus:outline-none focus:border-ink font-mono text-2xl tnum tracking-[0.4em] py-1"
          />
          <FooterCta
            onPrev={() => setStep("terms")}
            onNext={() => phone.length > 8 && otp.length === 6 && setStep("password")}
            disabled={phone.length < 9 || otp.length < 6}
          />
        </Section>
      )}

      {step === "password" && (
        <Section title="비밀번호">
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="대소문자·숫자·특수문자 조합 8자 이상"
            className="w-full bg-transparent border-b border-rule focus:outline-none focus:border-ink font-mono text-base py-1 mb-3"
          />
          <PasswordStrength pw={pw} />
          <FooterCta
            onPrev={() => setStep("verify")}
            onNext={() => pw.length >= 8 && setStep("done")}
            disabled={pw.length < 8}
            nextLabel="가입하기"
          />
        </Section>
      )}

      {step === "done" && <SuccessStep email={email} />}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function ScenarioToggle({ value, onChange }: { value: Scenario; onChange: (s: Scenario) => void }) {
  return (
    <div className="border border-rule-strong bg-paper p-3 mb-4">
      <Eyebrow className="mb-2">시나리오 토글</Eyebrow>
      <div className="flex flex-wrap gap-1">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => onChange(s.id)}
            className={
              "font-mono text-[10px] px-2 py-1 border " +
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

function StepIndicator({ current }: { current: number }) {
  return (
    <ol className="flex gap-2 mb-5 font-mono text-[10px]">
      {STEPS.map((s, i) => (
        <li key={s.id} className="flex-1 text-center">
          <div
            className="h-1 mb-1"
            style={{ background: i <= current ? "var(--ink)" : "var(--rule)" }}
          />
          <div className={i <= current ? "text-ink font-medium" : "text-ink-3"}>
            {String(i + 1).padStart(2, "0")} · {s.label}
          </div>
        </li>
      ))}
    </ol>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-rule-strong bg-paper p-5">
      <Eyebrow className="mb-3">{title}</Eyebrow>
      {children}
    </section>
  );
}

function FooterCta({ onPrev, onNext, disabled, nextLabel = "다음" }: {
  onPrev?: () => void;
  onNext: () => void;
  disabled: boolean;
  nextLabel?: string;
}) {
  return (
    <div className="flex gap-2 mt-5">
      {onPrev && (
        <button onClick={onPrev} className="flex-1 border border-ink py-3 font-serif text-sm">이전</button>
      )}
      <button
        onClick={onNext}
        disabled={disabled}
        className={
          "flex-[2] py-3 font-serif text-sm " +
          (disabled ? "bg-ink-3 text-paper" : "bg-ink text-paper")
        }
      >
        {nextLabel}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function DupErrorInline({ kind, summary }: { kind: "active" | "closed"; summary: string }) {
  return (
    <div className="mt-3 border-l-2 bg-paper p-3" style={{ borderColor: "var(--st-suspended)" }}>
      <div className="flex items-center gap-2 mb-1">
        <span
          className="font-mono text-[10px] uppercase tracking-[0.04em] px-1.5 py-px border"
          style={{ borderColor: "var(--st-suspended)", color: "var(--st-suspended)" }}
        >
          409 DUPLICATE_EMAIL
        </span>
        {kind === "closed" && (
          <span
            className="font-mono text-[10px] uppercase tracking-[0.04em] px-1.5 py-px border"
            style={{ borderColor: "var(--st-closed)", color: "var(--st-closed)" }}
          >
            CLOSED
          </span>
        )}
      </div>
      <div className="text-xs text-ink-2 leading-relaxed">{summary}</div>
    </div>
  );
}

function TermsItem({ label, checked, onChange, required }: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  required?: boolean;
}) {
  return (
    <li>
      <label className="flex items-start gap-2.5 cursor-pointer text-sm">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 accent-ink"
        />
        <span className={required ? "font-medium" : "text-ink-2"}>{label}</span>
      </label>
    </li>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function PasswordStrength({ pw }: { pw: string }) {
  const score = scorePassword(pw);
  const labels = ["매우 약함", "약함", "보통", "강함", "매우 강함"];
  const colors = ["var(--st-suspended)", "var(--st-suspended)", "var(--st-edd-pending)", "var(--tx-deposit)", "var(--tx-deposit)"];
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-1 flex-1"
            style={{ background: i < score ? colors[score - 1] : "var(--rule)" }}
          />
        ))}
      </div>
      <div className="font-mono text-[11px] text-ink-3 tnum">
        {pw.length === 0 ? "—" : `${labels[score - 1] ?? "매우 약함"} · ${pw.length}자`}
      </div>
    </div>
  );
}

function scorePassword(pw: string): number {
  if (pw.length === 0) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw)) s++;
  if (pw.length >= 12) s++;
  return Math.min(5, s);
}

// ─────────────────────────────────────────────────────────────────────────────
function SuccessStep({ email }: { email: string }) {
  return (
    <div className="border border-rule-strong bg-paper p-6">
      <div className="font-mono text-[11px] tracking-[0.06em] text-ink-3 uppercase mb-3">200 OK · 가입 완료</div>
      <div className="font-serif text-[28px] leading-tight mb-2">환영합니다</div>
      <p className="font-serif text-sm text-ink-2 leading-relaxed mb-1">
        <span className="font-mono text-xs">{email || "you@example.com"}</span> 으로 환영 메일이 발송되었습니다.
      </p>
      <p className="font-serif text-sm text-ink-2 leading-relaxed mb-6">
        첫 입출금 통장을 만들어 자산 관리를 시작하세요.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Link href={"/customer/home" as Route} className="border border-ink py-3 text-center font-serif text-sm hover:bg-paper-2">
          홈으로
        </Link>
        <Link href={"/customer/home" as Route} className="bg-ink text-paper py-3 text-center font-serif text-sm">
          DDA 개설하기
        </Link>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function toScenario(s: string): Scenario {
  const known: Scenario[] = ["none", "dup", "dup_closed"];
  return (known.includes(s as Scenario) ? s : "none") as Scenario;
}
