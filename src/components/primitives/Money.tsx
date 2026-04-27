// Tabular-num money display.
type Props = {
  amount: number;
  size?: "sm" | "md" | "lg" | "xl";
  signed?: boolean;
  className?: string;
};

const SIZE = {
  sm: "text-sm",
  md: "text-lg",
  lg: "text-2xl",
  xl: "text-[48px] tracking-[-0.03em]",
};

export function Money({ amount, size = "md", signed = false, className = "" }: Props) {
  const sign = signed ? (amount > 0 ? "+" : amount < 0 ? "−" : "") : "";
  const abs = Math.abs(amount).toLocaleString("ko-KR");
  return (
    <span className={"font-sans tnum font-medium " + SIZE[size] + " " + className}>
      {sign}{abs}
      <span className="text-ink-3 font-normal ml-1 text-[0.55em]">원</span>
    </span>
  );
}
