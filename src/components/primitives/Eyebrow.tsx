// Editorial label — small caps mono.
export function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={"font-mono text-[11px] tracking-[0.08em] uppercase text-ink-3 " + className}>{children}</div>;
}
