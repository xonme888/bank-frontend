"use client";
// 고객 360° 의 인터랙티브 영역 — 본인확인 토글·응대 사유·CTA 바.

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Eyebrow } from "@/components/primitives/Eyebrow";

export function CustomerHeader() {
  const [verified, setVerified] = useState(false);
  const [reason, setReason] = useState("");

  return (
    <header className="border border-rule-strong bg-paper p-4 mb-3 flex items-center gap-6 flex-wrap">
      <div>
        <Eyebrow className="mb-1">고객</Eyebrow>
        <div className="font-serif text-2xl font-medium">홍** · #1</div>
        <div className="font-mono text-[10px] text-ink-3 tnum mt-0.5">PII 마스킹 적용 · 본인확인 후 전체 보기</div>
      </div>

      <div className="border-l border-rule h-12 mx-2" />

      <button
        onClick={() => setVerified((v) => !v)}
        className={
          "px-3 py-1.5 font-mono text-[11px] tracking-[0.04em] uppercase border " +
          (verified
            ? "bg-ink text-paper border-ink"
            : "bg-paper text-ink-2 border-rule-strong hover:border-ink hover:text-ink")
        }
      >
        {verified ? "✓ 본인확인 완료" : "본인확인 진행"}
      </button>

      <div className="flex-1 min-w-[260px]">
        <Eyebrow className="mb-1">응대 사유 (필수 · 감사로그 기록)</Eyebrow>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="예: 고객 문의 — 출금 거부 원인 확인"
          className="w-full bg-transparent border-b border-rule focus:outline-none focus:border-ink font-serif text-sm py-1"
        />
      </div>
    </header>
  );
}

export function ActionsBar() {
  type Item = { label: string; href?: Route; danger?: boolean; ghost?: boolean };
  const items: ReadonlyArray<Item> = [
    { label: "입금 처리",   href: "/customer/deposit" },
    { label: "출금 처리",   href: "/customer/withdraw" },
    { label: "이체 처리",   href: "/customer/transfer" },
    { label: "EDD 큐 →",   href: "/operator/edd",    ghost: true },
    { label: "감사 diff →", href: "/operator/audit-diff", ghost: true },
    { label: "정지",         danger: true },
    { label: "해지",         danger: true },
  ];
  return (
    <footer className="border border-rule-strong bg-paper p-3 flex gap-2 flex-wrap">
      <Eyebrow className="self-center mr-2">대리 처리 (BRANCH actor=OPERATOR)</Eyebrow>
      {items.map((it) => {
        const cls =
          "font-mono text-[11px] tracking-[0.04em] uppercase px-3 py-1.5 border " +
          (it.danger
            ? "bg-paper text-st-suspended border-st-suspended hover:bg-st-suspended hover:text-paper"
            : it.ghost
              ? "bg-paper text-ink-2 border-rule-strong hover:border-ink hover:text-ink"
              : "bg-ink text-paper border-ink");
        if (it.href) {
          return <Link key={it.label} href={it.href} className={cls}>{it.label}</Link>;
        }
        return <button key={it.label} className={cls}>{it.label}</button>;
      })}
    </footer>
  );
}
