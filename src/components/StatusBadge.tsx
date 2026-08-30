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

export type LegendFilter = BadgeStatus | "All";

export function StatusLegend({
  statuses,
  active,
  onChange,
  showAll = false,
}: {
  statuses: BadgeStatus[];
  /** Provide `active` + `onChange` to turn the legend into a click-to-filter control. */
  active?: LegendFilter;
  onChange?: (status: LegendFilter) => void;
  showAll?: boolean;
}) {
  const items: LegendFilter[] = showAll ? ["All", ...statuses] : statuses;

  return (
    <div className="flex items-center gap-4">
      {items.map((s) => {
        const isActive = active === s;
        const inner = (
          <>
            {s !== "All" && <StatusDot status={s} />}
            <span
              className={`text-xs font-medium ${
                onChange && isActive ? "text-text-primary" : "text-text-secondary"
              }`}
            >
              {s}
            </span>
          </>
        );

        if (!onChange) {
          return (
            <div key={s} className="flex items-center gap-1.5">
              {inner}
            </div>
          );
        }

        return (
          <button
            key={s}
            onClick={() => onChange(s)}
            className={`flex items-center gap-1.5 rounded-full transition-opacity ${
              isActive ? "opacity-100" : "opacity-60 hover:opacity-100"
            }`}
          >
            {inner}
          </button>
        );
      })}
    </div>
  );
}
