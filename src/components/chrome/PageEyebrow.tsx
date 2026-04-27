// 화면 헤더(허브 백링크 + Eyebrow 라벨)의 단일 공급원.
// SCREENS 카탈로그의 number·group을 그대로 재사용 — 16 화면이 동일 규약을 따른다.
import Link from "next/link";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { SCREENS, type ScreenGroup } from "@/lib/screens";

const EYEBROW_LABEL: Record<ScreenGroup, string> = {
  CUSTOMER: "CUSTOMER · MOBILE",
  OPERATOR: "OPERATOR · DESKTOP",
  Ops: "OPS · DESKTOP",
  DESIGN_SYSTEM: "DESIGN SYSTEM",
};

// `full`: customer/system 화면 (헤더가 본문과 같은 컨테이너 안)
// `deskshell`: operator/ops 화면 (헤더 영역이 DeskShell 위에 분리)
export function PageEyebrow({
  screenId,
  variant = "full",
}: {
  screenId: string;
  variant?: "full" | "deskshell";
}) {
  const s = SCREENS.find((x) => x.id === screenId);
  if (!s) return null;
  const margin = variant === "full" ? "mt-6 mb-3" : "mt-3 mb-1";
  return (
    <>
      <Link href="/" className="font-mono text-[11px] text-ink-3 hover:text-ink">
        ← all screens
      </Link>
      <Eyebrow className={margin}>
        SCREEN {s.n} · {EYEBROW_LABEL[s.group]}
      </Eyebrow>
    </>
  );
}
