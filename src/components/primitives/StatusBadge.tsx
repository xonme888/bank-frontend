import { ACCOUNT_STATE_LABEL, ACCOUNT_STATE_TOKEN, type AccountState } from "@/lib/tokens";

export function StatusBadge({ state }: { state: AccountState }) {
  const c = ACCOUNT_STATE_TOKEN[state];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-1.5 py-[2px] border font-mono text-[10px] tracking-[0.04em] uppercase"
      style={{ borderColor: c, color: c }}
    >
      <span className="w-1 h-1 rounded-full" style={{ background: c }} />
      {ACCOUNT_STATE_LABEL[state]}
    </span>
  );
}
