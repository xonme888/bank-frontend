// Re-usable iPhone-shaped device frame for mobile screens.
import type { ReactNode } from "react";

export function Device({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div data-screen-label={label}>
      {label && (
        <div className="mb-3 font-mono text-[11px] text-ink-3 tracking-[0.06em]">
          {label}
        </div>
      )}
      <div className="w-[393px] h-[800px] bg-[#0a0a0a] rounded-[44px] p-2 shadow-[0_40px_80px_rgba(0,0,0,0.18)]">
        <div className="w-full h-full rounded-[36px] overflow-hidden relative bg-paper">
          {children}
        </div>
      </div>
    </div>
  );
}

export function DesktopFrame({ url, traceId, children }: { url: string; traceId: string; children: ReactNode }) {
  return (
    <div className="w-full max-w-[1280px] bg-paper border border-rule-strong shadow-[0_30px_60px_rgba(0,0,0,0.10)]">
      <div className="h-8 border-b border-rule flex items-center px-3.5 font-mono text-[11px] text-ink-3 tracking-[0.04em] bg-paper-2">
        <span>{url}</span>
        <span className="ml-auto">trace_id: {traceId}</span>
      </div>
      {children}
    </div>
  );
}

/** Wrap a screen in the page's outer mat (inkwell-grey). */
export function ScreenStage({ children, layout = "mobile" }: { children: ReactNode; layout?: "mobile" | "desktop" }) {
  return (
    <div className={"flex gap-8 justify-center flex-wrap p-10 bg-[#ece9e1] min-h-[calc(100vh-58px)] " + (layout === "desktop" ? "items-start" : "items-start")}>
      {children}
    </div>
  );
}
