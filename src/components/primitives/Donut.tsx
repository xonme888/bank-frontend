// 단일 SVG 도넛 (recharts 미도입). 두 비율만 비교하는 단순 케이스용.
// stroke-dasharray 트릭으로 호의 길이를 비율 만큼 그리고, 색은 token 변수 직접 받음.
type Props = {
  parts: ReadonlyArray<{ value: number; color: string; label: string }>;
  size?: number;
  thickness?: number;
};

export function Donut({ parts, size = 96, thickness = 12 }: Props) {
  const total = parts.reduce((s, p) => s + p.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const circ = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius}
              fill="none" stroke="var(--rule)" strokeWidth={thickness} />
      {parts.map((p, i) => {
        const length = (p.value / total) * circ;
        const dash = `${length} ${circ - length}`;
        const dashOffset = -offset;
        offset += length;
        return (
          <circle key={i} cx={size / 2} cy={size / 2} r={radius}
                  fill="none" stroke={p.color} strokeWidth={thickness}
                  strokeDasharray={dash} strokeDashoffset={dashOffset}
                  strokeLinecap="butt" />
        );
      })}
    </svg>
  );
}
