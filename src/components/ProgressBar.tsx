import type { BadgeStatus } from "./StatusBadge";
import { STATUS_DOT_COLOR } from "./StatusBadge";

export function ProgressBar({
  done,
  total,
  status,
  width = "140px",
}: {
  done: number;
  total: number;
  status: BadgeStatus;
  width?: string;
}) {
  const pct = total === 0 ? 0 : Math.max(done > 0 ? 4 : 0, (done / total) * 100);
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-1.5 shrink-0 overflow-hidden rounded-full bg-bg-elevated" style={{ width }}>
        <div
          className={`h-1.5 rounded-full ${STATUS_DOT_COLOR[status]}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span className="whitespace-nowrap text-xs font-medium text-text-secondary">
        {done}/{total}
      </span>
    </div>
  );
}
