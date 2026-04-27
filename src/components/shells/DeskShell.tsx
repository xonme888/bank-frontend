// Sidebar + top header for backoffice / ops desktop screens.
"use client";
import type { ReactNode } from "react";

export type NavItem = { label: string; key: string; active?: boolean; badge?: number };

type Props = {
  route: string;
  traceId: string;
  nav: NavItem[];
  operator?: string;
  children: ReactNode;
};

export function DeskShell({ route, traceId, nav, operator = "컴플라이언스 매니저 · 박**", children }: Props) {
  return (
    <div className="grid grid-cols-[180px_1fr] min-h-[720px] bg-paper">
      <aside className="border-r border-rule bg-paper-2 py-4">
        <div className="px-4 pb-4 border-b border-rule">
          <div className="font-serif text-base font-medium">
            xbank<span className="text-ink-3">/ops</span>
          </div>
          <div className="font-mono text-[9px] tracking-[0.06em] text-ink-3 mt-0.5">
            BACKOFFICE · TELLER
          </div>
        </div>
        <nav className="py-3">
          {nav.map((n) => (
            <div
              key={n.key}
              className={
                "px-4 py-1.5 text-xs cursor-pointer flex justify-between items-center " +
                (n.active
                  ? "text-ink font-medium border-l-2 border-ink bg-paper"
                  : "text-ink-3 border-l-2 border-transparent")
              }
            >
              <span>{n.label}</span>
              {n.badge != null && (
                <span className="font-mono text-[10px] tnum text-st-edd-pending">{n.badge}</span>
              )}
            </div>
          ))}
        </nav>
      </aside>
      <div>
        <header className="flex items-center px-[18px] py-2.5 border-b border-rule gap-4">
          <div className="font-mono text-[10px] text-ink-3">{route}</div>
          <div className="ml-auto flex gap-3.5 items-center font-mono text-[10px] text-ink-3">
            <span>trace_id: <span className="text-ink">{traceId}</span></span>
            <span className="w-px h-3 bg-rule" />
            <span className="inline-flex items-center gap-1">
              <span className="w-[5px] h-[5px] rounded-full bg-st-active" />
              {operator}
            </span>
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
