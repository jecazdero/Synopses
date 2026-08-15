import type { TranslationStatus } from "../types";

export type BadgeStatus = TranslationStatus | "Approved" | "Declined";

const STATUS_COLOR: Record<BadgeStatus, string> = {
  "To do": "bg-status-todo",
  "In progress": "bg-status-inprogress",
  Blocked: "bg-status-blocked",
  Review: "bg-status-review",
  Done: "bg-status-done",
  Approved: "bg-status-done",
  Declined: "bg-status-blocked",
};

export const STATUS_DOT_COLOR: Record<BadgeStatus, string> = STATUS_COLOR;

export function StatusBadge({ status, className = "" }: { status: BadgeStatus; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold text-text-primary whitespace-nowrap ${STATUS_COLOR[status]} ${className}`}
    >
      {status}
    </span>
  );
}

export function StatusDot({ status, className = "" }: { status: BadgeStatus; className?: string }) {
  return <span className={`inline-block size-[8px] rounded-full ${STATUS_COLOR[status]} ${className}`} />;
}

export function StatusLegend({ statuses }: { statuses: BadgeStatus[] }) {
  return (
    <div className="flex items-center gap-4">
      {statuses.map((s) => (
        <div key={s} className="flex items-center gap-1.5">
          <StatusDot status={s} />
          <span className="text-xs font-medium text-text-secondary">{s}</span>
        </div>
      ))}
    </div>
  );
}
